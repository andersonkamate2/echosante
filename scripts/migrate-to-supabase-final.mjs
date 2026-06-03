#!/usr/bin/env node

/**
 * Migration: SQLite → Supabase via Prisma
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Parse env
function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
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
  if (fs.existsSync(p)) Object.assign(env, parseEnv(fs.readFileSync(p, 'utf8')));
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log(`🌐 Target: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Create a separate Prisma client for SQLite
async function getSQLiteClient() {
  const sqlitePath = path.join(projectRoot, 'prisma', 'dev.db');
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${sqlitePath}`,
      },
    },
  });
}

async function migrateAll() {
  console.log('\n🚀 Starting migration...\n');
  let sqlitePrisma;
  
  try {
    // Get SQLite client  
    sqlitePrisma = await getSQLiteClient();

    // 1. Articles
    const articles = await sqlitePrisma.article.findMany();
    if (articles.length) {
      console.log(`📝 Migrating ${articles.length} articles...`);
      for (const a of articles) {
        await supabase.from('articles').upsert({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          cover_image: a.cover_image,
          author: a.author,
          category: a.category,
          tags: typeof a.tags === 'string' ? a.tags.split(',').filter(x => x.trim()) : [],
          status: a.status,
          published_at: a.published_at,
          created_at: a.created_at,
          updated_at: a.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${articles.length} articles migrated`);
    }

    // 2. Pages
    const pages = await sqlitePrisma.pageContent.findMany();
    if (pages.length) {
      console.log(`📄 Migrating ${pages.length} pages...`);
      for (const p of pages) {
        await supabase.from('page_contents').upsert({
          id: p.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          meta_description: p.meta_description,
          order: p.order,
          published: p.published,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${pages.length} pages migrated`);
    }

    // 3. Gallery
    const gallery = await sqlitePrisma.gallery.findMany();
    if (gallery.length) {
      console.log(`🖼️ Migrating ${gallery.length} gallery items...`);
      for (const g of gallery) {
        await supabase.from('gallery').upsert({
          id: g.id,
          title: g.title,
          image_url: g.image_url,
          description: g.description,
          category: g.category,
          order: g.order,
          active: g.active,
          created_at: g.created_at,
          updated_at: g.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${gallery.length} gallery items migrated`);
    }

    // 4. Team
    const team = await sqlitePrisma.teamMember.findMany();
    if (team.length) {
      console.log(`👥 Migrating ${team.length} team members...`);
      for (const m of team) {
        await supabase.from('team_members').upsert({
          id: m.id,
          name: m.name,
          role: m.role,
          email: m.email,
          phone: m.phone,
          image_url: m.image_url,
          bio: m.bio,
          order: m.order,
          active: m.active,
          created_at: m.created_at,
          updated_at: m.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${team.length} team members migrated`);
    }

    // 5. Services
    const services = await sqlitePrisma.service.findMany();
    if (services.length) {
      console.log(`⚡ Migrating ${services.length} services...`);
      for (const s of services) {
        await supabase.from('services').upsert({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
          order: s.order,
          active: s.active,
          created_at: s.created_at,
          updated_at: s.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${services.length} services migrated`);
    }

    // 6. Projects
    const projects = await sqlitePrisma.project.findMany();
    if (projects.length) {
      console.log(`🏗️ Migrating ${projects.length} projects...`);
      for (const p of projects) {
        await supabase.from('projects').upsert({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          image_url: p.image_url,
          status: p.status,
          order: p.order,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${projects.length} projects migrated`);
    }

    // 7. Settings
    const settings = await sqlitePrisma.siteSetting.findMany();
    if (settings.length) {
      console.log(`⚙️ Migrating ${settings.length} site settings...`);
      for (const s of settings) {
        await supabase.from('site_settings').upsert({
          id: s.id,
          key: s.key,
          value: s.value,
          description: s.description,
          created_at: s.created_at,
          updated_at: s.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${settings.length} site settings migrated`);
    }

    // 8. Statistics
    const stats = await sqlitePrisma.statistic.findMany();
    if (stats.length) {
      console.log(`📊 Migrating ${stats.length} statistics...`);
      for (const st of stats) {
        await supabase.from('statistics').upsert({
          id: st.id,
          label: st.label,
          value: st.value,
          order: st.order,
          active: st.active,
          created_at: st.created_at,
          updated_at: st.updated_at,
        }, { onConflict: 'id' });
      }
      console.log(`✅ ${stats.length} statistics migrated`);
    }

    // 9. Contact messages
    const messages = await sqlitePrisma.contactMessage.findMany();
    if (messages.length) {
      console.log(`📧 Migrating ${messages.length} contact messages...`);
      for (const msg of messages) {
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
      console.log(`✅ ${messages.length} contact messages migrated`);
    }

    console.log('\n✅ Migration completed!\n');
    console.log('✨ Your Supabase database is now ready for Vercel deployment\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (sqlitePrisma) await sqlitePrisma.$disconnect();
  }
}

migrateAll();
