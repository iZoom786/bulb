import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Home() {
  // Properly await cookies()
  const cookiesStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookiesStore });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/auth/signin');
  }
  
  // This will never be rendered
  return null;
}
