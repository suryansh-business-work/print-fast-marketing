#!/usr/bin/env bash
#
# Idempotent VPS provisioner for the whole PrintFast platform.
#
# Runs ON the server. Everything it does is derived from deploy/apps.json, so
# adding an app to that manifest (plus its Dockerfile and DNS record) is all it
# takes to get a container, an Nginx vhost and a TLS certificate.
#
# Expects, in the directory this script is run from:
#   apps.json                 the manifest
#   nginx/snippets/*.conf     routing snippets (rewritten every deploy)
#   nginx/sites-available/*   vhosts (installed only when missing)
#   deploy.env                secrets, mode 600, sourced then removed
#
# Environment:
#   IMAGE_TAG            tag to deploy (usually the commit SHA)
#   DOCKERHUB_USERNAME   registry login
#   DOCKERHUB_TOKEN      registry password/token
#   CERTBOT_EMAIL        optional; registers without an email when unset
#   ONLY_APPS            optional space-separated subset of app names

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${HERE}/apps.json"
ENV_FILE="${HERE}/deploy.env"

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m  ! %s\033[0m\n' "$*"; }

# Strip a trailing CR so a CRLF-committed manifest still parses cleanly.
strip_cr() { tr -d '\r'; }

[[ -f "$MANIFEST" ]] || { echo "provision: apps.json not found in ${HERE}"; exit 1; }

# Secrets arrive in a 600 file rather than the process table or the SSH command.
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

: "${IMAGE_TAG:?IMAGE_TAG is required}"

export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# Host prerequisites
# ---------------------------------------------------------------------------
log "Installing host prerequisites"
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg jq nginx certbot python3-certbot-nginx >/dev/null

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

systemctl enable --now docker
systemctl enable --now nginx

mkdir -p /var/www/certbot /etc/nginx/snippets

NAMESPACE="$(jq -r '.registry.namespace' "$MANIFEST" | strip_cr)"
FALLBACK_SERVER_NAME="$(jq -r '.server.fallbackServerName' "$MANIFEST" | strip_cr)"

if [[ -n "${DOCKERHUB_USERNAME:-}" && -n "${DOCKERHUB_TOKEN:-}" ]]; then
  printf '%s' "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin >/dev/null
fi

# Which apps to touch this run.
mapfile -t APP_NAMES < <(jq -r '.apps[].name' "$MANIFEST" | strip_cr)
if [[ -n "${ONLY_APPS:-}" ]]; then
  read -r -a REQUESTED <<< "$ONLY_APPS"
  APP_NAMES=("${REQUESTED[@]}")
fi

# ---------------------------------------------------------------------------
# Containers
#
# A failing app is recorded rather than aborting the run: Nginx and TLS still
# get configured for everything else, so (say) a missing ROAS secret cannot take
# the websites' routing and certificates down with it. The script still exits
# non-zero at the end so CI goes red.
# ---------------------------------------------------------------------------
FAILED_APPS=()

for NAME in "${APP_NAMES[@]}"; do
  APP="$(jq -c --arg n "$NAME" '.apps[] | select(.name == $n)' "$MANIFEST")"
  [[ -n "$APP" ]] || { warn "no manifest entry for '${NAME}' — skipping"; continue; }

  IMAGE="$(jq -r '.image' <<< "$APP" | strip_cr)"
  HOST_PORT="$(jq -r '.hostPort' <<< "$APP" | strip_cr)"
  CONTAINER_PORT="$(jq -r '.containerPort' <<< "$APP" | strip_cr)"
  HEALTH_PATH="$(jq -r '.healthPath' <<< "$APP" | strip_cr)"
  IMAGE_REF="${NAMESPACE}/${IMAGE}:${IMAGE_TAG}"

  log "Deploying ${NAME} (${IMAGE_REF} -> 127.0.0.1:${HOST_PORT})"
  if ! docker pull -q "$IMAGE_REF"; then
    warn "${NAME}: could not pull ${IMAGE_REF} — leaving the current container in place"
    FAILED_APPS+=("$NAME")
    continue
  fi

  # Resolve the manifest's env list, expanding @secret:NAME from the environment.
  RUN_ARGS=()
  while IFS= read -r ENTRY; do
    [[ -z "$ENTRY" ]] && continue
    KEY="${ENTRY%%=*}"
    VALUE="${ENTRY#*=}"
    if [[ "$VALUE" == @secret:* ]]; then
      SECRET_NAME="${VALUE#@secret:}"
      VALUE="${!SECRET_NAME:-}"
      if [[ -z "$VALUE" ]]; then
        warn "${NAME}: secret ${SECRET_NAME} is empty — leaving it unset in the container"
        continue
      fi
    fi
    RUN_ARGS+=(-e "${KEY}=${VALUE}")
  done < <(jq -r '.env[]?' <<< "$APP" | strip_cr)

  while IFS= read -r VOLUME; do
    [[ -z "$VOLUME" ]] && continue
    RUN_ARGS+=(-v "$VOLUME")
  done < <(jq -r '.volumes[]?' <<< "$APP" | strip_cr)

  docker rm -f "$NAME" >/dev/null 2>&1 || true
  if ! docker run -d \
    --name "$NAME" \
    --restart unless-stopped \
    -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
    "${RUN_ARGS[@]}" \
    "$IMAGE_REF" >/dev/null; then
    warn "${NAME}: docker run failed"
    FAILED_APPS+=("$NAME")
    continue
  fi

  printf '  waiting for health on 127.0.0.1:%s%s' "$HOST_PORT" "$HEALTH_PATH"
  HEALTHY=0
  for _ in $(seq 1 45); do
    if curl -fsS --max-time 3 "http://127.0.0.1:${HOST_PORT}${HEALTH_PATH}" >/dev/null 2>&1; then
      HEALTHY=1
      break
    fi
    printf '.'
    sleep 2
  done
  printf '\n'

  if [[ "$HEALTHY" -ne 1 ]]; then
    warn "${NAME} failed its health check — see the logs below"
    docker ps -a --filter "name=${NAME}" || true
    docker logs --tail 120 "$NAME" 2>&1 | sed 's/^/    /' || true
    FAILED_APPS+=("$NAME")
    continue
  fi
  echo "  ${NAME} healthy."
done

# ---------------------------------------------------------------------------
# Nginx
# ---------------------------------------------------------------------------
log "Installing Nginx configuration"

# Retire artifacts from the pre-monorepo deploy. The old vhost also declares
# `listen 80 default_server`, so leaving it enabled makes `nginx -t` fail with
# "a duplicate default server for 0.0.0.0:80".
while IFS= read -r SITE; do
  [[ -z "$SITE" ]] && continue
  if [[ -e "/etc/nginx/sites-enabled/${SITE}" || -e "/etc/nginx/sites-available/${SITE}" ]]; then
    rm -f "/etc/nginx/sites-enabled/${SITE}" "/etc/nginx/sites-available/${SITE}"
    echo "  retired legacy vhost ${SITE}"
  fi
done < <(jq -r '.legacy.nginxSites[]?' "$MANIFEST" | strip_cr)

while IFS= read -r LEGACY_CONTAINER; do
  [[ -z "$LEGACY_CONTAINER" ]] && continue
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$LEGACY_CONTAINER"; then
    docker rm -f "$LEGACY_CONTAINER" >/dev/null 2>&1 || true
    echo "  removed legacy container ${LEGACY_CONTAINER}"
  fi
done < <(jq -r '.legacy.containers[]?' "$MANIFEST" | strip_cr)

# Drop certificates for domains we no longer serve, so certbot.timer stops
# trying to renew them (a renewal for an unserved domain fails every run).
while IFS= read -r LEGACY_CERT; do
  [[ -z "$LEGACY_CERT" ]] && continue
  if certbot certificates 2>/dev/null | grep -qE "Certificate Name: ${LEGACY_CERT}$"; then
    certbot delete --cert-name "$LEGACY_CERT" --non-interactive >/dev/null 2>&1 \
      && echo "  deleted certificate ${LEGACY_CERT}" \
      || warn "could not delete certificate ${LEGACY_CERT}"
  fi
done < <(jq -r '.legacy.certificates[]?' "$MANIFEST" | strip_cr)

rm -f /etc/nginx/sites-enabled/default

# Anything else still claiming default_server would collide with 00-default.conf.
# Only disable (unlink) it — the file stays in sites-available for inspection.
for ENABLED in /etc/nginx/sites-enabled/*; do
  [[ -e "$ENABLED" ]] || continue
  BASE="$(basename "$ENABLED")"
  [[ "$BASE" == "00-default.conf" ]] && continue
  if grep -qE '^\s*listen[^;]*default_server' "$ENABLED" 2>/dev/null; then
    rm -f "$ENABLED"
    warn "disabled ${BASE}: it claims default_server, which collides with 00-default.conf"
  fi
done

# Snippets hold all routing and are always refreshed.
install -m 0644 "${HERE}"/nginx/snippets/*.conf /etc/nginx/snippets/

# Vhosts are only created when missing, so certbot's TLS edits survive deploys.
for VHOST in "${HERE}"/nginx/sites-available/*.conf; do
  BASENAME="$(basename "$VHOST")"
  TARGET="/etc/nginx/sites-available/${BASENAME}"
  if [[ -f "$TARGET" ]] && grep -q 'ssl_certificate' "$TARGET"; then
    echo "  keeping ${BASENAME} (certbot-managed)"
  else
    install -m 0644 "$VHOST" "$TARGET"
    echo "  installed ${BASENAME}"
  fi
  ln -sf "$TARGET" "/etc/nginx/sites-enabled/${BASENAME}"
done

if ! nginx -t; then
  echo
  warn "Nginx rejected the configuration; the previous config is still live."
  warn "Enabled vhosts:"
  ls -l /etc/nginx/sites-enabled/ | sed 's/^/    /'
  exit 1
fi
systemctl reload nginx

printf '  verifying host proxy for %s' "$FALLBACK_SERVER_NAME"
for _ in $(seq 1 15); do
  if curl -fsS --max-time 3 -H "Host: ${FALLBACK_SERVER_NAME}" "http://127.0.0.1/healthz" >/dev/null 2>&1; then
    break
  fi
  printf '.'
  sleep 2
done
printf '\n'

# ---------------------------------------------------------------------------
# TLS
# ---------------------------------------------------------------------------
log "Issuing / renewing TLS certificates"

for NAME in "${APP_NAMES[@]}"; do
  DOMAIN="$(jq -r --arg n "$NAME" '.apps[] | select(.name == $n) | .domain' "$MANIFEST" | strip_cr)"
  [[ -n "$DOMAIN" && "$DOMAIN" != "null" ]] || continue

  if [[ "$DOMAIN" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then
    warn "${DOMAIN} is an IP address — Let's Encrypt cannot certify it, skipping"
    continue
  fi

  DOMAIN_IPS="$(getent ahostsv4 "$DOMAIN" | awk '{print $1}' | sort -u || true)"
  if [[ -z "$DOMAIN_IPS" ]]; then
    warn "${DOMAIN} has no A record yet — skipping certbot (site stays on HTTP)"
    continue
  fi
  if ! printf '%s\n' "$DOMAIN_IPS" | grep -Fxq "$FALLBACK_SERVER_NAME"; then
    warn "${DOMAIN} resolves to ${DOMAIN_IPS//$'\n'/, }, not ${FALLBACK_SERVER_NAME} — skipping certbot"
    continue
  fi

  CERTBOT_ARGS=(--nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect --keep-until-expiring)
  if [[ -n "${CERTBOT_EMAIL:-}" ]]; then
    CERTBOT_ARGS+=(-m "$CERTBOT_EMAIL")
  else
    CERTBOT_ARGS+=(--register-unsafely-without-email)
  fi

  if certbot "${CERTBOT_ARGS[@]}"; then
    echo "  ${DOMAIN} secured."
  else
    warn "certbot failed for ${DOMAIN} — it stays reachable over HTTP"
  fi
done

# Certbot's own systemd timer handles renewal; the deploy hook makes sure Nginx
# picks up a freshly renewed certificate without a manual reload.
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/usr/bin/env bash
systemctl reload nginx
HOOK
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
systemctl enable --now certbot.timer >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
rm -f "$ENV_FILE"

log "Done"
for NAME in "${APP_NAMES[@]}"; do
  DOMAIN="$(jq -r --arg n "$NAME" '.apps[] | select(.name == $n) | .domain' "$MANIFEST" | strip_cr)"
  STATUS="ok"
  for BAD in ${FAILED_APPS[@]+"${FAILED_APPS[@]}"}; do
    [[ "$BAD" == "$NAME" ]] && STATUS="FAILED"
  done
  printf '  %-8s %-16s -> https://%s\n' "$STATUS" "$NAME" "$DOMAIN"
done

if [[ ${#FAILED_APPS[@]} -gt 0 ]]; then
  echo
  warn "${#FAILED_APPS[@]} app(s) failed: ${FAILED_APPS[*]}"
  warn "Everything else was deployed, and Nginx/TLS is configured for all domains."
  exit 1
fi
