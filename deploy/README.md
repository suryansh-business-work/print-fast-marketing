# Deployment — print-fast-marketing.exyconn.com

Auto-deploys on every push to `main` via GitHub Actions →
rsync over SSH → `root@148.135.136.107:/var/www/print-fast-marketing`.

---

## 1. One-time server setup (run on `148.135.136.107`)

```bash
ssh root@148.135.136.107

# Install nginx + certbot if not already
apt update
apt install -y nginx certbot python3-certbot-nginx rsync

# Create web root
mkdir -p /var/www/print-fast-marketing
chown -R www-data:www-data /var/www/print-fast-marketing

# Drop nginx config
# Copy contents of deploy/nginx/print-fast-marketing.exyconn.com.conf to:
#   /etc/nginx/sites-available/print-fast-marketing.exyconn.com.conf

# Enable site
ln -s /etc/nginx/sites-available/print-fast-marketing.exyconn.com.conf \
      /etc/nginx/sites-enabled/print-fast-marketing.exyconn.com.conf

# IMPORTANT: Comment out the two `ssl_certificate*` lines BEFORE first nginx test
#            (certbot will write real cert paths in step below)
# OR temporarily comment out the entire HTTPS server block.

nginx -t && systemctl reload nginx

# Issue SSL certificate (DNS must already point to this server — confirmed ✅)
certbot --nginx -d print-fast-marketing.exyconn.com \
        --non-interactive --agree-tos -m admin@exyconn.com --redirect

# Auto-renewal is enabled by default via systemd timer:
systemctl status certbot.timer
```

---

## 2. SSH key setup for GitHub Actions

On the server (one-time):

```bash
# Generate a deploy-only key (no passphrase)
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-print-fast"

# Add public key to authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Print the PRIVATE key — copy this into GitHub
cat ~/.ssh/github_deploy
```

---

## 3. GitHub repository secret

Go to **GitHub → Repo → Settings → Secrets and variables → Actions → New secret**:

| Name              | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| `SSH_PRIVATE_KEY` | Paste the full output of `~/.ssh/github_deploy` (incl. `-----BEGIN…`) |

That's it — host, user, and path are baked into `.github/workflows/deploy.yml`.

---

## 4. Deploy

```bash
git add .
git commit -m "deploy: initial setup"
git push origin main
```

Watch the run at **GitHub → Actions tab**. On success, site is live at:
👉 **https://print-fast-marketing.exyconn.com**

---

## 5. Manual deploy (if needed)

GitHub → Actions → **Build & Deploy to Exyconn** → **Run workflow**.

---

## 6. Troubleshooting

| Issue | Fix |
| ----- | --- |
| `Permission denied (publickey)` | Re-check `SSH_PRIVATE_KEY` secret matches server's `authorized_keys` |
| `nginx: [emerg] cannot load certificate` | Run certbot first (step 1) — cert files don't exist yet |
| 502 / blank page | `ls /var/www/print-fast-marketing` — should contain `index.html` |
| Old content shows | Browser cache — hard reload (Ctrl+F5); CDN/proxy cache may take 1 hr |
| Workflow times out on rsync | Server firewall blocking GitHub IPs — open port 22 |

---

## 7. Architecture

```
GitHub push (main)
    ↓
GitHub Actions runner (ubuntu-latest)
    ├─ npm ci
    ├─ npm run build         → ./dist
    └─ rsync ./dist/ → server:/var/www/print-fast-marketing/
                                    ↓
                              nginx serves static files
                                    ↓
                  https://print-fast-marketing.exyconn.com
```
