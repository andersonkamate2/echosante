/**
 * Prisma Environment Manager
 * Intelligently selects SQLite or PostgreSQL based on environment
 * 
 * Usage:
 *   import { getPrismaClient } from './prisma-env'
 *   const prisma = await getPrismaClient();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/**
 * Parse .env files manually to ensure we get the correct environment
 * without relying on Next.js or other loaders that might cache values
 */
function parseEnvFiles() {
  const env = {};
  const files = ['.env', '.env.local', '.env.production'];
  
  for (const file of files) {
    const filepath = path.join(projectRoot, file);
    if (!fs.existsSync(filepath)) continue;
    
    const content = fs.readFileSync(filepath, 'utf8');
    for (const line of content.split('\n')) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;
      const idx = l.indexOf('=');
      if (idx === -1) continue;
      
      let value = l.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[l.slice(0, idx).trim()] = value;
    }
  }
  
  return env;
}

/**
 * Determine which database to use
 */
function detectEnvironment() {
  const env = parseEnvFiles();
  
  // Check environment variables
  const debug = String(process.env.DEBUG ?? env.DEBUG ?? '').toLowerCase() === 'true';
  const supabaseUrl = process.env.SUPABASE_URL ?? env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_KEY;
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  
  // Determine if we're in development or production
  const isSqlite = debug || !supabaseUrl || !supabaseKey || 
                   (databaseUrl && databaseUrl.startsWith('file:'));
  
  return {
    isSqlite,
    debug,
    env,
    supabaseUrl,
    supabaseKey,
    databaseUrl,
  };
}

/**
 * Get the appropriate Prisma client for the current environment
 * 
 * For SQLite: Creates a client with the SQLite schema and dev.db
 * For PostgreSQL: Uses the default configuration
 */
export async function getPrismaClient() {
  const config = detectEnvironment();
  
  if (config.isSqlite) {
    // For SQLite, we need to use the SQLite schema
    // This is a workaround because Prisma loads the default schema.prisma
    console.log('[Prisma] Using SQLite database:', config.databaseUrl || 'file:./prisma/dev.db');
    
    // Set environment variable to point to SQLite
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'file:./prisma/dev.db';
    }
    
    return new PrismaClient();
  } else {
    // For PostgreSQL (Supabase)
    console.log('[Prisma] Using PostgreSQL database:', config.supabaseUrl);
    
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = config.databaseUrl;
    }
    if (!process.env.DIRECT_URL) {
      process.env.DIRECT_URL = config.env.DIRECT_URL;
    }
    
    return new PrismaClient();
  }
}

/**
 * Get environment detection info (for logging/debugging)
 */
export function getEnvironmentInfo() {
  return detectEnvironment();
}
