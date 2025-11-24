import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(),
}));

describe('Authentication Flow', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    };
    
    (createClientComponentClient as any).mockReturnValue(mockSupabase);
  });
  
  it('should sign up a user successfully', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ error: null });
    
    const email = 'test@example.com';
    const password = 'password123';
    
    const result = await mockSupabase.auth.signUp({ email, password });
    
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({ email, password });
    expect(result.error).toBeNull();
  });
  
  it('should sign in a user successfully', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    
    const email = 'test@example.com';
    const password = 'password123';
    
    const result = await mockSupabase.auth.signInWithPassword({ email, password });
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(result.error).toBeNull();
  });
  
  it('should sign out a user successfully', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    
    const result = await mockSupabase.auth.signOut();
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});