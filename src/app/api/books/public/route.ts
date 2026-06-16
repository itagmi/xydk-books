import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();

  const ownerId = process.env.PUBLIC_OWNER_USER_ID;

  const query = supabase
    .from('books')
    .select('title, author, status, cover_image, category, review')
    .order('created_at', { ascending: false });

  if (ownerId) query.eq('user_id', ownerId);

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? [], {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
