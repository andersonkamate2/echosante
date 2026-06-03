#!/usr/bin/env node

/**
 * Simple Migration: SQLite → Supabase
 * Reads from dev.db and syncs to Supabase
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Parse env files
function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const db = new Database(SQLITE_PATH, { readonly: true });

async function migrateData() {
  console.log('\n🚀 Starting migration to Supabase...\n');

  try {
    // Articles
    const articles = db.prepare('SELECT * FROM Article').all();
    if (articles.length) {
      console.log(`📝 Migrating ${articles.length} articles...`);
      for (const article of articles) {
        const { error } = await supabase.from('articles').upsert({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          cover_image: article.cover_image,
          author: article.author,
          category: article.category,
          tags: article.tags ? article.tags.split(',').filter(t => t.trim()) : [],
          status: article.status,
          published_at: article.published_at,
          created_at: article.created_at,
          updated_at: article.updated_at,
        }, { onConflict: 'id' });
        if (error) console.warn(`  ⚠️ Article ${article.slug}:`, error.message);
      }
      console.log(`✅ Migrated ${articles.length} articles`);
    }

    // Pages
    const pages = db.prepare('SELECT * FROM PageContent').all();
    if (pages.length) {
      console.log(`📄 Migrating ${pages.length} pages...`);
      for (const page of pages) {
        const { error } = await supabase.from('page_contents').upsert({
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
        if (error) console.warn(`  ⚠️ Page ${page.slug}:`, error.message);
      }
      console.log(`✅ Migrated ${pages.length} pages`);
    }

    // Gallery
    const gallery = db.prepare('SELECT * FROM Gallery').all();
    if (gallery.length) {
      console.log(`🖼️ Migrating ${gallery.length} gallery items...`);
      for (const item of gallery) {
        const { error } = await supabase.from('gallery').upsert({
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
        if (error) console.warn(`  ⚠️ Gallery ${item.title}:`, error.message);
      }
      console.log(`✅ Migrated ${gallery.length} gallery items`);
    }

    // Team members
    const team = db.prepare('SELECT * FROM TeamMember').all();
    if (team.length) {
      console.log(`👥 Migrating ${team.length} team members...`);
      for (const member of team) {
        const { error } = await supabase.from('team_members').upsert({
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
        if (error) console.warn(`  ⚠️ Member ${member.name}:`, error.message);
      }
      console.log(`✅ Migrated ${team.length} team members`);
    }

    // Services
    const services = db.prepare('SELECT * FROM Service').all();
    if (services.length) {
      console.log(`⚡ Migrating ${services.length} services...`);
      for (const service of services) {
        const { error } = await supabase.from('services').upsert({
          id: service.id,
          title: service.title,
          description: service.description,
          icon: service.icon,
          order: service.order,
          active: service.active,
          created_at: service.created_at,
          updated_at: service.updated_at,
        }, { onConflict: 'id' });
        if (error) console.warn(`  ⚠️ Service ${service.title}:`, error.message);
      }
      console.log(`✅ Migrated ${services.length} services`);
    }

    // Projects
    const projects = db.prepare('SELECT * FROM Project').all();
    if (projects.length) {
      console.log(`🏗️ Migrating ${projects.length} projects...`);
      for (const project of projects) {
        const { error } = await supabase.from('projects').upsert({
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
        if (error) console.warn(`  ⚠️ Project ${project.slug}:`, error.message);
      }
      console.log(`✅ Migrated ${projects.length} projects`);
    }

    // Site Settings
    const settings = db.prepare('SELECT * FROM SiteSetting').all();
    if (settings.length) {
      console.log(`⚙️ Migrating ${settings.length} site settings...`);
      for (const setting of settings) {
        const { error } = await supabase.from('site_settings').upsert({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          created_at: setting.created_at,
          updated_at: setting.updated_at,
        }, { onConflict: 'id' });
        if (error) console.warn(`  ⚠️ Setting ${setting.key}:`, error.message);
      }
      console.log(`✅ Migrated ${settings.length} site settings`);
    }

    // Statistics
    const statistics = db.prepare('SELECT * FROM Statistic').all();
    if (statistics.length) {
      console.log(`📊 Migrating ${statistics.length} statistics...`);
      for (const stat of statistics) {
        const { error } = await supabase.from('statistics').upsert({
          id: stat.id,
          label: stat.label,
          value: stat.value,
          order: stat.order,
          active: stat.active,
          created_at: stat.created_at,
          updated_at: stat.updated_at,
        }, { onConflict: 'id' });
        if (error) console.warn(`  ⚠️ Statistic ${stat.label}:`, error.message);
      }
      console.log(`✅ Migrated ${statistics.length} statistics`);
    }

    // Contact messages
    const messages = db.prepare('SELECT * FROM ContactMessage').all();
    if (messages.length) {
      console.log(`📧 Migrating ${messages.length} contact messages...`);
      for (const msg of messages) {
        const { error } = await supabase.from('contact_messages').upsert({
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
        if (error) console.warn(`  ⚠️ Message from ${msg.email}:`, error.message);
      }
      console.log(`✅ Migrated ${messages.length} contact messages`);
    }

    db.close();

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📋 Summary: All data synced from local SQLite to Supabase');
    console.log('🚀 Ready to deploy to Vercel\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    db.close();
    process.exit(1);
  }
}

migrateData();
