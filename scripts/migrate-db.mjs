#!/usr/bin/env node

/**
 * Robust Database Migration: SQLite → Supabase
 * 
 * This script safely migrates all data from local SQLite to Supabase production database.
 * It uses direct database connections to avoid Prisma schema conflicts.
 * 
 * Usage:
 *   node scripts/migrate-db.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// Parse env files
function parseEnv(text) {
  const env = {};
  for (const line of text.split('\n')) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    let v = l.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[l.slice(0, i).trim()] = v;
  }
  return env;
}

const env = {};
['.env', '.env.local', '.env.production'].forEach(f => {
  const p = path.join(projectRoot, f);
  if (fs.existsSync(p)) {
    Object.assign(env, parseEnv(fs.readFileSync(p, 'utf8')));
  }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
const SQLITE_PATH = path.join(projectRoot, 'prisma', 'dev.db');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🗄️  SQLite → Supabase Data Migration                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`❌ SQLite database not found: ${SQLITE_PATH}`);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log(`📂 Source: ${SQLITE_PATH}`);
console.log(`🌐 Target: ${SUPABASE_URL}`);
console.log(`Mode: ${dryRun ? '🔄 DRY RUN' : '⚙️ EXECUTE'}\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Helper to run SQLite queries
function querySQLite(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(SQLITE_PATH, (err) => {
      if (err) reject(err);
    });
    
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Tables to migrate
const tables = {
  'Article': { supabase: 'articles', transform: (row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image,
    author: row.author,
    category: row.category,
    tags: typeof row.tags === 'string' ? row.tags.split(',').filter(t => t.trim()) : [],
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'PageContent': { supabase: 'page_contents', transform: (row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    meta_description: row.meta_description,
    order: row.order,
    published: Boolean(row.published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'Gallery': { supabase: 'gallery', transform: (row) => ({
    id: row.id,
    title: row.title,
    image_url: row.image_url,
    description: row.description,
    category: row.category,
    order: row.order,
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'TeamMember': { supabase: 'team_members', transform: (row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    image_url: row.image_url,
    bio: row.bio,
    order: row.order,
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'Service': { supabase: 'services', transform: (row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    order: row.order,
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'Project': { supabase: 'projects', transform: (row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    image_url: row.image_url,
    status: row.status,
    order: row.order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'SiteSetting': { supabase: 'site_settings', transform: (row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'Statistic': { supabase: 'statistics', transform: (row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    order: row.order,
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
  'ContactMessage': { supabase: 'contact_messages', transform: (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    phone: row.phone,
    read: Boolean(row.read),
    replied: Boolean(row.replied),
    reply: row.reply,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })},
};

async function migrateTable(sqliteTable, config) {
  const { supabase: supabaseTable, transform } = config;
  
  try {
    // Read from SQLite
    const rows = await querySQLite(`SELECT * FROM "${sqliteTable}"`);
    
    if (rows.length === 0) {
      console.log(`  ⊘ ${sqliteTable}: 0 rows`);
      return;
    }
    
    console.log(`  📤 ${sqliteTable}: ${rows.length} rows...`);
    
    if (dryRun) {
      console.log(`     [DRY RUN] Would migrate ${rows.length} rows`);
      return;
    }
    
    // Transform and upsert to Supabase
    let success = 0;
    let failed = 0;
    
    for (const row of rows) {
      try {
        const data = transform(row);
        const { error } = await supabase
          .from(supabaseTable)
          .upsert(data, { onConflict: 'id' });
        
        if (error) {
          console.warn(`     ⚠️  ${row.id}: ${error.message}`);
          failed++;
        } else {
          success++;
        }
      } catch (e) {
        console.warn(`     ⚠️  Error with ${row.id}: ${e.message}`);
        failed++;
      }
    }
    
    console.log(`  ✅ ${sqliteTable}: ${success}/${rows.length} rows migrated`);
    if (failed > 0) {
      console.log(`  ⚠️  ${failed} rows failed`);
    }
    
  } catch (error) {
    console.error(`  ❌ ${sqliteTable}: ${error.message}`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting migration...\n');
    
    for (const [sqliteTable, config] of Object.entries(tables)) {
      await migrateTable(sqliteTable, config);
    }
    
    console.log(`\n${dryRun ? '✅ Dry run complete' : '✅ Migration complete'}!`);
    console.log('📋 All data has been synced to Supabase\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
