import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/Logo GeoSpark.png" 
              alt="GeoSpark" 
              width={150} 
              height={40} 
              className="h-10 w-auto"
              priority
            />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="#examples" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Examples
            </Link>
            <Link href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Free Trial
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
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Local Content Marketing
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dominate Your Local Market with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
              AI for Local SEO
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Generate hyper-targeted, <strong>localized content</strong> — including SEO articles, social posts, and website copy — 
            that resonates with your community. Drive local engagement and <strong>improve local search rankings</strong> with our powerful AI local content writer.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Your Free 14-Day Trial
            </Link>
            <Link 
              href="#how-it-works" 
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-teal-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
            >
              See How It Works
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Setup in 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-white">
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-400">5,000+</p>
              <p className="text-sm text-gray-400">Local Businesses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">100K+</p>
              <p className="text-sm text-gray-400">Posts Generated</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">4.9/5</p>
              <p className="text-sm text-gray-400">Average Rating (1,200+ reviews)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">10+ hrs</p>
              <p className="text-sm text-gray-400">Saved Per Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">The Problem</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Local Businesses Are Invisible Online
              </h2>
              <p className="text-gray-600 mb-6">
                Local businesses struggle to stand out online. Generic content, lack of local SEO expertise, and limited resources 
                make it nearly impossible to attract nearby customers actively searching for your services.
              </p>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Time constraints</strong> — You're too busy running your business to create content consistently.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>No marketing expertise</strong> — No staff or in-depth knowledge to handle content marketing.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Agencies are too expensive</strong> — Traditional marketing costs $2,000-5,000/month or more.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Generic content doesn't work</strong> — Cookie-cutter posts fail to connect with local audiences.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>ROI uncertainty</strong> — Hard to measure if marketing efforts are actually working.</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-8">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">The Solution</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Your AI-Powered Local Marketing Team
              </h2>
              <p className="text-gray-600 mb-6">
                GeoSpark generates hyper-local, SEO-optimized content, automates distribution, and transforms your online presence 
                into a local lead-generation machine. Stop being invisible; start being the go-to local expert.
              </p>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Reclaim your time</strong> — AI creates a month of content while you finish your coffee.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>No marketing degree needed</strong> — Enterprise-level strategy made simple for any business owner.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Fraction of agency costs</strong> — Get better results starting at just $29/month.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Hyper-local relevance</strong> — Content that mentions your neighborhood, events, and community.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Measurable results</strong> — Track rankings, traffic, and leads from one dashboard.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              From Zero to Local Hero in 5 Steps
            </h2>
            <p className="text-xl text-gray-600">
              Start generating professional, locally-relevant content in minutes — no marketing experience needed.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6">
            {[
              {
                step: '1',
                title: 'Onboard & Personalize',
                description: 'Tell us about your business, target customers, and service area. Our AI learns your unique value.',
                icon: '🏪'
              },
              {
                step: '2',
                title: 'Generate Hyper-Local Content',
                description: 'Our AI crafts blog posts, service pages, and local guides with relevant keywords and geographic references.',
                icon: '✨'
              },
              {
                step: '3',
                title: 'Automate SEO & Distribution',
                description: 'We optimize for local search and distribute across your website, directories, and social platforms.',
                icon: '🚀'
              },
              {
                step: '4',
                title: 'Attract & Convert Leads',
                description: 'As local rankings climb, more nearby customers discover you — driving inquiries and sales.',
                icon: '🎯'
              },
              {
                step: '5',
                title: 'Analyze & Refine',
                description: 'Gain insights into performance. Our AI continually learns and adapts to maximize results.',
                icon: '📈'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Examples Section */}
      <section id="examples" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">See It In Action</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Content Created by GeoSpark
          </h2>
          <p className="text-xl text-gray-600">
            Real examples of AI-generated content for local businesses. Click, generate, publish — it's that simple.
          </p>
        </div>

        {/* Social Media Pack - 6 Posts */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            📱 Social Media Pack — 6 Platform-Optimized Posts in One Click
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Facebook */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#1877F2] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  ☕ Nothing beats a fresh cup from your neighborhood cafe! Stop by The Daily Grind on Main Street this weekend — we're featuring our new seasonal Maple Pecan Latte. 🍁
                </p>
                <p className="text-xs text-gray-400 mt-2">#LocalCoffee #MainStreet</p>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  That first sip feeling ✨ Our baristas craft every cup with love at The Daily Grind. Tag someone who needs their coffee fix! ☕️
                </p>
                <p className="text-xs text-gray-400 mt-2">#CoffeeLovers #CafeLife</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#0A66C2] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Supporting local businesses isn't just good ethics — it's good business. The Daily Grind has been serving our community for 15 years...
                </p>
                <p className="text-xs text-gray-400 mt-2">#SmallBusiness #Community</p>
              </div>
            </div>

            {/* X/Twitter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Monday motivation starts with great coffee ☕ Who else needs their local cafe fix today? 🙋‍♀️
                </p>
                <p className="text-xs text-gray-400 mt-2">#MondayMotivation</p>
              </div>
            </div>

            {/* Google Business */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#4285F4] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  🎉 New seasonal menu alert! Visit The Daily Grind at 123 Main Street to try our Maple Pecan Latte. Open 7am-7pm daily.
                </p>
              </div>
            </div>

            {/* NextDoor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#00B246] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                Nextdoor
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Hey neighbors! 👋 We're offering 10% off for Riverside residents this week at The Daily Grind. Just mention this post!
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            ↑ Generated in seconds — tailored for each platform's style and audience
          </p>
        </div>

        {/* CTA and Link to Full Examples */}
        <div className="text-center mt-12 space-y-4">
          <Link 
            href="/examples" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-lg"
          >
            See all examples: Blog Posts, Newsletters, Google Business & more
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <div>
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Try It Yourself — Free for 14 Days
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Features & Benefits</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Everything You Need to Win Locally
          </h2>
          <p className="text-xl text-gray-600">
            Powerful AI tools designed specifically for local businesses like yours.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Local Content Generation',
              description: 'Automatically create high-quality, relevant content tailored to your specific location and services. Save countless hours and resources on content creation.',
              color: 'teal'
            },
            {
              icon: '📍',
              title: 'Hyper-Local SEO Optimization',
              description: 'Rank higher in local search results (Google Maps, Google Search) for crucial "near me" and service-specific queries, driving qualified local leads directly to you.',
              color: 'orange'
            },
            {
              icon: '📢',
              title: 'Automated Content Distribution',
              description: 'Seamlessly publish content across your website, Google Business Profile, and key local directories without manual effort. Ensure consistent online presence.',
              color: 'purple'
            },
            {
              icon: '🔍',
              title: 'Competitor Analysis & Keyword Research',
              description: 'Stay ahead of the curve with insights into what your local competitors are doing right and discover untapped keyword opportunities in your area.',
              color: 'green'
            },
            {
              icon: '📊',
              title: 'Performance Analytics Dashboard',
              description: 'Track your local search rankings, website traffic, and lead generation from one intuitive dashboard. Make data-driven decisions easily.',
              color: 'blue'
            },
            {
              icon: '🏢',
              title: 'Multi-Location Management',
              description: 'Effortlessly manage and optimize local content strategies for multiple business locations from a single platform. Perfect for franchises and chains.',
              color: 'yellow'
            },
            {
              icon: '⭐',
              title: 'Reputation Management Integration',
              description: 'Enhance your online credibility by integrating with review platforms, improving your local SEO and building customer trust.',
              color: 'pink'
            },
            {
              icon: '🖼️',
              title: 'AI Image Generation',
              description: 'Matching visuals generated automatically for every post — no design skills or expensive stock photos needed.',
              color: 'indigo'
            },
            {
              icon: '⚡',
              title: 'Lightning Fast Creation',
              description: 'Generate a month of content in under 10 minutes. Bulk create and schedule ahead so you never miss a beat.',
              color: 'red'
            }
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Why GeoSpark Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wide">Why GeoSpark?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-400">
              We're not just another AI content tool — we're built specifically for local business success.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Built for Local',
                description: 'We understand the unique challenges and opportunities of local businesses, providing a solution specifically designed for your success.',
                icon: '🏠'
              },
              {
                title: 'Beyond Generic SEO',
                description: 'Our AI goes deeper, crafting content that resonates with local communities and satisfies the specific intent of local searches.',
                icon: '🎯'
              },
              {
                title: 'Time & Cost-Efficient',
                description: 'Get the power of a full marketing team at a fraction of the cost. Free up your time to focus on running your business.',
                icon: '💰'
              },
              {
                title: 'Tangible Results',
                description: 'Witness a measurable increase in your local search visibility, website traffic, phone calls, and in-store visits.',
                icon: '📈'
              },
              {
                title: 'Easy to Use',
                description: 'Our platform is designed for busy business owners — no complex SEO knowledge required. If you can fill out a form, you can use GeoSpark.',
                icon: '✨'
              },
              {
                title: 'Dedicated Support',
                description: 'Our team is here to support you every step of the way, ensuring you get the most out of GeoSpark.',
                icon: '🤝'
              }
            ].map((item) => (
              <div key={item.title} className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Success Stories</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Trusted by Local Businesses
          </h2>
          <p className="text-xl text-gray-600">
            See what business owners like you are saying about GeoSpark
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "Before GeoSpark, our small cafe rarely appeared in local searches. Within three months, our Google Maps visibility exploded, and we're now consistently ranking for 'best coffee near me.' Our foot traffic has increased by 30%!",
              name: "Sarah M.",
              role: "Owner, The Daily Grind Cafe",
              metric: "+30% foot traffic",
              rating: 5
            },
            {
              quote: "Managing content for our three plumbing locations was a nightmare. GeoSpark streamlined everything, giving each branch its own hyper-local content strategy. We've seen a significant uptick in service requests from new clients.",
              name: "David L.",
              role: "Marketing Manager, Rapid Plumbers Inc.",
              metric: "3 locations managed",
              rating: 5
            },
            {
              quote: "As a solo real estate agent, I needed a way to compete with larger agencies. GeoSpark helped me establish myself as the go-to expert for homes in my area. The quality of leads has been incredible.",
              name: "Emily R.",
              role: "Real Estate Agent",
              metric: "Top local expert",
              rating: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Simple Pricing. Powerful Results.
            </h2>
            <p className="text-xl text-gray-600">
              From hours to minutes — generate a month of content for less than one freelance article.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Save 20% with annual billing
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-500 text-sm mb-4 h-10">Try it out, no credit card required</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 business
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 content pieces/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 AI images/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  2 platforms
                </li>
              </ul>
              <Link 
                href="/auth/signup" 
                className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-500 text-sm mb-4 h-10">Perfect for solo business owners</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-teal-600 font-medium mb-5">$23/mo billed annually</p>
              <ul className="space-y-3 mb-8 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 business
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30 content pieces/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30 AI images/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 6 platforms
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved content library
                </li>
              </ul>
              <Link 
                href="/auth/signup?plan=starter" 
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-500 relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-500 text-sm mb-4 h-10">For growing businesses with multiple locations</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">$79</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-teal-600 font-medium mb-5">$63/mo billed annually</p>
              <ul className="space-y-3 mb-8 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3 businesses
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100 content pieces/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100 AI images/month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 6 platforms
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Analytics dashboard
                </li>
              </ul>
              <Link 
                href="/auth/signup?plan=pro" 
                className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-gray-500 text-sm mb-4 h-10">For agencies and multi-location businesses</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">$179</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-teal-600 font-medium mb-5">$143/mo billed annually</p>
              <ul className="space-y-3 mb-8 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  10 businesses
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited content
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited AI images
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3 team members
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link 
                href="/auth/signup?plan=premium" 
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            All paid plans include a 14-day free trial. Cancel anytime. 30-day money-back guarantee.
          </p>
          
          <div className="text-center mt-4">
            <Link href="/pricing" className="text-teal-600 font-medium hover:text-teal-700">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What kind of content does GeoSpark generate?",
                a: "We generate a variety of hyper-local content including blog posts (e.g., 'Best Italian Restaurants in [Your City]'), service pages optimized for specific local keywords (e.g., 'Emergency Plumbing Services in [Your Neighborhood]'), social media posts, Google Business Profile updates, local guides, and responses to common local queries."
              },
              {
                q: "How does GeoSpark improve my local SEO?",
                a: "Our platform identifies high-value local keywords, integrates geographic markers into your content, optimizes your Google Business Profile with fresh content, and helps with local directory submissions — all crucial factors for ranking higher in local search results."
              },
              {
                q: "Do I need any technical skills to use GeoSpark?",
                a: "Not at all! GeoSpark is designed to be user-friendly for business owners of all technical levels. Our intuitive dashboard makes content generation and management simple. If you can fill out a form, you can use GeoSpark."
              },
              {
                q: "Can I approve or edit the content before it goes live?",
                a: "Yes, absolutely. You have full control. All generated content is queued for your review and approval. You can make any edits or request revisions before publishing."
              },
              {
                q: "How long does it take to see results?",
                a: "While SEO is a continuous process, many of our clients start seeing noticeable improvements in local search rankings and website traffic within 4-8 weeks, with more significant impact over 3-6 months of consistent posting."
              },
              {
                q: "Is GeoSpark suitable for businesses with multiple locations?",
                a: "Yes! Our Growth and Enterprise plans are perfectly suited for businesses with multiple locations, offering tools for centralized management and customized local strategies for each branch."
              },
              {
                q: "What if I already have a marketing team or an SEO agency?",
                a: "GeoSpark can complement your existing marketing efforts by significantly boosting your content output and local SEO efficiency, allowing your team to focus on broader strategies or other initiatives. It's a powerful tool to enhance their capabilities."
              },
              {
                q: "What types of businesses is GeoSpark best for?",
                a: "GeoSpark works great for any local business that wants to attract nearby customers — restaurants, salons, contractors, dentists, fitness studios, retail stores, professional services, real estate agents, and more. If you serve a local area, GeoSpark can help."
              }
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Dominate Your Local Market?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join 5,000+ local businesses already using GeoSpark to attract more customers with less effort. 
            Turn content into customers today.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free 14-Day Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-teal-200 text-sm mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Image 
                  src="/Logo GeoSpark.png" 
                  alt="GeoSpark" 
                  width={140} 
                  height={36} 
                  className="h-9 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-sm">
                AI-powered content marketing for local businesses. Generate hyper-local content that ranks and converts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-teal-400">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-teal-400">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-teal-400">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-teal-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-teal-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/signup" className="hover:text-teal-400">Free Trial</Link></li>
                <li><Link href="/auth/login" className="hover:text-teal-400">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 GeoSpark. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-teal-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-teal-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
