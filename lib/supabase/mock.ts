type Row = Record<string, any>;
type Profile = { id: string; email: string; role: string; password: string };

function clone(v: any) {
  return JSON.parse(JSON.stringify(v));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

let globalState: any = null;

function getState() {
  if (globalState) return globalState;
  
  // Load session from localStorage if available (browser environment)
  let session = null;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock-supabase-session');
      session = stored ? JSON.parse(stored) : null;
    } catch (e) {
      // ignore
    }
  }

  globalState = {
    session,
    profiles: [
      { id: 'admin-1', email: 'admin@echosante.org', role: 'admin', password: 'password' },
    ] as Profile[],
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
    ] as Row[],
  };

  return globalState;
}

function saveSession(session: any) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (session) {
      localStorage.setItem('mock-supabase-session', JSON.stringify(session));
    } else {
      localStorage.removeItem('mock-supabase-session');
    }
  }
}

export function createMockSupabase() {
  const state = getState();

  const auth = {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const user = state.profiles.find((p: Profile) => p.email === email && p.password === password);
      if (!user) {
        return { data: null, error: { message: 'Invalid login' } };
      }
      state.session = { user: { id: user.id, email: user.email }, access_token: 'mock-token' };
      saveSession(state.session);
      return { data: { session: state.session }, error: null };
    },
    async signOut() {
      state.session = null;
      saveSession(null);
      return { error: null };
    },
    async getSession() {
      return { data: { session: state.session }, error: null };
    },
  };

  function from(table: string) {
    let tableRef: Row[] = table === 'articles' ? state.articles : table === 'profiles' ? state.profiles : [];
    const filters: Array<(r: Row) => boolean> = [];
    let selectedFields: string[] | null = null;
    let single = false;
    let orderBy: { column: string; asc: boolean } | null = null;

    const builder: any = {
      select(fields?: string) {
        if (fields) {
          selectedFields = fields.split(',').map((s: string) => s.trim());
        }
        return builder;
      },
      eq(column: string, value: any) {
        filters.push((r) => r[column] === value);
        return builder;
      },
      ilike(column: string, pattern: string) {
        const pat = pattern.replace(/%/g, '').toLowerCase();
        filters.push((r) => String(r[column] ?? '').toLowerCase().includes(pat));
        return builder;
      },
      or(_: string) {
        // simplistic: ignore complex or, not used in tests heavily
        return builder;
      },
      order(column: string, opts: { ascending?: boolean } = {}) {
        orderBy = { column, asc: !!opts.ascending };
        return builder;
      },
      maybeSingle() {
        single = true;
        return builder;
      },
      then(resolve: any) {
        // execute query
        let rows = tableRef.slice();
        for (const f of filters) rows = rows.filter(f);
        if (orderBy) {
          rows.sort((a, b) => {
            if (a[orderBy!.column] < b[orderBy!.column]) return orderBy!.asc ? -1 : 1;
            if (a[orderBy!.column] > b[orderBy!.column]) return orderBy!.asc ? 1 : -1;
            return 0;
          });
        }
        const data = single ? (rows[0] ?? null) : rows;
        return Promise.resolve(resolve({ data: clone(data), error: null }));
      },
      async upsert(payload: any, _opts?: any) {
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
          eq(column: string, value: any) {
            const idx = tableRef.findIndex((r) => r[column] === value);
            if (idx === -1) return { data: [], error: null };
            const removed = tableRef.splice(idx, 1);
            return Promise.resolve({ data: clone(removed), error: null });
          },
        } as any;
      },
    };

    return builder;
  }

  return {
    auth,
    from,
    // keep API compatibility
  };
}

export type MockSupabase = ReturnType<typeof createMockSupabase>;
