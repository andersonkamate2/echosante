#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const requiredCollections = [
  'articles',
  'projects',
  'team',
  'services',
  'statistics',
  'pages',
  'gallery',
  'site-settings',
  'contact-messages',
  'admin-users',
];

function readJson(name) {
  const file = path.join(root, 'data', `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${file} must contain an array`);
  return data;
}

for (const collection of requiredCollections) {
  const rows = readJson(collection);
  for (const row of rows) {
    if (!row.id) throw new Error(`${collection} contains a row without id`);
  }
  console.log(`${collection}: ${rows.length} row(s)`);
}

const publishedArticles = readJson('articles').filter((article) => article.status === 'published');
const publishedPages = readJson('pages').filter((page) => page.published);
if (publishedArticles.length === 0) throw new Error('At least one published article is required');
if (publishedPages.length === 0) throw new Error('At least one published page is required');

console.log('JSON data smoke test passed.');
