# Deployment

Four apps, one VPS, one pipeline. Every push to `main` builds all four images and
provisions the server.

| App | Container / host port | Domain | Health |
| --- | --- | --- | --- |
| `print-fast-main` | 127.0.0.1:9000 | `marketing.print-fast.com` | `/healthz` |
| `print-fast-shop` | 127.0.0.1:9001 | `shop.print-fast.com` | `/healthz` |
| `roas-client` | 127.0.0.1:9002 | `roas.print-fast.com` | `/` |
| `roas-server` | 127.0.0.1:9003 | `roas-server.print-fast.com` | `/api/v1/health` |

Containers only ever bind to loopback. Host Nginx terminates TLS and proxies.

## `apps.json` is the single source of truth

`deploy/apps.json` drives the CI build matrix, the container run arguments, the
Nginx vhosts, the certbot domains and the SSL scripts.

**To add an app:** add an entry to `apps.json`, add its `Dockerfile`, point a DNS
A record at the VPS. Nothing else changes — not the workflow, not the
provisioner, not the Nginx config.

`env` values written as `@secret:NAME` are resolved from GitHub Actions secrets
at deploy time and never appear in the repo or in a command line.

## Flow

```text
git push main
  └─ prepare   read apps.json -> build matrix
  └─ build     4 parallel docker builds (context = repo root) -> Docker Hub
  └─ deploy    render Nginx -> scp payload -> bash provision.sh on the VPS
                 ├─ pull + restart each container, wait for health
                 ├─ install Nginx snippets + vhosts, reload
                 └─ certbot per domain, enable certbot.timer
```

Docker build context is the **repo root** for every image, because the two Astro
apps compile against `packages/common`.

## Nginx layout

`scripts/render-nginx.mjs` generates two files per app into `deploy/nginx/`
(committed, so the server's config is reviewable in the repo):

- `snippets/pf-<app>.conf` — proxy target, ACME challenge root, redirects, body
  size. **Rewritten on every deploy.**
- `sites-available/<domain>.conf` — the vhost, which just `include`s the
  snippet. **Only written when it does not already exist**, because certbot
  edits this file when it installs TLS. Volatile config lives in the snippet so
  changes still land without clobbering certbot's work.

Plus `00-default.conf`, the catch-all for requests arriving by IP.

Regenerate locally with `pnpm nginx:render`.

## GitHub Actions secrets

Settings → Secrets and variables → Actions.

| Secret | Required | Used for |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Yes | Registry login |
| `DOCKERHUB_TOKEN` | Yes | Registry login |
| `SSH_PASSWORD` | Yes | VPS root SSH |
| `MONGODB_URI` | Yes | ROAS server → MongoDB Atlas |
| `SESSION_SECRET` | Yes | ROAS session signing |
| `JWT_SECRET` | Yes | ROAS token signing |
| `GOD_USER_EMAIL` | Yes | ROAS seeded super-admin |
| `GOD_USER_PASSWORD` | Yes | ROAS seeded super-admin |
| `CERTBOT_EMAIL` | Recommended | Let's Encrypt expiry notices |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | If email is used | ROAS outbound mail |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINTS` | If uploads are used | ROAS image hosting |
| `VITE_GOOGLE_MAPS_API_KEY` | If maps are used | ROAS client (build-time) |
| `OPENAI_API_KEY` | Optional | ROAS (future) |
| `SERVICE_TITAN_APP_KEY` | Optional | ROAS integrations |

Empty or unset secrets are skipped rather than passed as empty strings.

Optional repository **variables**: `DEPLOY_HOST`, `DEPLOY_USER` (default to the
values in `apps.json`).

## DNS

All four records must be `A` → `31.220.49.107`:

```text
marketing.print-fast.com.    A  31.220.49.107
shop.print-fast.com.         A  31.220.49.107
roas.print-fast.com.         A  31.220.49.107
roas-server.print-fast.com.  A  31.220.49.107
```

Certbot is skipped (with a warning, not a failure) for any domain whose A record
is missing or points elsewhere — the deploy still completes and the site stays
reachable over HTTP. Re-run the workflow, or `pnpm ssl:issue`, once DNS lands.

If public DNS shows `ns1.messagingengine.com` / `ns2.messagingengine.com` as the
nameservers, add the records in the Messaging Engine/Fastmail panel — adding them
only in NameSecure's zone will not publish them.

## TLS

Renewal is automatic on the server: `certbot.timer` plus a deploy hook that
reloads Nginx. The scripts below are for forcing, inspecting and recovering.

```bash
pnpm ssl:status       # installed certificates and expiry dates
pnpm ssl:timer        # state of the automatic renewal timer
pnpm ssl:renew:dry    # rehearse renewal (no quota consumed)
pnpm ssl:renew        # renew anything expiring within 30 days
pnpm ssl:issue        # issue/expand certificates for all domains in apps.json
pnpm remote:status    # containers + nginx + per-app health on the VPS
```

They read `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_PASSWORD` / `CERTBOT_EMAIL`
from the repo `.env`. Leave `DEPLOY_SSH_PASSWORD` blank to use key-based auth;
setting it requires `sshpass` on your machine.

## Deploying a subset

Actions → **Build & Deploy Platform** → **Run workflow**, and set *apps* to a
space-separated list:

```text
roas-client roas-server
```

Blank deploys everything.

## Manual checks on the VPS

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
curl -I http://127.0.0.1:9000/healthz          # marketing
curl -I http://127.0.0.1:9001/healthz          # shop
curl -I http://127.0.0.1:9003/api/v1/health    # roas api
nginx -t && systemctl status nginx
certbot certificates
```

## Legacy URLs

The shop used to live at `marketing.print-fast.com/shop-print-fast/*`. The
marketing vhost 301-redirects that whole prefix to `https://shop.print-fast.com/`
(configured under `redirects` in `apps.json`), so old links and search rankings
carry over.
