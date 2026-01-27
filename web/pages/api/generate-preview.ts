import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { templateId, variables } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    // Simulate calling the Python script template_preview_generator.py
    // In a real scenario, you would execute an external process here,
    // e.g., using child_process in Node.js, and pass templateId and variables.
    // For this mock, we'll just return a predefined response based on inputs.

    console.log(`Simulating preview generation for Template ID: ${templateId}`);
    console.log('Variables received:', variables);

    // Mock generated content
    const generatedContent = `
      <h1>Preview for Template: ${templateId}</h1>
      <p>Hello ${variables?.name || 'there'}!</p>
      <p>This is a simulated preview generated with the following data:</p>
      <pre>${JSON.stringify(variables, null, 2)}</pre>
      <p>Current Timestamp: ${new Date().toISOString()}</p>
    `;

    return res.status(200).json({ preview: generatedContent });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
