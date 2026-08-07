#!/usr/bin/env node
/**
 * Removes every generated directory in the workspace.
 *
 *   pnpm clean            build output + generated public dirs + caches
 *   pnpm clean --deps     the above, plus every node_modules
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const withDeps = process.argv.includes('--deps');

const targets = [
  'main-website/dist',
  'main-website/.astro',
  'main-website/public',
  'shop-website/dist',
  'shop-website/.astro',
  'shop-website/public',
  'roas/client/dist',
  'roas/server/dist',
  'packages/common/.astro',
];

if (withDeps) {
  targets.push(
    'node_modules',
    'packages/common/node_modules',
    'main-website/node_modules',
    'shop-website/node_modules',
    'roas/client/node_modules',
    'roas/server/node_modules'
  );
}

let removed = 0;
for (const target of targets) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) continue;
  fs.rmSync(full, { recursive: true, force: true });
  console.log(`  removed ${target}`);
  removed += 1;
}

// Stray tsbuildinfo files from `tsc -b`.
const sweepBuildInfo = (dir, depth = 0) => {
  if (depth > 4 || !fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sweepBuildInfo(full, depth + 1);
    else if (entry.name.endsWith('.tsbuildinfo')) {
      fs.rmSync(full);
      console.log(`  removed ${path.relative(ROOT, full)}`);
      removed += 1;
    }
  }
};
sweepBuildInfo(ROOT);

console.log(
  removed
    ? `clean: ${removed} item(s) removed${withDeps ? '' : ' (use --deps to also drop node_modules)'}`
    : 'clean: nothing to remove'
);
