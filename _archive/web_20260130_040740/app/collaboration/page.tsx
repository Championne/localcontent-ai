// localcontent_ai/web/app/collaboration/page.tsx

'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

interface SharedTemplate {
  id: string;
  name: string;
  shares: number;
  downloads: number;
  comments: Comment[]; // Added comments
}

interface PeerConnection {
  id: string;
  name: string;
  status: string;
  lastOnline: string;
}

interface CommunityEngagement {
  totalUsers: number;
  activeUsersLast24h: number;
  newUsersLast7d: number;
  totalInteractions: number;
}

interface NetworkEffectsData {
  sharedTemplates: SharedTemplate[];
  peerConnections: PeerConnection[];
  communityEngagement: CommunityEngagement;
}

export default function CollaborationPage() {
  const [data, setData] = useState<NetworkEffectsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareForm, setShowShareForm] = useState<boolean>(false); // New state for share form

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data with comments for demonstration purposes
        const mockData: NetworkEffectsData = {
          sharedTemplates: [
            {
              id: 'temp1',
              name: 'Project Plan Template v2',
              shares: 12,
              downloads: 45,
              comments: [
                { id: 'c1', userId: 'userA', content: 'Great template! Very helpful.', timestamp: '2023-10-27T10:00:00Z' },
                { id: 'c2', userId: 'userB', content: 'Loved the updated Gantt chart.', timestamp: '2023-10-27T11:15:00Z' },
              ],
            },
            {
              id: 'temp2',
              name: 'Marketing Campaign Outline',
              shares: 8,
              downloads: 20,
              comments: [
                { id: 'c3', userId: 'userC', content: 'Useful for our Q4 planning.', timestamp: '2023-10-26T14:30:00Z' },
              ],
            },
            {
              id: 'temp3',
              name: 'Weekly Sync Agenda',
              shares: 25,
              downloads: 100,
              comments: [], // No comments yet
            },
          ],
          peerConnections: [
            { id: 'peer1', name: 'Alice Smith', status: 'Online', lastOnline: 'Just now' },
            { id: 'peer2', name: 'Bob Johnson', status: 'Offline', lastOnline: '2 hours ago' },
          ],
          communityEngagement: {
            totalUsers: 1500,
            activeUsersLast24h: 350,
            newUsersLast7d: 50,
            totalInteractions: 12000,
          },
        };

        // In a real application, you would still fetch from an API
        // const response = await fetch('/api/network-effects');
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const result: NetworkEffectsData = await response.json();
        setData(mockData); // Using mockData for now
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading network effects data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data available.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Local Network Effects Overview</h1>

      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Shared Templates</h2>
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Share Template
          </button>
        </div>
        {showShareForm && (
          <div className="bg-white p-4 rounded-md shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Share Template Form (Mock)</h3>
            <p>Here, a form would appear to select a template, choose recipients/groups, and add a message.</p>
            <button
              onClick={() => setShowShareForm(false)}
              className="mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
            >
              Close
            </button>
          </div>
        )}
        <ul className="list-none bg-gray-100 p-3 rounded-md"> {/* Changed from list-disc to list-none for better styling control */}
          {data.sharedTemplates.map((template) => (
            <li key={template.id} className="mb-4 p-2 border-b border-gray-200 last:border-b-0">
              <strong className="text-lg">{template.name}</strong>: {template.shares} shares, {template.downloads} downloads
              {template.comments.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-gray-300">
                  <h4 className="text-md font-medium mb-1">Comments:</h4>
                  {template.comments.map((comment) => (
                    <p key={comment.id} className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">{comment.userId}</span>: {comment.content} <span className="text-xs text-gray-500">({new Date(comment.timestamp).toLocaleDateString()})</span>
                    </p>
                  ))}
                </div>
              )}
               {template.comments.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 italic">No comments yet. Be the first to react!</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Peer Connections</h2>
        <ul className="list-disc list-inside bg-gray-100 p-3 rounded-md">
          {data.peerConnections.map((peer) => (
            <li key={peer.id} className="mb-1">
              <strong>{peer.name}</strong> - Status: {peer.status} (Last Online: {peer.lastOnline})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Community Engagement Metrics</h2>
        <div className="bg-gray-100 p-3 rounded-md">
          <p><strong>Total Users:</strong> {data.communityEngagement.totalUsers}</p>
          <p><strong>Active Users (Last 24h):</strong> {data.communityEngagement.activeUsersLast24h}</p>
          <p><strong>New Users (Last 7d):</strong> {data.communityEngagement.newUsersLast7d}</p>
          <p><strong>Total Interactions:</strong> {data.communityEngagement.totalInteractions}</p>
        </div>
      </section>
    </div>
  );
}