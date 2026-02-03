import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b border-gray-100 bg-white'>
        <nav className='container mx-auto px-4 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <span className='text-xl font-bold text-gray-900'>GeoSpark</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className='hidden md:flex gap-6 items-center'>
            <Link href='/pricing' className='text-sm text-gray-600 hover:text-teal-600 transition-colors'>
              Pricing
            </Link>
            <Link href='/about' className='text-sm text-gray-600 hover:text-teal-600 transition-colors'>
              About
            </Link>
            <Link href='/contact' className='text-sm text-gray-600 hover:text-teal-600 transition-colors'>
              Contact
            </Link>
            <Link href='/auth/login' className='text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors'>
              Sign In
            </Link>
            <Link 
              href='/auth/signup' 
              className='bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors'
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className='flex md:hidden items-center gap-3'>
            <Link href='/auth/login' className='text-sm font-medium text-gray-700'>
              Sign In
            </Link>
            <Link 
              href='/auth/signup' 
              className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>
      
      <main className='flex-1'>{children}</main>
      
      <footer className='border-t border-gray-100 bg-gray-50 py-8 md:py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center'>
                <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
              </div>
              <span className='font-bold text-gray-900'>GeoSpark</span>
            </div>
            <div className='flex gap-6 text-sm text-gray-500'>
              <Link href='/pricing' className='hover:text-teal-600 transition-colors'>Pricing</Link>
              <Link href='/about' className='hover:text-teal-600 transition-colors'>About</Link>
              <Link href='/contact' className='hover:text-teal-600 transition-colors'>Contact</Link>
            </div>
            <div className='text-sm text-gray-400'>
              © 2026 GeoSpark
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
