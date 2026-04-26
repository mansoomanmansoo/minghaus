import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest) {
  const checks: Record<string, string> = {};

  checks.anthropic_key = process.env.ANTHROPIC_API_KEY
    ? `set (${process.env.ANTHROPIC_API_KEY.slice(0, 12)}...)`
    : 'MISSING';

  checks.supabase_url = process.env.SUPABASE_URL
    ? `set (${process.env.SUPABASE_URL.slice(0, 30)}...)`
    : 'MISSING';

  checks.supabase_key = process.env.SUPABASE_SECRET_KEY
    ? `set (${process.env.SUPABASE_SECRET_KEY.slice(0, 12)}...)`
    : 'MISSING';

  checks.voyage_key = process.env.VOYAGE_API_KEY
    ? `set (${process.env.VOYAGE_API_KEY.slice(0, 12)}...)`
    : 'MISSING';

  try {
    const user = await getSessionUser();
    checks.auth = user ? `ok (${user.email})` : 'not logged in';
  } catch (e) {
    checks.auth = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  try {
    const { error } = await db.from('personas').select('id').limit(1);
    checks.supabase_db = error ? `error: ${error.message}` : 'ok';
  } catch (e) {
    checks.supabase_db = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return new Response(JSON.stringify(checks, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
