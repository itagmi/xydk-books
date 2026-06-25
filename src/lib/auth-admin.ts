import type { User } from '@supabase/supabase-js';
import { createAdminClient } from './supabase/admin';

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match;

    if (data.users.length < perPage) break;
    page++;
  }

  return null;
}
