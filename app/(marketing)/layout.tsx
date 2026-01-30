import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b'>
        <nav className='container mx-auto px-4 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            LocalContent.ai
          </Link>
          <div className='flex gap-4 items-center'>
            <Link href='/pricing' className='text-sm hover:underline'>
              Pricing
            </Link>
            <Link href='/about' className='text-sm hover:underline'>
              About
            </Link>
            <Link href='/auth/login' className='text-sm font-medium'>
              Sign In
            </Link>
            <Link 
              href='/auth/signup' 
              className='bg-black text-white px-4 py-2 rounded-md text-sm'
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>
      <main className='flex-1'>{children}</main>
      <footer className='border-t py-8'>
        <div className='container mx-auto px-4 text-center text-sm text-gray-500'>
          © 2026 LocalContent.ai. All rights reserved.
        </div>
      </footer>
    </div>
  )
}