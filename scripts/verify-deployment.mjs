#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
let errors = 0;
let warnings = 0;

function ok(message) { console.log(`[OK] ${message}`); }
function warn(message) { warnings += 1; console.warn(`[WARN] ${message}`); }
function fail(message) { errors += 1; console.error(`[ERROR] ${message}`); }
function exists(file) { return fs.existsSync(path.join(root, file)); }

const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'vercel.json',
  'app/layout.tsx',
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html',
  'data/articles.json',
  'data/projects.json',
  'data/pages.json',
  'data/admin-users.json',
];

for (const file of requiredFiles) {
  exists(file) ? ok(`${file} exists`) : fail(`${file} is missing`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
for (const forbidden of ['@prisma/client', 'prisma', '@supabase/supabase-js', 'sqlite3', 'better-sqlite3']) {
  if (forbidden in allDeps) fail(`${forbidden} should not be installed`);
}

if (pkg.scripts?.build === 'next build') ok('build script is Vercel-compatible');
else fail('build script must be next build');

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (vercel.buildCommand === 'npm run build') ok('vercel buildCommand uses npm run build');
else warn('vercel buildCommand should be npm run build or omitted');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.json'), 'utf8'));
for (const key of ['name', 'short_name', 'start_url', 'display', 'icons']) {
  if (!manifest[key]) fail(`manifest.json missing ${key}`);
}
if (manifest.display === 'standalone') ok('PWA display standalone configured');
else warn('PWA display is not standalone');

for (const file of fs.readdirSync(path.join(root, 'data'))) {
  if (!file.endsWith('.json')) continue;
  const rows = JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
  if (!Array.isArray(rows)) fail(`${file} must contain an array`);
}
ok('JSON data files are parseable arrays');

if (errors > 0) {
  console.error(`Deployment verification failed with ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
}
console.log(`Deployment verification passed with ${warnings} warning(s).`);
