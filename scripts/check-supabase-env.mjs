#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const args = new Set(process.argv.slice(2));
const live = args.has('--live');
const targetArg = [...args].find((arg) => arg.startsWith('--target='));
const target = targetArg ? targetArg.slice('--target='.length) : 'local';

const filesByTarget = {
  local: ['.env', '.env.local'],
  production: ['.env.production', '.env.production.local'],
};

const required = [
  'DATABASE_URL',
  'AUTH_COOKIE_SECRET',
  'SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];

const publicTables = [
  ['articles', 'id'],
  ['page_contents', 'id'],
  ['gallery', 'id'],
  ['projects', 'id'],
  ['site_settings', 'id'],
  ['team_members', 'id'],
  ['services', 'id'],
  ['statistics', 'id'],
];

const adminTables = [...publicTables, ['contact_messages', 'id']];

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

function loadEnvFiles(files) {
  const env = {};
  const loaded = [];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    Object.assign(env, parseEnv(fs.readFileSync(file, 'utf8')));
    loaded.push(file);
  }
  return { env, loaded };
}

function isPlaceholder(value) {
  return /your-|<.*>|example|changeme|replace-with|test\.supabase\.co|placeholder/i.test(value);
}

function addIssue(issues, key, reason) {
  issues.push(`${key}: ${reason}`);
}

function validate(env) {
  const issues = [];
  const warnings = [];

  for (const key of required) {
    if (!env[key]) addIssue(issues, key, 'missing or empty');
    else if (isPlaceholder(env[key])) addIssue(issues, key, 'placeholder value');
  }

  if (env.SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_URL !== env.NEXT_PUBLIC_SUPABASE_URL) {
    addIssue(issues, 'SUPABASE_URL', 'must match NEXT_PUBLIC_SUPABASE_URL');
  }

  for (const key of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
    if (env[key] && !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(env[key])) {
      addIssue(issues, key, 'must look like https://<project-ref>.supabase.co');
    }
  }

  for (const key of ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']) {
    if (env[key] && env[key].split('.').length < 3) {
      warnings.push(`${key}: does not look like a JWT key`);
    }
  }

  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_ANON_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== env.SUPABASE_ANON_KEY) {
    addIssue(issues, 'SUPABASE_ANON_KEY', 'must match NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (env.DATABASE_URL && !/^postgres(ql)?:\/\//.test(env.DATABASE_URL) && target === 'production') {
    addIssue(issues, 'DATABASE_URL', 'production must use PostgreSQL, not SQLite');
  }

  if (env.AUTH_COOKIE_SECRET && env.AUTH_COOKIE_SECRET.length < 32) {
    addIssue(issues, 'AUTH_COOKIE_SECRET', 'must be at least 32 characters');
  }

  if (env.SITE_URL && !/^https?:\/\//.test(env.SITE_URL)) {
    addIssue(issues, 'SITE_URL', 'must be an absolute URL');
  }

  return { issues, warnings };
}

async function checkQuery(client, table, column) {
  const { error } = await client.from(table).select(column).limit(1);
  if (error) throw error;
}

async function runLiveChecks(env) {
  const anon = createClient(env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  console.log('\nLive Supabase checks');
  for (const [table, column] of publicTables) {
    await checkQuery(anon, table, column);
    console.log(`  public read: ${table} ok`);
  }

  for (const [table, column] of adminTables) {
    await checkQuery(service, table, column);
    console.log(`  service read: ${table} ok`);
  }

  const users = await service.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (users.error) throw users.error;
  console.log('  auth admin API: ok');

  const buckets = await service.storage.listBuckets();
  if (buckets.error) throw buckets.error;
  console.log(`  storage API: ok (${buckets.data.length} bucket(s))`);
}

const files = filesByTarget[target];
if (!files) {
  console.error(`Unknown target "${target}". Use local or production.`);
  process.exit(1);
}

const { env, loaded } = loadEnvFiles(files);
console.log(`Supabase environment check (${target})`);
console.log(`Loaded files: ${loaded.length ? loaded.join(', ') : 'none'}`);

const { issues, warnings } = validate(env);
for (const warning of warnings) console.warn(`Warning: ${warning}`);

if (issues.length) {
  console.error('\nConfiguration issues:');
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('Static environment validation: ok');

if (live) {
  await runLiveChecks(env);
}
