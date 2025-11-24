import { redirect } from 'next/navigation';
import MeetingForm from '@/components/Meeting/MeetingForm';
import WorkspaceManager from '@/components/Workspace/WorkspaceManager';
import Header from '@/components/UI/Header';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const cookiesStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookiesStore });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Fetch user's workspaces
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  
  // Fetch user's meetings
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={{ email: session.user.email || '' }} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <WorkspaceManager 
            initialWorkspaces={workspaces || []} 
            userId={session.user.id} 
          />
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Join a Meeting</h2>
            <MeetingForm />
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
            {meetings && meetings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meeting URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {meeting.meeting_url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            meeting.status === 'active' ? 'bg-green-100 text-green-800' : 
                            meeting.status === 'ended' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(meeting.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No meetings yet. Join a meeting to get started.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}