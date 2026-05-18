# Deployment

This project deploys on every push to `main` using GitHub Actions.

The workflow builds the Astro site into a Docker image, pushes the image to Docker Hub, then SSHes into the VPS at `31.220.49.107` and runs the image behind host Nginx for `marketing.print-fast.com`.

## Files

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage Astro build with Nginx runtime |
| `.dockerignore` | Keeps local/generated files out of the Docker build context |
| `deploy/nginx/container.conf` | Nginx config baked into the container |
| `.github/workflows/deploy.yml` | Push-triggered build, push, and VPS deploy workflow |

## Deployment flow

```text
git push main
  -> GitHub Actions
  -> docker build
  -> docker push exyconnprintfast/print-fast-marketing-website:<commit-sha>
  -> SSH root@31.220.49.107
  -> install Docker, Nginx, Certbot if needed
  -> docker pull and restart container on 127.0.0.1:8080
  -> host Nginx reverse proxies public HTTP traffic to the container
  -> Certbot issues HTTPS for marketing.print-fast.com
```

## GitHub Actions secrets

Create these in GitHub under **Settings -> Secrets and variables -> Actions -> New repository secret**.

| Secret | Required | Notes |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Yes | Docker Hub username, for example `exyconnprintfast` |
| `DOCKERHUB_TOKEN` | Yes | Docker Hub access token or PAT |
| `SSH_PASSWORD` | Yes | VPS root SSH password |
| `CERTBOT_EMAIL` | Optional | Email used by Let's Encrypt. If omitted, Certbot registers without email. |

## DNS and HTTPS note

Certbot/Let's Encrypt cannot issue a valid TLS certificate for a bare IP address. The workflow always keeps the site available by IP at:

```text
http://31.220.49.107
```

For `https://marketing.print-fast.com` to work, the authoritative DNS provider for `print-fast.com` must have this record:

```text
marketing.print-fast.com.  A  31.220.49.107
```

If the A record is not ready yet, the deployment workflow still publishes the container and verifies the IP route. Certbot and public domain checks are skipped until DNS points to the VPS.

If public DNS shows `ns1.messagingengine.com` and `ns2.messagingengine.com` as the nameservers, add the A record in the Messaging Engine/Fastmail DNS panel. Adding it only in NameSecure's zone will not publish the record unless NameSecure is the active nameserver provider.

## Manual run

GitHub -> Actions -> **Build Docker Image & Deploy to VPS** -> **Run workflow**.

## Server checks

On the VPS:

```bash
docker ps --filter name=print-fast-marketing
curl -I http://127.0.0.1:8080/healthz
curl -I http://31.220.49.107/healthz
curl -I https://marketing.print-fast.com/healthz
nginx -t
systemctl status nginx
```

The running container is named `print-fast-marketing` and listens only on localhost port `8080`. Public traffic should go through host Nginx.
