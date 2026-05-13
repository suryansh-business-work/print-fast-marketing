# Deployment

This project deploys on every push to `main` using GitHub Actions.

The workflow builds the Astro site into a Docker image, pushes the image to Docker Hub, then SSHes into the VPS at `31.220.49.107` and runs the image behind host Nginx.

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
```

## GitHub Actions secrets

Create these in GitHub under **Settings -> Secrets and variables -> Actions -> New repository secret**.

| Secret | Required | Notes |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Yes | Docker Hub username, for example `exyconnprintfast` |
| `DOCKERHUB_TOKEN` | Yes | Docker Hub access token or PAT |
| `SSH_PASSWORD` | Yes | VPS root SSH password |
| `SITE_DOMAIN` | Optional | Domain for HTTPS, for example `marketing.print-fast.com` |
| `CERTBOT_EMAIL` | Optional | Email used by Let's Encrypt when `SITE_DOMAIN` is set |

## HTTPS note

Certbot/Let's Encrypt cannot issue a valid TLS certificate for a bare IP address. Without `SITE_DOMAIN` and `CERTBOT_EMAIL`, the workflow still deploys to the VPS and serves the site at:

```text
http://31.220.49.107
```

To enable HTTPS, point a domain's DNS `A` record to `31.220.49.107`, add `SITE_DOMAIN` and `CERTBOT_EMAIL` secrets, then push to `main` again or run the workflow manually.

## Manual run

GitHub -> Actions -> **Build Docker Image & Deploy to VPS** -> **Run workflow**.

## Server checks

On the VPS:

```bash
docker ps --filter name=print-fast-marketing
curl -I http://127.0.0.1:8080/healthz
nginx -t
systemctl status nginx
```

The running container is named `print-fast-marketing` and listens only on localhost port `8080`. Public traffic should go through host Nginx.
