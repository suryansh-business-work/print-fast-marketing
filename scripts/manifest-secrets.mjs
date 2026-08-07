#!/usr/bin/env node
/**
 * Lists every secret name referenced as "@secret:NAME" in deploy/apps.json,
 * one per line.
 *
 * Used by the deploy workflow's preflight, and by CI to assert that
 * .github/workflows/deploy.yml exposes each of them — GitHub rejects any
 * workflow containing `toJSON(secrets)`, so every secret must be wired
 * explicitly and the two files have to stay in step.
 *
 *   node scripts/manifest-secrets.mjs           # names, one per line
 *   node scripts/manifest-secrets.mjs --check   # verify deploy.yml exposes them
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'deploy', 'apps.json'), 'utf8'));

const referenced = new Set();
for (const app of manifest.apps ?? []) {
  for (const entry of app.env ?? []) {
    const marker = entry.indexOf('@secret:');
    if (marker !== -1) referenced.add(entry.slice(marker + '@secret:'.length).trim());
  }
  for (const value of Object.values(app.buildArgs ?? {})) {
    if (typeof value === 'string' && value.startsWith('@secret:')) {
      referenced.add(value.slice('@secret:'.length).trim());
    }
  }
}

const names = [...referenced].sort();

if (!process.argv.includes('--check')) {
  console.log(names.join('\n'));
  process.exit(0);
}

// --check: every referenced secret must appear as `${{ secrets.NAME }}`.
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');

// Comments legitimately mention toJSON(secrets) to explain why it is banned,
// so only real YAML content is scanned for it.
const workflowCode = workflow
  .split(/\r?\n/)
  .filter((line) => !/^\s*#/.test(line))
  .join('\n');

if (/toJSON\(\s*secrets\s*\)/.test(workflowCode)) {
  console.error(
    'deploy.yml uses toJSON(secrets). GitHub rejects workflows that do — the run is\n' +
      'marked action_required and no job is scheduled. Reference each secret explicitly.'
  );
  process.exit(1);
}

const missing = names.filter(
  (name) => !new RegExp(`\\$\\{\\{\\s*secrets\\.${name}\\s*\\}\\}`).test(workflow)
);

if (missing.length) {
  console.error(
    `deploy/apps.json references secret(s) that .github/workflows/deploy.yml does not expose:\n` +
      missing.map((n) => `  ${n}: \${{ secrets.${n} }}`).join('\n') +
      `\n\nAdd them to the deploy job's env: block.`
  );
  process.exit(1);
}

console.log(`deploy.yml exposes all ${names.length} secret(s) referenced by deploy/apps.json`);
