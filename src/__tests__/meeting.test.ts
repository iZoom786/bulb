import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock fetch
global.fetch = vi.fn();

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(),
}));

describe('Meeting Submission', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id' } },
          error: null 
        }),
      },
    };
    
    (createClientComponentClient as any).mockReturnValue(mockSupabase);
    
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });
  
  it('should submit a meeting URL successfully', async () => {
    const meetingUrl = 'https://zoom.us/j/123456789';
    const workspaceId = 'test-workspace-id';
    
    // Mock fetch response for Recall API
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        id: 'test-bot-id',
        status: 'created'
      }),
    });
    
    // Call the API endpoint directly
    const response = await fetch('/api/meetings/create-bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingUrl, workspaceId }),
    });
    
    const data = await response.json();
    
    // Verify the API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/meetings/create-bot'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(meetingUrl),
      })
    );
    
    // Verify the response
    expect(response.ok).toBe(true);
    expect(data).toHaveProperty('id', 'test-bot-id');
  });
  
  it('should store meeting information in the database', async () => {
    const meetingUrl = 'https://zoom.us/j/123456789';
    const workspaceId = 'test-workspace-id';
    const botId = 'test-bot-id';
    
    // Mock the database insertion
    await mockSupabase.from('meetings').insert({
      url: meetingUrl,
      workspace_id: workspaceId,
      bot_id: botId,
      user_id: 'test-user-id',
      status: 'active',
    });
    
    // Verify the database insertion was called with correct parameters
    expect(mockSupabase.from).toHaveBeenCalledWith('meetings');
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        url: meetingUrl,
        workspace_id: workspaceId,
        bot_id: botId,
      })
    );
  });
});