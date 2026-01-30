import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // In a real application, you would call template_sharing_prototype.py here,
    // or fetch data from a database/service.
    // For now, we return mock data based on localcontent_ai/ui_mockups/local_network_design.md concepts.

    const mockData = {
      sharedTemplates: [
        { id: 't1', name: 'Daily Standup Template', shares: 120, downloads: 85 },
        { id: 't2', name: 'Project Planning Doc', shares: 80, downloads: 60 },
        { id: 't3', name: 'Meeting Notes Format', shares: 200, downloads: 150 },
        { id: 't4', name: 'Marketing Campaign Brief', shares: 55, downloads: 40 },
        { id: 't5', name: 'Onboarding Checklist', shares: 90, downloads: 70 },
      ],
      peerConnections: [
        { id: 'p1', name: 'Alice Smith', status: 'connected', lastOnline: '2 hours ago' },
        { id: 'p2', name: 'Bob Johnson', status: 'connected', lastOnline: '1 day ago' },
        { id: 'p3', name: 'Charlie Brown', status: 'pending', lastOnline: 'N/A' },
        { id: 'p4', name: 'Diana Prince', status: 'connected', lastOnline: '5 minutes ago' },
      ],
      communityEngagement: {
        totalUsers: 1500,
        activeUsersLast24h: 320,
        newUsersLast7d: 55,
        totalInteractions: 7800, // e.g., likes, comments, shares
      },
    };

    res.status(200).json(mockData);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
