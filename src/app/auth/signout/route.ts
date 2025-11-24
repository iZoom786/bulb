import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookiesStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookiesStore });
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL));
}