#!/usr/bin/env node

/**
 * Migration Script: SQLite (local) → PostgreSQL (Supabase)
 * Reads from local SQLite and pushes to Supabase
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Parse .env files manually
function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = {};
for (const file of ['.env', '.env.local', '.env.production']) {
  const filepath = path.join(projectRoot, file);
  if (fs.existsSync(filepath)) {
    Object.assign(env, parseEnv(fs.readFileSync(filepath, 'utf8')));
  }
}

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
const SQLITE_PATH = path.join(projectRoot, 'prisma', 'dev.db');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`❌ SQLite database not found at: ${SQLITE_PATH}`);
  process.exit(1);
}

console.log(`📂 Source SQLite: ${SQLITE_PATH}`);
console.log(`🌐 Target Supabase: ${SUPABASE_URL}`);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Use better-sqlite3 to read from local database
let Database;
try {
  Database = (await import('better-sqlite3')).default;
} catch (e) {
  console.warn('⚠️ better-sqlite3 not available, attempting to use prisma with SQLite env...');
}

// Fallback: Create a temporary Prisma client configured for SQLite
async function getSqliteData() {
  // Create temporary env file for SQLite Prisma
  const tempEnv = `DATABASE_URL=file:${SQLITE_PATH}\n`;
  const tempEnvPath = path.join(projectRoot, '.env.sqlite.tmp');
  fs.writeFileSync(tempEnvPath, tempEnv);

  try {
    // Use tsx to run Prisma queries with SQLite schema
    return new Promise((resolve, reject) => {
      const proc = spawn('node', [
        '-e',
        `
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient({ datasources: { db: { url: 'file:${SQLITE_PATH}' } } });
        const data = {
          articles: await prisma.article.findMany(),
          pages: await prisma.pageContent.findMany(),
          gallery: await prisma.gallery.findMany(),
          team: await prisma.teamMember.findMany(),
          services: await prisma.service.findMany(),
          projects: await prisma.project.findMany(),
          settings: await prisma.siteSetting.findMany(),
          statistics: await prisma.statistic.findMany(),
          messages: await prisma.contactMessage.findMany(),
        };
        await prisma.$disconnect();
        console.log(JSON.stringify(data));
        `
      ], { cwd: projectRoot });
      
      let output = '';
      proc.stdout.on('data', (data) => { output += data.toString(); });
      proc.on('close', (code) => {
        fs.unlinkSync(tempEnvPath);
        if (code !== 0) reject(new Error('Failed to read SQLite data'));
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (e) {
    fs.unlinkSync(tempEnvPath);
    throw e;
  }
}

async function migrateData() {
  console.log('\n🚀 Starting migration to Supabase...\n');

  try {
    // Read all data from SQLite
    console.log('📖 Reading data from local SQLite...');
    const sqliteData = await getSqliteData();

    // Migrate articles
    if (sqliteData.articles?.length) {
      console.log(`📝 Migrating ${sqliteData.articles.length} articles...`);
      for (const article of sqliteData.articles) {
        await supabase.from('articles').upsert({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          cover_image: article.cover_image,
          author: article.author,
          category: article.category,
          tags: typeof article.tags === 'string' ? article.tags.split(',') : [],
          status: article.status,
          published_at: article.published_at,
          created_at: article.created_at,
          updated_at: article.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.articles.length} articles`);
    }

    // Migrate pages
    if (sqliteData.pages?.length) {
      console.log(`📄 Migrating ${sqliteData.pages.length} pages...`);
      for (const page of sqliteData.pages) {
        await supabase.from('page_contents').upsert({
          id: page.id,
          slug: page.slug,
          title: page.title,
          content: page.content,
          meta_description: page.meta_description,
          order: page.order,
          published: page.published,
          created_at: page.created_at,
          updated_at: page.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.pages.length} pages`);
    }

    // Migrate gallery
    if (sqliteData.gallery?.length) {
      console.log(`🖼️ Migrating ${sqliteData.gallery.length} gallery items...`);
      for (const item of sqliteData.gallery) {
        await supabase.from('gallery').upsert({
          id: item.id,
          title: item.title,
          image_url: item.image_url,
          description: item.description,
          category: item.category,
          order: item.order,
          active: item.active,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.gallery.length} gallery items`);
    }

    // Migrate team
    if (sqliteData.team?.length) {
      console.log(`👥 Migrating ${sqliteData.team.length} team members...`);
      for (const member of sqliteData.team) {
        await supabase.from('team_members').upsert({
          id: member.id,
          name: member.name,
          role: member.role,
          email: member.email,
          phone: member.phone,
          image_url: member.image_url,
          bio: member.bio,
          order: member.order,
          active: member.active,
          created_at: member.created_at,
          updated_at: member.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.team.length} team members`);
    }

    // Migrate services
    if (sqliteData.services?.length) {
      console.log(`⚡ Migrating ${sqliteData.services.length} services...`);
      for (const service of sqliteData.services) {
        await supabase.from('services').upsert({
          id: service.id,
          title: service.title,
          description: service.description,
          icon: service.icon,
          order: service.order,
          active: service.active,
          created_at: service.created_at,
          updated_at: service.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.services.length} services`);
    }

    // Migrate projects
    if (sqliteData.projects?.length) {
      console.log(`🏗️ Migrating ${sqliteData.projects.length} projects...`);
      for (const project of sqliteData.projects) {
        await supabase.from('projects').upsert({
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          image_url: project.image_url,
          status: project.status,
          order: project.order,
          created_at: project.created_at,
          updated_at: project.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.projects.length} projects`);
    }

    // Migrate settings
    if (sqliteData.settings?.length) {
      console.log(`⚙️ Migrating ${sqliteData.settings.length} site settings...`);
      for (const setting of sqliteData.settings) {
        await supabase.from('site_settings').upsert({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          created_at: setting.created_at,
          updated_at: setting.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.settings.length} site settings`);
    }

    // Migrate statistics
    if (sqliteData.statistics?.length) {
      console.log(`📊 Migrating ${sqliteData.statistics.length} statistics...`);
      for (const stat of sqliteData.statistics) {
        await supabase.from('statistics').upsert({
          id: stat.id,
          label: stat.label,
          value: stat.value,
          order: stat.order,
          active: stat.active,
          created_at: stat.created_at,
          updated_at: stat.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.statistics.length} statistics`);
    }

    // Migrate contact messages
    if (sqliteData.messages?.length) {
      console.log(`📧 Migrating ${sqliteData.messages.length} contact messages...`);
      for (const msg of sqliteData.messages) {
        await supabase.from('contact_messages').upsert({
          id: msg.id,
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          phone: msg.phone,
          read: msg.read,
          replied: msg.replied,
          reply: msg.reply,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ Migrated ${sqliteData.messages.length} contact messages`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Deploy to Vercel with: git push');
    console.log('3. Test the production environment\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
