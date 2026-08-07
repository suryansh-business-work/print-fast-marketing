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

# Hostnames this deployment is authoritative for.
mapfile -t OWNED_HOSTS < <(jq -r '.apps[] | .domain, (.aliases[]?)' "$MANIFEST" | strip_cr)

# Every hostname listed in any server_name directive in $1, one per line.
# Comments are stripped and newlines flattened first, so a directive is found
# wherever it sits — including single-line `server { server_name a b; }` blocks,
# which an anchored line match would miss entirely.
server_names_in() {
  sed 's/#.*//' "$1" 2>/dev/null \
    | tr '\n\t' '  ' \
    | grep -oE 'server_name[[:space:]]+[^;]*' \
    | sed 's/^server_name[[:space:]]*//' \
    | tr ' ' '\n' \
    | grep -v '^$' || true
}

# Does this vhost claim $2? Exact token match, so "print-fast.com" never
# matches "shop-app.print-fast.com".
claims_host() {
  server_names_in "$1" | grep -Fxq "$2"
}

# Take a vhost out of service without destroying its content.
#
# The two include directories need opposite treatment. Debian's nginx.conf pulls
# in `sites-enabled/*` with no extension filter, so renaming a file there still
# loads it — the entry has to go. conf.d is included as `conf.d/*.conf`, so
# renaming is exactly what takes it out.
disable_vhost() {
  local FILE="$1" REASON="$2" BASE
  BASE="$(basename "$FILE")"

  case "$FILE" in
    /etc/nginx/sites-enabled/*)
      if [[ ! -L "$FILE" ]]; then
        # A real file rather than the usual symlink — preserve it before removing.
        cp -f "$FILE" "/etc/nginx/sites-available/${BASE}.disabled"
        echo "    kept a copy at /etc/nginx/sites-available/${BASE}.disabled"
      fi
      rm -f "$FILE"
      ;;
    *)
      mv -f "$FILE" "${FILE}.disabled"
      ;;
  esac

  warn "disabled ${BASE}: ${REASON}"
}

# Evict foreign vhosts that would win over ours. Two ways that happens:
#   * another default_server, which collides with 00-default.conf outright;
#   * another block claiming a hostname we own — with duplicate server_name
#     nginx serves whichever block loads first, so a stale config elsewhere on
#     the box silently hijacks it.
#
# Both include directories are scanned: a distro nginx.conf pulls in
# sites-enabled/* AND conf.d/*.conf, and configs left by other projects
# frequently sit in the latter.
for CANDIDATE in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [[ -e "$CANDIDATE" ]] || continue
  BASE="$(basename "$CANDIDATE")"
  [[ -f "${HERE}/nginx/sites-available/${BASE}" ]] && continue   # one of ours

  if grep -qE '^\s*listen[^;]*default_server' "$CANDIDATE" 2>/dev/null; then
    disable_vhost "$CANDIDATE" "claims default_server, which collides with 00-default.conf"
    continue
  fi

  for HOST in ${OWNED_HOSTS[@]+"${OWNED_HOSTS[@]}"}; do
    if claims_host "$CANDIDATE" "$HOST"; then
      disable_vhost "$CANDIDATE" "it claims ${HOST}, which this deployment serves"
      break
    fi
  done
done

# If a hostname is still declared by a config we do not manage, the eviction
# above missed an include path. Surface it by name rather than leaving the next
# person to guess why a domain serves the wrong site.
for HOST in ${OWNED_HOSTS[@]+"${OWNED_HOSTS[@]}"}; do
  for OTHER in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
    [[ -e "$OTHER" ]] || continue
    BASE="$(basename "$OTHER")"
    [[ -f "${HERE}/nginx/sites-available/${BASE}" ]] && continue
    if claims_host "$OTHER" "$HOST"; then
      warn "${HOST} is still declared by ${OTHER} — it may take precedence over ours"
    fi
  done
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

# A hostname can only be certified if it actually resolves to this server;
# Let's Encrypt validates over HTTP against this box.
points_here() {
  local HOST="$1" IPS
  if [[ "$HOST" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then
    warn "${HOST} is an IP address — Let's Encrypt cannot certify it"
    return 1
  fi
  IPS="$(getent ahostsv4 "$HOST" | awk '{print $1}' | sort -u || true)"
  if [[ -z "$IPS" ]]; then
    warn "${HOST} has no A record yet — skipping (stays on HTTP)"
    return 1
  fi
  if ! printf '%s\n' "$IPS" | grep -Fxq "$FALLBACK_SERVER_NAME"; then
    warn "${HOST} resolves to ${IPS//$'\n'/, }, not ${FALLBACK_SERVER_NAME} — skipping"
    return 1
  fi
  return 0
}

for NAME in "${APP_NAMES[@]}"; do
  DOMAIN="$(jq -r --arg n "$NAME" '.apps[] | select(.name == $n) | .domain' "$MANIFEST" | strip_cr)"
  [[ -n "$DOMAIN" && "$DOMAIN" != "null" ]] || continue

  # The canonical domain plus any aliases (e.g. www) share one certificate.
  CERT_DOMAINS=()
  points_here "$DOMAIN" && CERT_DOMAINS+=("$DOMAIN")
  while IFS= read -r ALIAS; do
    [[ -z "$ALIAS" ]] && continue
    points_here "$ALIAS" && CERT_DOMAINS+=("$ALIAS")
  done < <(jq -r --arg n "$NAME" '.apps[] | select(.name == $n) | .aliases[]?' "$MANIFEST" | strip_cr)

  if [[ ${#CERT_DOMAINS[@]} -eq 0 ]]; then
    warn "no certifiable hostname for ${NAME} — skipping certbot"
    continue
  fi

  # --cert-name uses the app name, not the domain: this VPS already carried a
  # lineage literally called "print-fast.com" belonging to another project,
  # which also covered shop-app.print-fast.com. Reusing it would have tied our
  # renewals to a hostname that resolves elsewhere and cannot be validated here.
  # --expand lets a newly added alias join our own certificate.
  CERTBOT_ARGS=(--nginx --cert-name "$NAME" --non-interactive --agree-tos
                --redirect --keep-until-expiring --expand)
  for CERT_DOMAIN in "${CERT_DOMAINS[@]}"; do
    CERTBOT_ARGS+=(-d "$CERT_DOMAIN")
  done

  if [[ -n "${CERTBOT_EMAIL:-}" ]]; then
    CERTBOT_ARGS+=(-m "$CERTBOT_EMAIL")
  else
    CERTBOT_ARGS+=(--register-unsafely-without-email)
  fi

  if certbot "${CERTBOT_ARGS[@]}"; then
    echo "  ${CERT_DOMAINS[*]} secured."
  else
    warn "certbot failed for ${CERT_DOMAINS[*]} — they stay reachable over HTTP"
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
