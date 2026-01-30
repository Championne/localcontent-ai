import Link from 'next/link'

export default function ContentLibraryPage() {
  // In production, this would fetch from Supabase
  const savedContent: Array<{
    id: string
    title: string
    type: string
    createdAt: string
    status: 'draft' | 'published' | 'scheduled'
  }> = []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Library</h1>
        <Link
          href="/dashboard/content"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Create New
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6">
        <select className="px-3 py-2 border rounded-md">
          <option value="">All Types</option>
          <option value="blog">Blog Posts</option>
          <option value="social">Social Media</option>
          <option value="gmb">Google Business</option>
          <option value="email">Email</option>
        </select>
        <select className="px-3 py-2 border rounded-md">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <input
          type="text"
          placeholder="Search content..."
          className="flex-1 px-3 py-2 border rounded-md"
        />
      </div>

      {/* Content List */}
      {savedContent.length > 0 ? (
        <div className="bg-card border rounded-lg divide-y">
          {savedContent.map((content) => (
            <div
              key={content.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50"
            >
              <div>
                <h3 className="font-medium">{content.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {content.type} • {content.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    content.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : content.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {content.status}
                </span>
                <button className="text-sm text-primary hover:underline">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No content yet</h3>
          <p className="text-muted-foreground mb-4">
            Start creating content to build your library
          </p>
          <Link
            href="/dashboard/content"
            className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Create Your First Content
          </Link>
        </div>
      )}
    </div>
  )
}
