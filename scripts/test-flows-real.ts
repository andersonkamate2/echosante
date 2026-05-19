function ensureEnv(key: string, fallback?: string) {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

const url = ensureEnv('SUPABASE_URL');
const serviceKey = ensureEnv('SUPABASE_SERVICE_KEY');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
if (!anonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
}

console.log('Using real Supabase modules with:');
console.log(`  SUPABASE_URL=${url}`);
console.log(`  SUPABASE_SERVICE_KEY=${serviceKey ? '[REDACTED]' : 'missing'}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey ? '[REDACTED]' : 'missing'}`);

const adminEmail = process.env.SUPABASE_TEST_ADMIN_EMAIL ?? 'admin@echosante.org';
const adminPassword = process.env.SUPABASE_TEST_ADMIN_PASSWORD ?? 'password';

const { signInAdmin, getAdminSession } = await import('../lib/supabase/auth.ts');
const { supabaseClient } = await import('../lib/supabase/client.ts');
const { supabaseServer } = await import('../lib/supabase/server.ts');
const { getPublishedArticles, getArticleBySlug } = await import('../lib/supabase/articles.ts');

async function run() {
  console.log('\n=== Real Supabase integration test ===');

  console.log('\n1) Auth client login (admin)');
  const login = await signInAdmin(adminEmail, adminPassword);
  if (login.error) {
    console.warn('Warning: admin login failed:', login.error.message);
  } else {
    console.log('Login successful:', login.data?.session?.user?.email);
  }

  console.log('\n2) Client public article query');
  const publicQuery = await supabaseClient.from('articles').select('id, title, slug, status').eq('status', 'published').order('created_at', { ascending: false });
  if (publicQuery.error) throw publicQuery.error;
  console.log(`Found ${publicQuery.data?.length ?? 0} published article(s)`);

  console.log('\n3) Server-side article query');
  const serverQuery = await supabaseServer.from('articles').select('id, title, slug, status').order('created_at', { ascending: false });
  if (serverQuery.error) throw serverQuery.error;
  console.log(`Server returned ${serverQuery.data?.length ?? 0} article(s)`);

  console.log('\n4) Create article via server');
  const newArticle = {
    title: 'Integration test article',
    slug: `integration-test-${Date.now()}`,
    excerpt: 'Article créé par le test d’intégration.',
    content: 'Contenu de test d’intégration.',
    cover_image: '',
    author: 'Test Runner',
    category: 'Test',
    tags: ['integration', 'test'],
    status: 'draft',
    published_at: null,
  };
  const created = await supabaseServer.from('articles').upsert(newArticle);
  if (created.error) throw created.error;
  const createdArticle = created.data?.[0];
  console.log('Created article id:', createdArticle?.id);

  console.log('\n5) Read created article via SSR helper');
  const allPublished = await getPublishedArticles({});
  console.log(`getPublishedArticles returned ${allPublished.length} published articles`);

  console.log('\n6) Read article by slug via SSR helper');
  const fetched = await getArticleBySlug(createdArticle.slug);
  console.log('getArticleBySlug result:', fetched ? fetched.slug : 'null');

  console.log('\n7) Update article via server');
  const updated = await supabaseServer.from('articles').upsert({ ...createdArticle, title: 'Updated integration article', published_at: new Date().toISOString(), status: 'published' });
  if (updated.error) throw updated.error;
  console.log('Updated title:', updated.data?.[0]?.title);

  console.log('\n8) Delete article via server');
  const deleted = await supabaseServer.from('articles').delete().eq('id', updated.data?.[0]?.id);
  if (deleted.error) throw deleted.error;
  console.log('Deleted article id:', updated.data?.[0]?.id);

  if (!login.error) {
    console.log('\n9) Logout client');
    const logout = await supabaseClient.auth.signOut();
    if (logout.error) throw logout.error;
    const session = await getAdminSession();
    console.log('Session after logout:', session.data?.session ?? null);
  }

  console.log('\n=== Real Supabase integration test completed ===');
}

run().catch((err) => {
  console.error('Integration test failed:', err.message ?? err);
  process.exit(1);
});
