import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookiesStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookiesStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get meeting URL from request
    const { meetingUrl } = await request.json();
    
    if (!meetingUrl) {
      return NextResponse.json({ error: 'Meeting URL is required' }, { status: 400 });
    }
    
    // Call Recall.ai API to create a bot
    const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        recording_config: {
          transcript: {
            provider: {
              recallai_streaming: {
                mode: "prioritize_low_latency",
                language_code: "en"
              }
            }
          }
        }
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: data.message || 'Failed to create meeting bot' 
      }, { status: response.status });
    }
    
    // Store meeting information in Supabase
    const { error: dbError } = await supabase
      .from('meetings')
      .insert({
        user_id: session.user.id,
        meeting_url: meetingUrl,
        bot_id: data.id,
        status: data.status,
      });
    
    if (dbError) {
      console.error('Error storing meeting data:', dbError);
    }
    
    return NextResponse.json({ 
      success: true,
      botId: data.id,
      status: data.status
    });
    
  } catch (error: any) {
    console.error('Error creating meeting bot:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}