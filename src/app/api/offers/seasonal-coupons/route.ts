import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isCouponVisibleOnOffersPage(coupon: {
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
}): boolean {
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return false;
  }

  if (coupon.valid_until) {
    const validUntil = new Date(coupon.valid_until);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (validUntil < today) {
      return false;
    }
  }

  return true;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(
        'id, code, name, description, discount_type, discount_value, min_rental_days, valid_from, valid_until, max_uses, current_uses'
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seasonal coupons:', error);
      return NextResponse.json(
        { coupons: [], error: 'Error al obtener cupones' },
        { status: 500 }
      );
    }

    const coupons = (data || []).filter(isCouponVisibleOnOffersPage);

    return NextResponse.json({
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error('Error in seasonal coupons API:', error);
    return NextResponse.json(
      { coupons: [], error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
