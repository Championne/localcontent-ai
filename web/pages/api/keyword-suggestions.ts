
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In a real scenario, this would call the Python script (e.g., via a subprocess or an external service)
  // and process its output. For now, we'll return mock data.

  // Simulate a delay for network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockSuggestions = [
    { value: 'schadeverhaal', label: 'Schadeverhaal' },
    { value: 'aanrijding', label: 'Aanrijding' },
    { value: 'verzekering', label: 'Verzekering' },
    { value: 'letsel', label: 'Letsel' },
    { value: 'juridisch advies', label: 'Juridisch Advies' },
  ];

  res.status(200).json(mockSuggestions);
}
