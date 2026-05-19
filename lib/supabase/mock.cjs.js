function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function createMockSupabase() {
  const state = {
    session: null,
    profiles: [
      { id: 'admin-1', email: 'admin@echosante.org', role: 'admin', password: 'password' },
    ],
    articles: [
      {
        id: 'a1',
        title: 'Bienvenue sur Echo Santé',
        slug: 'bienvenue-echo-sante',
        excerpt: 'Présentation du projet Echo Santé.',
        content: 'Contenu de test.',
        cover_image: '',
        author: 'Echo Santé',
        category: 'Santé',
        tags: ['santé'],
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  const auth = {
    async signInWithPassword({ email, password }) {
      const user = state.profiles.find((p) => p.email === email && p.password === password);
      if (!user) return { data: null, error: { message: 'Invalid login' } };
      state.session = { user: { id: user.id, email: user.email }, access_token: 'mock-token' };
      return { data: { session: state.session }, error: null };
    },
    async signOut() {
      state.session = null;
      return { error: null };
    },
    async getSession() {
      return { data: { session: state.session }, error: null };
    },
  };

  function from(table) {
    const tableRef = table === 'articles' ? state.articles : table === 'profiles' ? state.profiles : [];
    const filters = [];
    let single = false;
    let orderBy = null;

    const builder = {
      select(fields) {
        return builder;
      },
      eq(column, value) {
        filters.push((r) => r[column] === value);
        return builder;
      },
      ilike(column, pattern) {
        const pat = pattern.replace(/%/g, '').toLowerCase();
        filters.push((r) => String(r[column] ?? '').toLowerCase().includes(pat));
        return builder;
      },
      or() { return builder; },
      order(column, opts) { orderBy = { column, asc: !!opts.ascending }; return builder; },
      maybeSingle() { single = true; return builder; },
      async upsert(payload) {
        const item = { ...payload };
        if (!item.id) {
          item.id = makeId();
          item.created_at = new Date().toISOString();
          item.updated_at = item.created_at;
          tableRef.push(item);
          return { data: [clone(item)], error: null };
        }
        const idx = tableRef.findIndex((r) => r.id === item.id);
        if (idx === -1) {
          item.updated_at = new Date().toISOString();
          tableRef.push(item);
          return { data: [clone(item)], error: null };
        }
        item.updated_at = new Date().toISOString();
        tableRef[idx] = { ...tableRef[idx], ...item };
        return { data: [clone(tableRef[idx])], error: null };
      },
      async delete() {
        return {
          from: () => builder,
          eq(column, value) {
            const idx = tableRef.findIndex((r) => r[column] === value);
            if (idx === -1) return { data: [], error: null };
            const removed = tableRef.splice(idx, 1);
            return Promise.resolve({ data: clone(removed), error: null });
          },
        };
      },
      async then(resolve) {
        let rows = tableRef.slice();
        for (const f of filters) rows = rows.filter(f);
        if (orderBy) {
          rows.sort((a,b)=> (a[orderBy.column] < b[orderBy.column] ? (orderBy.asc? -1:1) : (a[orderBy.column] > b[orderBy.column] ? (orderBy.asc?1:-1):0)));
        }
        const data = single ? (rows[0] ?? null) : rows;
        return resolve({ data: clone(data), error: null });
      }
    };

    return builder;
  }

  return { auth, from };
}

module.exports = { createMockSupabase };
