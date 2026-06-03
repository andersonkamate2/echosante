#!/usr/bin/env node

/**
 * Database Sync Manager
 * Handles schema switching to support both SQLite and PostgreSQL
 * 
 * Usage:
 *   node scripts/db-sync.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

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
const SCHEMA_PATH = path.join(projectRoot, 'prisma', 'schema.prisma');
const SQLITE_SCHEMA_PATH = path.join(projectRoot, 'prisma', 'schema.sqlite.prisma');
const BACKUP_SCHEMA_PATH = path.join(projectRoot, 'prisma', 'schema.prisma.backup');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🗄️  SQLite ↔ Supabase Sync Manager                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`❌ SQLite database not found: ${SQLITE_PATH}`);
  console.log('ℹ️  This is normal in production. Skipping data sync.\n');
  process.exit(0);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log(`📂 Source: ${SQLITE_PATH}`);
console.log(`🌐 Target: ${SUPABASE_URL}\n`);

// Function to switch schemas
function switchSchema(toSqlite) {
  try {
    if (toSqlite) {
      console.log('  🔄 Switching to SQLite schema...');
      // Backup current schema
      if (fs.existsSync(SCHEMA_PATH)) {
        fs.copyFileSync(SCHEMA_PATH, BACKUP_SCHEMA_PATH);
      }
      // Copy SQLite schema
      fs.copyFileSync(SQLITE_SCHEMA_PATH, SCHEMA_PATH);
    } else {
      console.log('  🔄 Restoring PostgreSQL schema...');
      // Restore original schema
      if (fs.existsSync(BACKUP_SCHEMA_PATH)) {
        fs.copyFileSync(BACKUP_SCHEMA_PATH, SCHEMA_PATH);
        fs.unlinkSync(BACKUP_SCHEMA_PATH);
      }
    }
    return true;
  } catch (error) {
    console.error(`  ❌ Schema switch failed: ${error.message}`);
    return false;
  }
}

// Function to generate Prisma client
function generatePrismaClient() {
  try {
    console.log('  📋 Generating Prisma client...');
    const result = spawnSync('npx', ['prisma', 'generate'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.error || result.status !== 0) {
      throw new Error(`Prisma generate failed: ${result.stderr || result.error}`);
    }
    return true;
  } catch (error) {
    console.error(`  ❌ Prisma generation failed: ${error.message}`);
    return false;
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Table definitions with transformers
const tableDefinitions = [
  {
    name: 'articles',
    query: (p) => p.article.findMany(),
    transform: (row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      cover_image: row.cover_image,
      author: row.author,
      category: row.category,
      tags: typeof row.tags === 'string' ? row.tags.split(',').filter(t => t.trim()) : [],
      status: row.status || 'draft',
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'page_contents',
    query: (p) => p.pageContent.findMany(),
    transform: (row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      content: row.content,
      meta_description: row.meta_description,
      order: row.order || 0,
      published: Boolean(row.published),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'gallery',
    query: (p) => p.gallery.findMany(),
    transform: (row) => ({
      id: row.id,
      title: row.title,
      image_url: row.image_url,
      description: row.description,
      category: row.category || 'general',
      order: row.order || 0,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'team_members',
    query: (p) => p.teamMember.findMany(),
    transform: (row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      email: row.email,
      phone: row.phone,
      image_url: row.image_url,
      bio: row.bio,
      order: row.order || 0,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'services',
    query: (p) => p.service.findMany(),
    transform: (row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      order: row.order || 0,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'projects',
    query: (p) => p.project.findMany(),
    transform: (row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url,
      status: row.status || 'active',
      order: row.order || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'site_settings',
    query: (p) => p.siteSetting.findMany(),
    transform: (row) => ({
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'statistics',
    query: (p) => p.statistic.findMany(),
    transform: (row) => ({
      id: row.id,
      label: row.label,
      value: row.value,
      order: row.order || 0,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'contact_messages',
    query: (p) => p.contactMessage.findMany(),
    transform: (row) => ({
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
    }),
  },
];

async function syncTable(prisma, definition) {
  try {
    const rows = await definition.query(prisma);
    
    if (!rows || rows.length === 0) {
      console.log(`  ⊘ ${definition.name}: 0 rows`);
      return 0;
    }
    
    console.log(`  📤 ${definition.name}: ${rows.length} rows → Supabase`);
    
    let successCount = 0;
    for (const row of rows) {
      try {
        const data = definition.transform(row);
        const { error } = await supabase
          .from(definition.name)
          .upsert(data, { onConflict: 'id' });
        
        if (!error) {
          successCount++;
        } else {
          console.warn(`    ⚠️  ${row.id || data.key}: ${error.message}`);
        }
      } catch (e) {
        console.warn(`    ⚠️  Error: ${e.message}`);
      }
    }
    
    console.log(`  ✅ ${definition.name}: ${successCount}/${rows.length} synced`);
    return successCount;
  } catch (error) {
    console.error(`  ❌ ${definition.name}: ${error.message}`);
    return 0;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database sync...\n');
    
    // Step 1: Switch to SQLite schema
    if (!switchSchema(true)) {
      throw new Error('Failed to switch to SQLite schema');
    }
    
    // Step 2: Generate Prisma client for SQLite
    if (!generatePrismaClient()) {
      throw new Error('Failed to generate Prisma client');
    }
    
    console.log('');
    
    // Step 3: Set DATABASE_URL for SQLite
    process.env.DATABASE_URL = `file:${SQLITE_PATH}`;
    
    // Step 4: Import Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const sqlitePrisma = new PrismaClient({
      log: [],
    });
    
    // Step 5: Sync tables
    console.log('📊 Syncing tables:\n');
    let totalRows = 0;
    for (const definition of tableDefinitions) {
      const count = await syncTable(sqlitePrisma, definition);
      totalRows += count;
    }
    
    await sqlitePrisma.$disconnect();
    
    console.log(`\n✅ Sync complete! ${totalRows} rows migrated to Supabase\n`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    // Step 6: Restore PostgreSQL schema
    console.log('🔄 Restoring original schema...\n');
    switchSchema(false);
  }
}

main();
