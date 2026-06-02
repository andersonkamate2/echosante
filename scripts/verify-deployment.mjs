#!/usr/bin/env node
/**
 * Deployment verification script for Echo Santé on Vercel
 * Run this script to verify all required configurations before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'SITE_URL',
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'AUTH_COOKIE_SECRET',
  'SUPABASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET',
];

const REQUIRED_FILES = [
  'prisma/schema.prisma',
  'next.config.mjs',
  'vercel.json',
  'package.json',
  '.env.production.example',
];

const PRISMA_REQUIREMENTS = [
  { file: 'prisma/schema.prisma', pattern: 'url\\s*=\\s*env\\("DATABASE_URL"\\)', desc: 'DATABASE_URL in datasource' },
  { file: 'prisma/schema.prisma', pattern: 'directUrl\\s*=\\s*env\\("DIRECT_URL"\\)', desc: 'DIRECT_URL in datasource' },
];

let errorCount = 0;
let warningCount = 0;

function log(level, message) {
  const colors = {
    error: '\x1b[31m',
    warning: '\x1b[33m',
    success: '\x1b[32m',
    info: '\x1b[36m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[level] || ''}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

function checkFile(filepath, description) {
  const fullPath = path.join(PROJECT_ROOT, filepath);
  if (fs.existsSync(fullPath)) {
    log('success', `✓ ${description} found at ${filepath}`);
    return true;
  }
  log('error', `✗ ${description} missing: ${filepath}`);
  errorCount++;
  return false;
}

function checkPrismaConfig() {
  log('info', '\n📊 Checking Prisma configuration...');
  const schemaPath = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    log('error', '✗ prisma/schema.prisma not found');
    errorCount++;
    return;
  }

  const content = fs.readFileSync(schemaPath, 'utf8');

  PRISMA_REQUIREMENTS.forEach(({ pattern, desc }) => {
    if (new RegExp(pattern).test(content)) {
      log('success', `✓ ${desc}`);
    } else {
      log('error', `✗ ${desc} - CRITICAL for Vercel`);
      errorCount++;
    }
  });
}

function checkEnvTemplate() {
  log('info', '\n🔐 Checking environment template...');

  const templatePath = path.join(PROJECT_ROOT, '.env.production.example');
  if (!fs.existsSync(templatePath)) {
    log('warning', '⚠ .env.production.example not found');
    warningCount++;
    return;
  }

  const content = fs.readFileSync(templatePath, 'utf8');
  let missingVars = [];

  REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!content.includes(envVar)) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length === 0) {
    log('success', `✓ All required environment variables documented in template`);
  } else {
    log('warning', `⚠ Missing from template: ${missingVars.join(', ')}`);
    warningCount++;
  }
}

function checkPackageJson() {
  log('info', '\n📦 Checking package.json scripts...');

  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = pkg.scripts || {};

  const requiredScripts = ['prisma:generate', 'prisma:migrate', 'build'];
  requiredScripts.forEach((script) => {
    if (scripts[script]) {
      log('success', `✓ ${script} script found`);
    } else {
      log('warning', `⚠ ${script} script not found`);
      warningCount++;
    }
  });
}

function checkVercelConfig() {
  log('info', '\n⚙️  Checking Vercel configuration...');

  const vercelPath = path.join(PROJECT_ROOT, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    log('error', '✗ vercel.json not found');
    errorCount++;
    return;
  }

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  // Check buildCommand includes migrations
  if (config.buildCommand && config.buildCommand.includes('prisma:migrate')) {
    log('success', `✓ buildCommand includes prisma:migrate`);
  } else {
    log('warning', '⚠ buildCommand might be missing prisma:migrate');
    warningCount++;
  }

  // Check env variables are declared
  const envVarsDeclared = config.env || [];
  const missingEnvDeclarations = REQUIRED_ENV_VARS.filter(
    (env) => !envVarsDeclared.includes(env),
  );

  if (missingEnvDeclarations.length === 0) {
    log('success', `✓ All environment variables declared in vercel.json`);
  } else {
    log('warning', `⚠ Missing env declarations: ${missingEnvDeclarations.join(', ')}`);
    warningCount++;
  }
}

function checkNextConfig() {
  log('info', '\n⚡ Checking Next.js configuration...');

  const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
  if (!fs.existsSync(nextConfigPath)) {
    log('warning', '⚠ next.config.mjs not found');
    warningCount++;
    return;
  }

  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (content.includes('remotePatterns')) {
    log('success', `✓ Image remote patterns configured`);
  } else {
    log('warning', '⚠ Image remote patterns might need configuration');
    warningCount++;
  }
}

function checkApiRoutes() {
  log('info', '\n🛣️  Checking API routes...');

  const apiDir = path.join(PROJECT_ROOT, 'app/api');
  const criticalRoutes = ['auth', 'articles', 'pages', 'upload'];

  criticalRoutes.forEach((route) => {
    const routePath = path.join(apiDir, route);
    if (fs.existsSync(routePath)) {
      log('success', `✓ /api/${route} exists`);
    } else {
      log('warning', `⚠ /api/${route} not found`);
    }
  });
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('info', '📋 DEPLOYMENT READINESS SUMMARY');
  console.log('='.repeat(60));

  if (errorCount === 0 && warningCount === 0) {
    log('success', '✓ All checks passed! Project is ready for Vercel deployment.');
    console.log('\nNext steps:');
    console.log('1. Set environment variables in Vercel Project Settings');
    console.log('2. Connect Git repository to Vercel');
    console.log('3. Deploy: git push');
    process.exit(0);
  }

  if (errorCount > 0) {
    log('error', `✗ ${errorCount} critical error(s) found - fix before deployment`);
  }

  if (warningCount > 0) {
    log('warning', `⚠ ${warningCount} warning(s) found - review before deployment`);
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run all checks
log('info', '🚀 Starting deployment verification...\n');

REQUIRED_FILES.forEach((file) => {
  checkFile(file, file.split('/').pop());
});

checkPrismaConfig();
checkEnvTemplate();
checkPackageJson();
checkVercelConfig();
checkNextConfig();
checkApiRoutes();

printSummary();
