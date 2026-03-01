import { NextRequest, NextResponse } from 'next/server';
import { getMotorhomeServices } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = searchParams.get('category') || undefined;
  const province = searchParams.get('province') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const { data, error, count } = await getMotorhomeServices({
    category,
    province,
    search,
    limit: Math.min(limit, 200),
    offset,
    minQuality: 0,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}
