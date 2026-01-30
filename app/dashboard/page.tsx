import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {userName ? `Welcome back, ${userName}!` : "Welcome back!"}
      </h1>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Content Created</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Views This Month</p>
          <p className="text-3xl font-bold mt-1">-</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="text-3xl font-bold mt-1">-</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="text-3xl font-bold mt-1">Free</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/content" className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
          <h3 className="font-medium">Create Content</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate new AI content</p>
        </Link>
        <Link href="/dashboard/templates" className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
          <h3 className="font-medium">Browse Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">Choose from templates</p>
        </Link>
        <Link href="/dashboard/settings" className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
          <h3 className="font-medium">Connect Google Business</h3>
          <p className="text-sm text-muted-foreground mt-1">Link your GMB profile</p>
        </Link>
      </div>
      <h2 className="text-lg font-semibold mb-4">Recent Content</h2>
      <div className="bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No content yet. Create your first piece!</p>
        <Link href="/dashboard/content" className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Create Content
        </Link>
      </div>
    </div>
  )
}
