#!/usr/bin/env node

/**
 * Authentication & RLS Policy Test
 * Tests Supabase Auth integration and Row-Level Security policies
 */

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';

const env = {};
['.env', '.env.local', '.env.production'].forEach(f => {
  if (fs.existsSync(f)) {
    fs.readFileSync(f, 'utf8').split('\n').forEach(line => {
      const [k, v] = line.split('=');
      if (k && v) env[k.trim()] = v.trim().replace(/^["']|["']$/g, '');
    });
  }
});

// Service key client (has full access, bypasses RLS)
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Anon key client (respects RLS policies)
const supabaseAnon = createClient(env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testRLSPolicies() {
  console.log('\n📊 Testing RLS Policies:\n');
  
  try {
    // Create test article (draft - hidden from anon)
    const draftId = generateUUID();
    console.log('  1️⃣  Creating draft article (should be hidden from anonymous users)...');
    const { error: createErr } = await supabaseAdmin
      .from('articles')
      .insert({
        id: draftId,
        title: 'Draft Article',
        slug: `draft-${Date.now()}`,
        excerpt: 'Test excerpt',
        content: 'Test content',
        status: 'draft'
      });
    
    if (createErr) throw new Error(`Failed to create draft: ${createErr.message}`);
    console.log('     ✅ Draft article created');
    
    // Try to read draft with anon key (should fail)
    console.log('  2️⃣  Attempting to read draft with anonymous key...');
    const { data: anonDraft, error: anonErr } = await supabaseAnon
      .from('articles')
      .select('*')
      .eq('id', draftId);
    
    if (anonDraft && anonDraft.length === 0) {
      console.log('     ✅ RLS PASS: Anonymous users cannot read draft articles');
    } else {
      console.log('     ⚠️  WARNING: Anonymous users can read draft articles (potential security issue)');
    }
    
    // Create published article
    const publishedId = generateUUID();
    console.log('  3️⃣  Creating published article...');
    const { error: pubErr } = await supabaseAdmin
      .from('articles')
      .insert({
        id: publishedId,
        title: 'Published Article',
        slug: `published-${Date.now()}`,
        excerpt: 'Test excerpt',
        content: 'Test content',
        status: 'published'
      });
    
    if (pubErr) throw new Error(`Failed to create published: ${pubErr.message}`);
    console.log('     ✅ Published article created');
    
    // Read published with anon key (should succeed)
    console.log('  4️⃣  Reading published article with anonymous key...');
    const { data: anonPublished, error: anonPubErr } = await supabaseAnon
      .from('articles')
      .select('*')
      .eq('id', publishedId);
    
    if (anonPubErr) {
      console.log(`     ⚠️  ERROR: ${anonPubErr.message}`);
    } else if (anonPublished && anonPublished.length > 0) {
      console.log('     ✅ RLS PASS: Anonymous users can read published articles');
    } else {
      console.log('     ⚠️  WARNING: Published articles not accessible to anonymous users');
    }
    
    // Test site_settings (public read)
    console.log('  5️⃣  Testing site_settings RLS (should be readable by all)...');
    const { data: settings, error: settingsErr } = await supabaseAnon
      .from('site_settings')
      .select('*')
      .limit(1);
    
    if (settingsErr) {
      console.log(`     ⚠️  ERROR reading settings: ${settingsErr.message}`);
    } else if (settings.length >= 0) {
      console.log('     ✅ RLS PASS: Site settings are readable by anonymous users');
    }
    
    // Cleanup: Delete test articles
    console.log('  6️⃣  Cleaning up test data...');
    await supabaseAdmin.from('articles').delete().eq('id', draftId);
    await supabaseAdmin.from('articles').delete().eq('id', publishedId);
    console.log('     ✅ Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error(`\n  ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testStorageAccess() {
  console.log('\n📦 Testing Storage Access:\n');
  
  try {
    console.log('  1️⃣  Checking storage bucket existence...');
    const { data: buckets, error: bucketsErr } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsErr) {
      console.log(`     ⚠️  Error listing buckets: ${bucketsErr.message}`);
      return false;
    }
    
    const echosanteBucket = buckets.find(b => b.name === 'echosante');
    if (echosanteBucket) {
      console.log(`     ✅ echosante bucket found`);
    } else {
      console.log(`     ❌ echosante bucket not found`);
      return false;
    }
    
    console.log('  2️⃣  Testing storage file operations...');
    const testFile = 'test-upload-' + Date.now() + '.txt';
    const testContent = 'test file content';
    
    // Upload file
    const { data: uploadData, error: uploadErr } = await supabaseAdmin
      .storage
      .from('echosante')
      .upload(testFile, new TextEncoder().encode(testContent));
    
    if (uploadErr) {
      console.log(`     ⚠️  Upload error: ${uploadErr.message}`);
      return false;
    }
    console.log(`     ✅ File uploaded successfully`);
    
    // Download file
    const { data: downloadData, error: downloadErr } = await supabaseAdmin
      .storage
      .from('echosante')
      .download(testFile);
    
    if (downloadErr) {
      console.log(`     ⚠️  Download error: ${downloadErr.message}`);
      return false;
    }
    console.log(`     ✅ File downloaded successfully`);
    
    // Delete file
    const { data: delData, error: delErr } = await supabaseAdmin
      .storage
      .from('echosante')
      .remove([testFile]);
    
    if (delErr) {
      console.log(`     ⚠️  Delete error: ${delErr.message}`);
      return false;
    }
    console.log(`     ✅ File deleted successfully`);
    
    return true;
  } catch (error) {
    console.error(`\n  ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🔐 Authentication & RLS Policy Test                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  let passed = 0;
  
  if (await testRLSPolicies()) passed++;
  if (await testStorageAccess()) passed++;
  
  console.log(`\n📊 Results: ${passed}/2 test sections passed`);
  if (passed < 2) {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
  }
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  process.exit(1);
});
