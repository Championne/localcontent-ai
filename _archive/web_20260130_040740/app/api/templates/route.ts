import { NextResponse } from 'next/server';

export async function GET() {
  const templates = [
    {
      id: 'template-1',
      name: 'Blog Post Title Generator',
      variables: [
        { name: 'topic', type: 'text', placeholder: 'e.g., AI in Content Creation' },
        { name: 'audience', type: 'text', placeholder: 'e.g., Marketers, Small Businesses' },
        { name: 'tone', type: 'select', options: ['Informative', 'Humorous', 'Professional'], placeholder: 'e.g., Informative' },
      ],
    },
    {
      id: 'template-2',
      name: 'Product Description Writer',
      variables: [
        { name: 'productName', type: 'text', placeholder: 'e.g., Smart Coffee Mug' },
        { name: 'keyFeature1', type: 'text', placeholder: 'e.g., Temperature Control' },
        { name: 'keyFeature2', type: 'text', placeholder: 'e.g., App Integration' },
        { name: 'targetUser', type: 'text', placeholder: 'e.g., Busy Professionals' },
      ],
    },
  ];

  return NextResponse.json(templates);
}
