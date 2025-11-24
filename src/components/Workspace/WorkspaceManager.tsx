"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';

type Workspace = {
  id: string;
  name: string;
  created_at: string;
};

type WorkspaceFormData = {
  name: string;
};

type WorkspaceManagerProps = {
  initialWorkspaces: Workspace[];
  userId: string;
};

export default function WorkspaceManager({ initialWorkspaces, userId }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(
    initialWorkspaces.length > 0 ? initialWorkspaces[0].id : null
  );
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceFormData>();
  
  const createWorkspace = async (data: WorkspaceFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
          name: data.name,
          user_id: userId,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      setWorkspaces([...workspaces, newWorkspace]);
      setActiveWorkspace(newWorkspace.id);
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };
  
  const switchWorkspace = (workspaceId: string) => {
    setActiveWorkspace(workspaceId);
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Workspaces</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <form onSubmit={handleSubmit(createWorkspace)} className="flex gap-2">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="New workspace name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('name', { required: 'Workspace name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Your Workspaces</h3>
        {workspaces.length === 0 ? (
          <p className="text-sm text-gray-500">No workspaces yet. Create one to get started.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => switchWorkspace(workspace.id)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeWorkspace === workspace.id
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {workspace.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}