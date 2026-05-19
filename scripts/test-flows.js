import { createMockSupabase } from '../lib/supabase/mock.mjs';

async function run() {
  const supabase = createMockSupabase();

  console.log('--- Test: sign in with valid credentials ---');
  const sign = await supabase.auth.signInWithPassword({ email: 'admin@echosante.org', password: 'password' });
  console.log('signIn result:', sign);
  if (sign.error) process.exitCode = 2;

  console.log('\n--- Test: get session ---');
  const session = await supabase.auth.getSession();
  console.log('session:', session);

  console.log('\n--- Test: list articles (initial) ---');
  await supabase.from('articles').select('*').order('created_at', { ascending: false }).then((r) => console.log('articles:', r.data));

  console.log('\n--- Test: create new article (upsert without id) ---');
  const payload = {
    title: 'Article de test',
    slug: 'article-de-test',
    excerpt: 'Extrait test',
    content: 'Contenu test',
    cover_image: '',
    author: 'Testeur',
    category: 'Test',
    tags: ['test','demo'],
    status: 'draft',
    published_at: null,
  };
  const created = await supabase.from('articles').upsert(payload);
  console.log('created:', created.data && created.data[0]);

  console.log('\n--- Test: list articles (after create) ---');
  await supabase.from('articles').select('*').order('created_at', { ascending: false }).then((r) => console.log('articles:', r.data.map(a=>a.slug)));

  console.log('\n--- Test: update article (upsert with id) ---');
  const toUpdate = { ...created.data[0], title: 'Article modifié', tags: ['test','updated'] };
  const updated = await supabase.from('articles').upsert(toUpdate);
  console.log('updated:', updated.data && updated.data[0]);

  console.log('\n--- Test: delete article ---');
  const del = await supabase.from('articles').delete().eq('id', updated.data[0].id);
  console.log('deleted:', del.data);

  console.log('\n--- Test: sign out ---');
  await supabase.auth.signOut();
  const sessionAfter = await supabase.auth.getSession();
  console.log('session after signOut:', sessionAfter);

  console.log('\nAll mock flows completed.');
}

run().catch((err)=>{ console.error(err); process.exitCode=1; });
