"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  meetingUrl: string;
};

export default function MeetingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/meetings/create-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingUrl: data.meetingUrl }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create meeting bot');
      }
      
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Meeting bot created successfully! The bot will join the meeting and record content.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting URL
          </label>
          <input
            id="meetingUrl"
            type="text"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('meetingUrl', { 
              required: 'Meeting URL is required',
              pattern: {
                value: /^https?:\/\/.+/i,
                message: 'Please enter a valid URL',
              }
            })}
          />
          {errors.meetingUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.meetingUrl.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Creating Bot...' : 'Send Bot to Meeting'}
        </button>
      </form>
    </div>
  );
}