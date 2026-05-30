export type DatabaseEnvironment = 'debug' | 'production';

export class DatabaseProvider {
  private static instance: DatabaseProvider | null = null;
  public readonly environment: DatabaseEnvironment;
  public readonly useSQLite: boolean;
  public readonly useSupabase: boolean;

  private constructor() {
    const debugFlag = String(process.env.DEBUG ?? '').toLowerCase() === 'true';

    const SUPABASE_URL = String(process.env.SUPABASE_URL ?? '');
    const SUPABASE_SERVICE_KEY = String(process.env.SUPABASE_SERVICE_KEY ?? '');
    const NEXT_PUBLIC_SUPABASE_URL = String(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
    const NEXT_PUBLIC_SUPABASE_ANON_KEY = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');

    const looksLikePlaceholder = (v: string) => {
      const lower = v.toLowerCase();
      return (
        !v ||
        lower.includes('test.supabase.co') ||
        lower.includes('your-supabase') ||
        lower.includes('example') ||
        lower.includes('changeme') ||
        lower.includes('test-')
      );
    };

    const supabaseConfigured = Boolean(
      SUPABASE_URL &&
      SUPABASE_SERVICE_KEY &&
      NEXT_PUBLIC_SUPABASE_URL &&
      NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !looksLikePlaceholder(SUPABASE_URL) &&
      !looksLikePlaceholder(SUPABASE_SERVICE_KEY) &&
      !looksLikePlaceholder(NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );

    this.useSQLite = debugFlag || !supabaseConfigured;
    this.useSupabase = !this.useSQLite;
    this.environment = this.useSupabase ? 'production' : 'debug';
  }

  public static getInstance() {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new DatabaseProvider();
    }
    return DatabaseProvider.instance;
  }

  public assertSupabaseConfig() {
    if (!this.useSupabase) {
      return;
    }

    const missing = [] as string[];
    if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_KEY');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (missing.length > 0) {
      throw new Error(`Supabase configuration is incomplete. Missing: ${missing.join(', ')}`);
    }
  }
}
