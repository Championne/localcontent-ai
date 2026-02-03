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
            <Link href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
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
              AI-Powered Content
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Generate hyper-targeted, SEO-optimized content that resonates with your local community. 
            Save 10+ hours per month while driving more customers to your business.
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
              Start Your Free 7-Day Trial
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
              <p className="text-sm text-gray-400">Average Rating</p>
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
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>No time for marketing</strong> — You're too busy running your business to create content consistently.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Generic content doesn't work</strong> — Cookie-cutter posts fail to connect with your local community.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Agencies are too expensive</strong> — Professional marketing costs $2,000-5,000/month or more.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span><strong>Lost customers to competitors</strong> — Businesses with strong local SEO capture your potential customers.</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-8">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">The Solution</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Your AI-Powered Local Marketing Team
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Generate content in minutes</strong> — AI creates a month of posts while you finish your coffee.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Hyper-local relevance</strong> — Content that mentions your neighborhood, local events, and community.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Fraction of agency costs</strong> — Get better results starting at just $29/month.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span><strong>Rank higher locally</strong> — SEO-optimized content that helps you dominate local search.</span>
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
              From Zero to Local Hero in 4 Steps
            </h2>
            <p className="text-xl text-gray-600">
              Start generating professional, locally-relevant content in minutes — no marketing experience needed.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Tell Us About Your Business',
                description: 'Enter your business details, location, and target customers. Our AI learns your unique value.',
                icon: '🏪'
              },
              {
                step: '2',
                title: 'Choose Your Content',
                description: 'Select from social posts, blog articles, Google Business updates, or email campaigns.',
                icon: '📝'
              },
              {
                step: '3',
                title: 'AI Generates Magic',
                description: 'Our AI creates hyper-local, SEO-optimized content with matching images in seconds.',
                icon: '✨'
              },
              {
                step: '4',
                title: 'Publish & Grow',
                description: 'Review, edit if needed, and publish. Watch your local visibility and customers grow.',
                icon: '🚀'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Everything You Need to Win Locally
          </h2>
          <p className="text-xl text-gray-600">
            Powerful AI tools designed specifically for local businesses like yours.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🎯',
              title: 'Hyper-Local Content',
              description: 'AI that understands your neighborhood, mentions local landmarks, events, and community references.',
              color: 'teal'
            },
            {
              icon: '📱',
              title: 'Multi-Platform Ready',
              description: 'Content formatted perfectly for Facebook, Instagram, Google Business, LinkedIn, and your blog.',
              color: 'orange'
            },
            {
              icon: '🖼️',
              title: 'AI Image Generation',
              description: 'Matching visuals generated automatically — no design skills or stock photos needed.',
              color: 'purple'
            },
            {
              icon: '📈',
              title: 'SEO Optimization',
              description: 'Every post is optimized for local search to help you rank higher in your area.',
              color: 'green'
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Generate a month of content in under 10 minutes. Bulk create and schedule ahead.',
              color: 'yellow'
            },
            {
              icon: '🎨',
              title: 'Brand Customization',
              description: 'Add your logo, brand colors, and voice. Every post looks and sounds like you.',
              color: 'pink'
            }
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Local Businesses
            </h2>
            <p className="text-xl text-gray-400">
              See what business owners like you are saying
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "GeoSpark cut my content creation time from 5 hours to 20 minutes per week. The posts actually mention our neighborhood — customers love it!",
                name: "Sarah M.",
                role: "Owner, Riverside Bakery",
                rating: 5
              },
              {
                quote: "As a plumber, I have zero time for social media. GeoSpark creates posts that bring in local leads while I'm out on jobs.",
                name: "Mike T.",
                role: "Owner, Mike's Plumbing",
                rating: 5
              },
              {
                quote: "We tried 3 other tools before GeoSpark. None understood 'local' like this. Our Google visibility jumped 40% in 2 months.",
                name: "Jennifer L.",
                role: "Manager, Downtown Fitness",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
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
                q: "What types of businesses is GeoSpark best for?",
                a: "GeoSpark works great for any local business that wants to attract nearby customers — restaurants, salons, contractors, dentists, fitness studios, retail stores, professional services, and more. If you serve a local area, GeoSpark can help."
              },
              {
                q: "Do I need marketing experience to use GeoSpark?",
                a: "Not at all! GeoSpark is designed for busy business owners with zero marketing background. Just tell us about your business, and our AI handles the rest. If you can fill out a form, you can use GeoSpark."
              },
              {
                q: "What makes GeoSpark different from other AI content tools?",
                a: "Most AI tools create generic content. GeoSpark is specifically built for local businesses — it understands neighborhoods, local SEO, community events, and what makes local customers tick. Plus, we generate matching images automatically."
              },
              {
                q: "Can I try GeoSpark before paying?",
                a: "Yes! We offer a free 7-day trial with full access to all features. No credit card required. Generate as much content as you want and see the results for yourself."
              },
              {
                q: "How quickly can I start seeing results?",
                a: "You can generate your first month of content within minutes of signing up. Most businesses see increased engagement within the first week and improved local search visibility within 30-60 days of consistent posting."
              }
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free 7-Day Trial
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">GeoSpark</span>
              </div>
              <p className="text-sm">
                AI-powered content marketing for local businesses. Generate hyper-local content that ranks and converts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-teal-400">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-teal-400">Pricing</Link></li>
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
