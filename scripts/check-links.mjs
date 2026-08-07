#!/usr/bin/env node
/**
 * Verifies every root-relative link in a built site resolves to a real file in
 * that site's own `dist/`. Splitting one site into two makes dangling internal
 * links the most likely regression, so this runs over the build output rather
 * than the source.
 *
 * Usage: node scripts/check-links.mjs [app...]      (default: both Astro apps)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const apps = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = apps.length ? apps : ['main-website', 'shop-website'];

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

let failures = 0;

for (const app of targets) {
  const dist = path.join(ROOT, app, 'dist');
  if (!fs.existsSync(dist)) {
    console.error(`check-links: ${app}/dist not found — build first.`);
    failures += 1;
    continue;
  }

  const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
  const broken = new Map(); // href -> Set of pages referencing it

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const page = path.relative(dist, file).split(path.sep).join('/');

    for (const match of html.matchAll(/\shref="(\/[^"#?]*)"/g)) {
      const href = match[1];
      // Strip the trailing slash convention: /foo/ -> dist/foo/index.html
      const candidates = [
        path.join(dist, href),
        path.join(dist, href, 'index.html'),
        path.join(dist, `${href.replace(/\/$/, '')}.html`),
      ];
      if (candidates.some((c) => fs.existsSync(c))) continue;

      if (!broken.has(href)) broken.set(href, new Set());
      broken.get(href).add(page);
    }
  }

  if (broken.size === 0) {
    console.log(`check-links: ${app} — ${htmlFiles.length} pages, no dangling internal links`);
    continue;
  }

  failures += broken.size;
  console.error(`check-links: ${app} — ${broken.size} dangling internal link(s):`);
  for (const [href, pages] of [...broken].sort()) {
    const sample = [...pages].slice(0, 3).join(', ');
    const more = pages.size > 3 ? ` (+${pages.size - 3} more)` : '';
    console.error(`  ${href}  <- ${sample}${more}`);
  }
}

process.exit(failures ? 1 : 0);
