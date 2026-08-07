#!/usr/bin/env node
/**
 * Builds each Astro app's `public/` directory.
 *
 *   packages/common/public/**   (shared: favicons, logo, images, sitemap.xsl)
 * + <app>/public-src/**         (per-site: robots.txt, anything site-specific)
 * = <app>/public/**             (generated, gitignored)
 *
 * The 19 MB image library therefore lives in git exactly once instead of being
 * duplicated per site. Runs from each app's `predev` / `prebuild`, and copies
 * only what actually changed, so repeat runs are effectively free.
 *
 * Usage:
 *   node scripts/sync-public.mjs              # every app
 *   node scripts/sync-public.mjs shop-website # one app
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHARED = path.join(ROOT, 'packages', 'common', 'public');

/** Apps are discovered by convention: any top-level dir holding a `public-src`. */
const discoverApps = () =>
  fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(ROOT, name, 'public-src')));

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const apps = requested.length ? requested : discoverApps();

let copied = 0;
let removed = 0;
let skipped = 0;

/** Relative paths of every file under `dir`, POSIX-separated. */
const listFiles = (dir, base = dir) => {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
};

const isUpToDate = (src, dest) => {
  if (!fs.existsSync(dest)) return false;
  const a = fs.statSync(src);
  const b = fs.statSync(dest);
  return a.size === b.size && Math.abs(a.mtimeMs - b.mtimeMs) < 1000;
};

const copyFile = (src, dest) => {
  if (isUpToDate(src, dest)) {
    skipped += 1;
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  // Carry the mtime across so the next run can skip this file.
  const { atime, mtime } = fs.statSync(src);
  fs.utimesSync(dest, atime, mtime);
  copied += 1;
};

/** Drop empty directories left behind after pruning stale files (keeps `root` itself). */
const pruneEmptyDirs = (dir, root = dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirs(path.join(dir, entry.name), root);
  }
  if (dir !== root && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
};

for (const app of apps) {
  const appDir = path.join(ROOT, app);
  if (!fs.existsSync(appDir)) {
    console.error(`sync-public: no such app directory "${app}"`);
    process.exitCode = 1;
    continue;
  }

  const localSrc = path.join(appDir, 'public-src');
  const dest = path.join(appDir, 'public');

  // Per-app files win over shared ones, so they are layered second.
  const plan = new Map(); // relative path -> absolute source
  for (const rel of listFiles(SHARED)) plan.set(rel, path.join(SHARED, ...rel.split('/')));
  for (const rel of listFiles(localSrc)) plan.set(rel, path.join(localSrc, ...rel.split('/')));

  for (const [rel, src] of plan) copyFile(src, path.join(dest, ...rel.split('/')));

  // Remove anything that is no longer produced by either source.
  for (const rel of listFiles(dest)) {
    if (plan.has(rel)) continue;
    fs.rmSync(path.join(dest, ...rel.split('/')));
    removed += 1;
  }
  pruneEmptyDirs(dest);
}

console.log(
  `sync-public: ${apps.join(', ') || '(none)'} — ${copied} copied, ${skipped} unchanged, ${removed} removed`
);
