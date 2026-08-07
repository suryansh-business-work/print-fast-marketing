#!/usr/bin/env node
/**
 * TLS certificate management for every domain in deploy/apps.json.
 *
 *   pnpm ssl:issue        issue/expand certificates for all domains
 *   pnpm ssl:renew        renew anything within 30 days of expiry
 *   pnpm ssl:renew:dry    rehearse renewal without touching Let's Encrypt quota
 *   pnpm ssl:status       list installed certificates and expiry dates
 *   pnpm ssl:timer        show the state of certbot's automatic renewal timer
 *   pnpm remote:status    containers + nginx health on the VPS
 *
 * Renewal is already automatic on the server (certbot.timer, installed by
 * deploy/remote/provision.sh, with a deploy hook that reloads Nginx). These
 * commands are for forcing, inspecting and recovering.
 *
 * Connection settings come from the repo .env (or the environment):
 *   DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_PASSWORD (blank = use your SSH key),
 *   CERTBOT_EMAIL
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// --- tiny .env reader (no dependency, values already in the environment win) --
const loadEnvFile = () => {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
};
loadEnvFile();

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'deploy', 'apps.json'), 'utf8'));

const HOST = process.env.DEPLOY_HOST || manifest.server.host;
const USER = process.env.DEPLOY_USER || manifest.server.user;
const PASSWORD = process.env.DEPLOY_SSH_PASSWORD || '';
const EMAIL = process.env.CERTBOT_EMAIL || '';

const domains = manifest.apps
  .map((app) => app.domain)
  .filter((d) => d && !/^\d+(\.\d+){3}$/.test(d));

const has = (bin) =>
  spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { stdio: 'ignore' })
    .status === 0;

/** Run a command on the VPS, streaming its output. */
const remote = (script) => {
  const sshArgs = [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ServerAliveInterval=30',
    `${USER}@${HOST}`,
    'bash -s',
  ];

  let bin = 'ssh';
  let args = sshArgs;

  if (PASSWORD) {
    if (!has('sshpass')) {
      console.error(
        'DEPLOY_SSH_PASSWORD is set but `sshpass` is not installed.\n' +
          'Install sshpass, or clear DEPLOY_SSH_PASSWORD to use key-based auth.\n\n' +
          `Run this on the server instead:\n\n${script}\n`
      );
      process.exit(1);
    }
    bin = 'sshpass';
    args = ['-e', 'ssh', ...sshArgs];
  }

  if (!has('ssh')) {
    console.error(`\`ssh\` not found on PATH. Run this on ${HOST} manually:\n\n${script}\n`);
    process.exit(1);
  }

  const result = spawnSync(bin, args, {
    input: script,
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env, SSHPASS: PASSWORD },
  });
  process.exit(result.status ?? 1);
};

const shellQuote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const commands = {
  issue() {
    const emailFlag = EMAIL
      ? `-m ${shellQuote(EMAIL)}`
      : '--register-unsafely-without-email';

    const perDomain = domains
      .map(
        (domain) => `
echo "--- ${domain} ---"
IPS="$(getent ahostsv4 ${shellQuote(domain)} | awk '{print $1}' | sort -u || true)"
if [ -z "$IPS" ]; then
  echo "  no A record yet — skipping"
elif ! printf '%s\\n' "$IPS" | grep -Fxq ${shellQuote(HOST)}; then
  echo "  points at $IPS, not ${HOST} — skipping"
else
  certbot --nginx -d ${shellQuote(domain)} --non-interactive --agree-tos \\
    --redirect --keep-until-expiring ${emailFlag} || echo "  certbot failed for ${domain}"
fi`
      )
      .join('\n');

    return `set -euo pipefail\n${perDomain}\nnginx -t && systemctl reload nginx\necho "done."`;
  },

  renew(argv) {
    const dry = argv.includes('--dry-run') ? ' --dry-run' : '';
    return [
      'set -euo pipefail',
      `certbot renew${dry} --deploy-hook 'systemctl reload nginx'`,
      'nginx -t',
      dry ? 'echo "dry run complete — nothing was renewed."' : 'systemctl reload nginx',
    ].join('\n');
  },

  status: () => 'certbot certificates',

  timer: () =>
    [
      'systemctl status certbot.timer --no-pager || true',
      'echo',
      'systemctl list-timers certbot.timer --no-pager || true',
    ].join('\n'),

  'remote-status': () =>
    [
      'set -uo pipefail',
      'echo "--- containers ---"',
      'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
      'echo',
      'echo "--- nginx ---"',
      'nginx -t',
      'systemctl is-active nginx',
      'echo',
      'echo "--- local health ---"',
      ...manifest.apps.map(
        (app) =>
          `printf '%-18s ' ${shellQuote(app.name)}; curl -fsS --max-time 4 ` +
          `http://127.0.0.1:${app.hostPort}${app.healthPath} >/dev/null && echo OK || echo FAIL`
      ),
    ].join('\n'),
};

const [command = '', ...rest] = process.argv.slice(2);
const handler = commands[command];

if (!handler) {
  console.error(
    `Usage: node scripts/ssl.mjs <${Object.keys(commands).join('|')}> [--dry-run]\n\n` +
      `Target: ${USER}@${HOST}\n` +
      `Domains: ${domains.join(', ')}`
  );
  process.exit(1);
}

console.log(`> ${command} on ${USER}@${HOST}  (${domains.length} domain(s))\n`);
remote(handler(rest));
