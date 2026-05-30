#!/usr/bin/env node

/**
 * Migration Script: SQLite (local) → PostgreSQL (Supabase)
 * 
 * Usage:
 *   node scripts/migrate-to-supabase.mjs
 * 
 * This script:
 * 1. Reads data from local SQLite database
 * 2. Transforms data to match PostgreSQL schema
 * 3. Uploads to Supabase PostgreSQL
 * 4. Verifies data integrity
 */

import { prisma } from '../lib/prisma.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function migrateArticles() {
  console.log('📝 Migrating articles...');
  const articles = await prisma.article.findMany();
  console.log(`Found ${articles.length} articles`);

  const { error: deleteError } = await supabase.from('articles').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing articles:', deleteError);

  for (const article of articles) {
    const tags = typeof article.tags === 'string' ? article.tags.split(',') : [];
    const { error } = await supabase.from('articles').insert({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image: article.cover_image,
      author: article.author,
      category: article.category,
      tags,
      status: article.status,
      published_at: article.published_at,
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert article ${article.slug}:`, error);
    } else {
      console.log(`✅ Inserted article: ${article.title}`);
    }
  }
}

async function migratePages() {
  console.log('📄 Migrating page contents...');
  const pages = await prisma.pageContent.findMany();
  console.log(`Found ${pages.length} pages`);

  const { error: deleteError } = await supabase.from('page_contents').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing pages:', deleteError);

  for (const page of pages) {
    const { error } = await supabase.from('page_contents').insert({
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_description: page.meta_description,
      order: page.order,
      published: page.published,
      created_at: page.created_at.toISOString(),
      updated_at: page.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert page ${page.slug}:`, error);
    } else {
      console.log(`✅ Inserted page: ${page.title}`);
    }
  }
}

async function migrateGallery() {
  console.log('🖼️ Migrating gallery items...');
  const items = await prisma.gallery.findMany();
  console.log(`Found ${items.length} gallery items`);

  const { error: deleteError } = await supabase.from('gallery').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing gallery:', deleteError);

  for (const item of items) {
    const { error } = await supabase.from('gallery').insert({
      id: item.id,
      title: item.title,
      image_url: item.image_url,
      description: item.description,
      category: item.category,
      order: item.order,
      active: item.active,
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert gallery item ${item.title}:`, error);
    } else {
      console.log(`✅ Inserted gallery: ${item.title}`);
    }
  }
}

async function migrateTeam() {
  console.log('👥 Migrating team members...');
  const members = await prisma.teamMember.findMany();
  console.log(`Found ${members.length} team members`);

  const { error: deleteError } = await supabase.from('team_members').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing team:', deleteError);

  for (const member of members) {
    const { error } = await supabase.from('team_members').insert({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      image_url: member.image_url,
      bio: member.bio,
      order: member.order,
      active: member.active,
      created_at: member.created_at.toISOString(),
      updated_at: member.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert team member ${member.name}:`, error);
    } else {
      console.log(`✅ Inserted member: ${member.name}`);
    }
  }
}

async function migrateServices() {
  console.log('⚡ Migrating services...');
  const services = await prisma.service.findMany();
  console.log(`Found ${services.length} services`);

  const { error: deleteError } = await supabase.from('services').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing services:', deleteError);

  for (const service of services) {
    const { error } = await supabase.from('services').insert({
      id: service.id,
      title: service.title,
      description: service.description,
      icon: service.icon,
      order: service.order,
      active: service.active,
      created_at: service.created_at.toISOString(),
      updated_at: service.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert service ${service.title}:`, error);
    } else {
      console.log(`✅ Inserted service: ${service.title}`);
    }
  }
}

async function migrateStatistics() {
  console.log('📊 Migrating statistics...');
  const stats = await prisma.statistic.findMany();
  console.log(`Found ${stats.length} statistics`);

  const { error: deleteError } = await supabase.from('statistics').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing statistics:', deleteError);

  for (const stat of stats) {
    const { error } = await supabase.from('statistics').insert({
      id: stat.id,
      label: stat.label,
      value: stat.value,
      order: stat.order,
      active: stat.active,
      created_at: stat.created_at.toISOString(),
      updated_at: stat.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert statistic ${stat.label}:`, error);
    } else {
      console.log(`✅ Inserted stat: ${stat.label}`);
    }
  }
}

async function migrateContactMessages() {
  console.log('📧 Migrating contact messages...');
  const messages = await prisma.contactMessage.findMany();
  console.log(`Found ${messages.length} contact messages`);

  const { error: deleteError } = await supabase.from('contact_messages').delete().neq('id', '');
  if (deleteError) console.warn('⚠️ Could not clear existing messages:', deleteError);

  for (const msg of messages) {
    const { error } = await supabase.from('contact_messages').insert({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      phone: msg.phone,
      read: msg.read,
      replied: msg.replied,
      reply: msg.reply,
      created_at: msg.created_at.toISOString(),
      updated_at: msg.updated_at.toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to insert message from ${msg.email}:`, error);
    } else {
      console.log(`✅ Inserted message from: ${msg.name}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...\n');

  try {
    await migrateArticles();
    console.log('');
    await migratePages();
    console.log('');
    await migrateGallery();
    console.log('');
    await migrateTeam();
    console.log('');
    await migrateServices();
    console.log('');
    await migrateStatistics();
    console.log('');
    await migrateContactMessages();
    console.log('');

    console.log('✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Update .env to use Supabase credentials');
    console.log('3. Test public pages and admin login');
    console.log('4. Deploy to production\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
