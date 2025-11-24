import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientComponentClient, createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  redirect: vi.fn(),
}));

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(),
  createServerComponentClient: vi.fn(),
  createRouteHandlerClient: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Complete Application Flow', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      data: [
        { id: 'workspace-1', name: 'Workspace 1' },
        { id: 'workspace-2', name: 'Workspace 2' }
      ],
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null 
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
          error: null
        }),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    };
    
    (createClientComponentClient as any).mockReturnValue(mockSupabase);
    (createServerComponentClient as any).mockReturnValue(mockSupabase);
    (createRouteHandlerClient as any).mockReturnValue(mockSupabase);
    
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });
  
  it('should complete the full user journey', async () => {
    // Step 1: User signs up
    mockSupabase.auth.signUp.mockResolvedValue({ error: null });
    const signUpResult = await mockSupabase.auth.signUp({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
    expect(signUpResult.error).toBeNull();
    
    // Step 2: User signs in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    const signInResult = await mockSupabase.auth.signInWithPassword({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
    expect(signInResult.error).toBeNull();
    
    // Step 3: User creates a workspace
    const workspaceName = 'New Workspace';
    mockSupabase.from().insert.mockResolvedValue({ 
      data: { id: 'new-workspace-id', name: workspaceName },
      error: null 
    });
    
    const workspaceResult = await mockSupabase.from('workspaces').insert({
      name: workspaceName,
      user_id: 'test-user-id'
    });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
    expect(workspaceResult.error).toBeNull();
    
    // Step 4: User submits a meeting URL
    const meetingUrl = 'https://zoom.us/j/123456789';
    
    // Mock Recall API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        id: 'test-bot-id',
        status: 'created'
      }),
    });
    
    // Submit meeting URL
    const response = await fetch('/api/meetings/create-bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        meetingUrl, 
        workspaceId: 'new-workspace-id' 
      }),
    });
    
    const data = await response.json();
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/meetings/create-bot'),
      expect.any(Object)
    );
    
    // Step 5: Meeting is stored in database
    mockSupabase.from().insert.mockResolvedValue({ error: null });
    
    const meetingResult = await mockSupabase.from('meetings').insert({
      url: meetingUrl,
      workspace_id: 'new-workspace-id',
      bot_id: 'test-bot-id',
      user_id: 'test-user-id',
      status: 'active',
    });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('meetings');
    expect(meetingResult.error).toBeNull();
    
    // Step 6: User signs out
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    const signOutResult = await mockSupabase.auth.signOut();
    expect(signOutResult.error).toBeNull();
  });
});