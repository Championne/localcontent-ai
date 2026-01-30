import Link from 'next/link'

export default function TemplatesPage() {
  const templates = [
    {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'SEO-optimized blog articles that rank',
      category: 'Content',
      industries: ['All'],
    },
    {
      id: 'gmb-post',
      name: 'Google Business Post',
      description: 'Updates, offers, and events for GMB',
      category: 'Local SEO',
      industries: ['All'],
    },
    {
      id: 'social-facebook',
      name: 'Facebook Post',
      description: 'Engaging posts for Facebook',
      category: 'Social Media',
      industries: ['All'],
    },
    {
      id: 'social-instagram',
      name: 'Instagram Caption',
      description: 'Eye-catching captions with hashtags',
      category: 'Social Media',
      industries: ['All'],
    },
    {
      id: 'review-response',
      name: 'Review Response',
      description: 'Professional responses to customer reviews',
      category: 'Reputation',
      industries: ['All'],
    },
    {
      id: 'email-newsletter',
      name: 'Email Newsletter',
      description: 'Monthly updates for your customers',
      category: 'Email',
      industries: ['All'],
    },
    {
      id: 'plumber-emergency',
      name: 'Emergency Services Post',
      description: '24/7 availability and emergency content',
      category: 'Industry',
      industries: ['Plumber', 'HVAC', 'Electrician'],
    },
    {
      id: 'restaurant-menu',
      name: 'Menu Highlight',
      description: 'Showcase dishes and specials',
      category: 'Industry',
      industries: ['Restaurant', 'Cafe'],
    },
  ]

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Link
          href="/dashboard/content"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Create Content
        </Link>
      </div>

      <p className="text-muted-foreground mb-6">
        Choose from our library of industry-specific templates to generate content quickly.
      </p>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            className="px-3 py-1 text-sm border rounded-full hover:bg-muted"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-card border rounded-lg p-4 hover:border-primary transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{template.name}</h3>
              <span className="text-xs px-2 py-1 bg-muted rounded-full">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {template.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {template.industries.join(', ')}
              </span>
              <Link
                href={`/dashboard/content?template=${template.id}`}
                className="text-sm text-primary hover:underline"
              >
                Use Template
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
