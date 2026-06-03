#!/usr/bin/env node

/**
 * CRUD Operations Test with Admin Access
 * Tests create, read, update, delete operations using Supabase Service Key
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

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
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

const tests = [
  {
    name: 'Site Settings CRUD',
    table: 'site_settings',
    getTestData: () => ({
      id: generateUUID(),
      key: `test_key_${Date.now()}`,
      value: 'test_value',
      description: 'Test setting'
    }),
    async run(data) {
      console.log('\n  📝 Testing site_settings...');
      
      // Create
      let { data: created, error } = await supabase
        .from('site_settings')
        .insert([data])
        .select();
      if (error) throw new Error(`Create failed: ${error.message}`);
      console.log('    ✅ CREATE: record created');
      
      // Read
      let { data: records, error: readErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', data.id);
      if (readErr) throw new Error(`Read failed: ${readErr.message}`);
      if (records.length === 0) throw new Error('Record not found');
      console.log('    ✅ READ: record retrieved');
      
      // Update
      const { data: updated, error: updateErr } = await supabase
        .from('site_settings')
        .update({ value: 'updated_value' })
        .eq('id', data.id)
        .select();
      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);
      console.log('    ✅ UPDATE: record updated');
      
      // Delete
      const { error: deleteErr } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', data.id);
      if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`);
      console.log('    ✅ DELETE: record deleted');
    }
  },
  {
    name: 'Statistics CRUD',
    table: 'statistics',
    getTestData: () => ({
      id: generateUUID(),
      label: `Test Stat ${Date.now()}`,
      value: '100',
      order: 0,
      active: true
    }),
    async run(data) {
      console.log('\n  📊 Testing statistics...');
      
      let { data: created, error } = await supabase
        .from('statistics')
        .insert([data])
        .select();
      if (error) throw new Error(`Create failed: ${error.message}`);
      console.log('    ✅ CREATE: record created');
      
      let { data: records, error: readErr } = await supabase
        .from('statistics')
        .select('*')
        .eq('id', data.id);
      if (readErr) throw new Error(`Read failed: ${readErr.message}`);
      if (records.length === 0) throw new Error('Record not found');
      console.log('    ✅ READ: record retrieved');
      
      const { error: updateErr } = await supabase
        .from('statistics')
        .update({ value: '200' })
        .eq('id', data.id)
        .select();
      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);
      console.log('    ✅ UPDATE: record updated');
      
      const { error: deleteErr } = await supabase
        .from('statistics')
        .delete()
        .eq('id', data.id);
      if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`);
      console.log('    ✅ DELETE: record deleted');
    }
  },
  {
    name: 'Services CRUD',
    table: 'services',
    getTestData: () => ({
      id: generateUUID(),
      title: `Test Service ${Date.now()}`,
      description: 'Test Description',
      icon: 'icon-test',
      order: 0,
      active: true
    }),
    async run(data) {
      console.log('\n  🔧 Testing services...');
      
      let { data: created, error } = await supabase
        .from('services')
        .insert([data])
        .select();
      if (error) throw new Error(`Create failed: ${error.message}`);
      console.log('    ✅ CREATE: record created');
      
      let { data: records, error: readErr } = await supabase
        .from('services')
        .select('*')
        .eq('id', data.id);
      if (readErr) throw new Error(`Read failed: ${readErr.message}`);
      if (records.length === 0) throw new Error('Record not found');
      console.log('    ✅ READ: record retrieved');
      
      const { error: updateErr } = await supabase
        .from('services')
        .update({ description: 'Updated Description' })
        .eq('id', data.id)
        .select();
      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);
      console.log('    ✅ UPDATE: record updated');
      
      const { error: deleteErr } = await supabase
        .from('services')
        .delete()
        .eq('id', data.id);
      if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`);
      console.log('    ✅ DELETE: record deleted');
    }
  },
  {
    name: 'Contact Messages CRUD',
    table: 'contact_messages',
    getTestData: () => ({
      id: generateUUID(),
      name: `Test User ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      subject: 'Test Subject',
      message: 'Test Message',
      phone: '+1234567890',
      read: false,
      replied: false
    }),
    async run(data) {
      console.log('\n  💬 Testing contact_messages...');
      
      let { data: created, error } = await supabase
        .from('contact_messages')
        .insert([data])
        .select();
      if (error) throw new Error(`Create failed: ${error.message}`);
      console.log('    ✅ CREATE: record created');
      
      let { data: records, error: readErr } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', data.id);
      if (readErr) throw new Error(`Read failed: ${readErr.message}`);
      if (records.length === 0) throw new Error('Record not found');
      console.log('    ✅ READ: record retrieved');
      
      const { error: updateErr } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', data.id)
        .select();
      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);
      console.log('    ✅ UPDATE: record updated');
      
      const { error: deleteErr } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', data.id);
      if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`);
      console.log('    ✅ DELETE: record deleted');
    }
  }
];

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 CRUD Operations Test Suite                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const data = test.getTestData();
      await test.run(data);
      passed++;
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log('✅ All CRUD tests passed!\n');
  }
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  console.error(e);
  process.exit(1);
});
