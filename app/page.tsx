import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">GeoSpark</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              About
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-3">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-gray-700"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Local Content
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Spark Your Local Content
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Generate SEO-optimized, locally-relevant content for your business in minutes, not hours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-16 px-4">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-medium transition-colors shadow-lg shadow-orange-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Creating Free
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-teal-300 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-medium transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto px-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours to Minutes</h3>
              <p className="text-sm text-gray-600">Generate a month of content in the time it takes for a coffee break</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hyper-Local Focus</h3>
              <p className="text-sm text-gray-600">AI that truly understands your neighborhood and customers</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Results</h3>
              <p className="text-sm text-gray-600">Turn content into customers with SEO-optimized posts</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">GeoSpark</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-teal-600 transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-teal-600 transition-colors">About</Link>
              <Link href="/contact" className="hover:text-teal-600 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2026 GeoSpark
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
