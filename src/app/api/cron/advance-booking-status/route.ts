import { NextRequest, NextResponse } from 'next/server';
import { advanceConfirmedToInProgress } from '@/lib/bookings/advance-rental-status';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cron/advance-booking-status
 *
 * Cron horario: pasa reservas `confirmed` → `in_progress` cuando llega
 * la fecha/hora de entrega (Europe/Madrid).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await advanceConfirmedToInProgress();

  return NextResponse.json({
    success: true,
    updated: result.updated,
    bookingNumbers: result.bookingNumbers,
  });
}
