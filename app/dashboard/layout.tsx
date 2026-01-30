import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className='min-h-screen flex'>
      <aside className='w-64 bg-card border-r'>
        <div className='p-4'>
          <Link href='/dashboard' className='text-xl font-bold text-primary'>
            LocalContent.ai
          </Link>
        </div>
        <nav className='mt-4'>
          <Link href='/dashboard' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Dashboard
          </Link>
          <Link href='/dashboard/content' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Create Content
          </Link>
          <Link href='/dashboard/library' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Content Library
          </Link>
          <Link href='/dashboard/templates' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Templates
          </Link>
          <Link href='/dashboard/analytics' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Analytics
          </Link>
          <Link href='/dashboard/settings' className='flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted'>
            Settings
          </Link>
        </nav>
      </aside>
      <div className='flex-1 flex flex-col'>
        <header className='h-16 border-b bg-card flex items-center justify-between px-6'>
          <div></div>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-muted-foreground'>{user.email}</span>
            <form action='/auth/signout' method='post'>
              <button type='submit' className='text-sm text-muted-foreground hover:text-foreground'>
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className='flex-1 p-6 bg-muted/30'>
          {children}
        </main>
      </div>
    </div>
  )
}
