
export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Product Description',
    description: 'Generates a product description based on product name and features.',
    variables: [
      { name: 'productName', type: 'text', label: 'Product Name' },
      { name: 'features', type: 'textarea', label: 'Key Features (comma-separated)' },
    ],
    templateContent: 'Write a compelling product description for {{productName}} highlighting its key features: {{features}}.',
  },
  {
    id: 'template-2',
    name: 'Social Media Post',
    description: 'Creates a short social media post for an event.',
    variables: [
      { name: 'eventName', type: 'text', label: 'Event Name' },
      { name: 'eventDate', type: 'date', label: 'Event Date' },
      { name: 'callToAction', type: 'text', label: 'Call to Action' },
    ],
    templateContent: '🗓️ Don't miss out on {{eventName}} on {{eventDate}}! {{callToAction}}',
  },
  {
    id: 'template-3',
    name: 'Email Subject Line',
    description: 'Generates catchy email subject lines.',
    variables: [
      { name: 'topic', type: 'text', label: 'Email Topic' },
      { name: 'urgency', type: 'boolean', label: 'Add Urgency?' },
    ],
    templateContent: '{{urgency ? "[URGENT] " : ""}}New Update: {{topic}}',
  },
];

export async function fetchTemplates() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTemplates.map(({ id, name, description }) => ({ id, name, description })));
    }, 500);
  });
}

export async function fetchTemplateById(id: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const template = mockTemplates.find((t) => t.id === id);
      if (template) {
        resolve(template);
      } else {
        reject(new Error('Template not found'));
      }
    }, 500);
  });
}
