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

const tables = ['articles', 'page_contents', 'gallery', 'team_members', 'services', 'projects', 'site_settings', 'statistics', 'contact_messages'];

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

console.log('\n📊 Supabase Data Summary:\n');
for (const table of tables) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=count()`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    }
  });
  const data = await response.json();
  const count = data[0]?.count || 0;
  console.log(`  ${table}: ${count} rows`);
}
console.log('');
