import Link from 'next/link'
import Image from 'next/image'
import { LandingPageDemo } from '@/components/marketing/LiveContentDemo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-geospark.png" 
              alt="GeoSpark" 
              width={240} 
              height={64} 
              className="h-16 w-auto"
              priority
            />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/demo" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Live Demo
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
              Contact
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Sparking
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
              Start Sparking
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 md:pt-20 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand Tagline */}
          <p className="text-teal-600 font-semibold tracking-wide mb-4">Click. Spark. Post.</p>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            One Idea. Under 2 Minutes.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
              6 Platforms Ready.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Stop spending hours on social media. Describe what you want to share, and GeoSpark creates 
            <strong> platform-perfect posts</strong> for Twitter, Facebook, Instagram, LinkedIn, TikTok, and Nextdoor — 
            complete with a <strong>matching image</strong> (free stock photo or AI-generated).
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-10">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Sparking — Free 14-Day Trial
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
              Content ready in under 2 minutes
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

      {/* Live Content Demo Section - MOVED UP for immediate proof */}
      <LandingPageDemo />

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

      {/* How It Works - Simplified to 3 Steps */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Three Steps to Effortless Content
            </h2>
            <p className="text-xl text-gray-600">
              From idea to 6 platform-ready posts in under 2 minutes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Describe Your Idea',
                description: 'Tell us what you want to share — a promotion, an event, or any topic. Just type a sentence or two.',
                icon: '💡',
                useLogo: false
              },
              {
                step: '2',
                title: 'AI Creates Your Pack',
                description: 'Our AI instantly generates 6 platform-optimized posts plus a matching image (stock or AI) — all tailored to your business.',
                icon: '✨',
                useLogo: true
              },
              {
                step: '3',
                title: 'Review & Post',
                description: 'Edit if needed, then copy to your social platforms or schedule for later. Done in under 2 minutes.',
                icon: '🚀',
                useLogo: false
              }
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                  <div className="mb-6 flex justify-center">
                    {item.useLogo ? (
                      <Image src="/favicon-512.png" alt="GeoSpark" width={56} height={56} className="h-14 w-14" />
                    ) : (
                      <span className="text-5xl">{item.icon}</span>
                    )}
                  </div>
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 text-teal-700 rounded-full text-lg font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Consolidated to 6 Key Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Everything You Need to Win Locally
          </h2>
          <p className="text-xl text-gray-600">
            Powerful AI tools designed specifically for local businesses.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📱',
              title: '6 Platforms, One Click',
              description: 'Generate perfectly formatted posts for Twitter, Facebook, Instagram, LinkedIn, TikTok, and Nextdoor simultaneously.',
            },
            {
              icon: '🖼️',
              title: 'AI Image Generation',
              description: 'Every content pack includes a matching image — free stock photo or AI-generated. No design skills needed.',
            },
            {
              icon: '📍',
              title: 'Hyper-Local Optimization',
              description: 'Content that mentions your neighborhood, local events, and community — making it relevant to nearby customers.',
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Generate a week of content in minutes. Bulk create and schedule ahead so you never miss a beat.',
            },
            {
              icon: '📚',
              title: 'Content Library',
              description: 'Save your best posts to a searchable library. Reuse and repurpose winning content anytime.',
            },
            {
              icon: '💰',
              title: 'Fraction of Agency Costs',
              description: 'Get better results than expensive agencies starting at just $29/month. No contracts or hidden fees.',
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
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Trusted by Local Businesses
            </h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Before GeoSpark, I spent hours creating social media posts. Now I generate a week's worth of content while drinking my morning coffee. Our engagement has tripled!",
                name: "Sarah M.",
                role: "Owner, The Daily Grind Cafe",
                metric: "+300% engagement",
                rating: 5
              },
              {
                quote: "Managing content for three plumbing locations was a nightmare. GeoSpark gives each branch unique local content. We've seen a 40% increase in service requests.",
                name: "David L.",
                role: "Marketing Manager, Rapid Plumbers",
                metric: "+40% leads",
                rating: 5
              },
              {
                quote: "As a solo real estate agent, I compete with big agencies now. The matching images look professional, and my listings get way more attention.",
                name: "Emily R.",
                role: "Real Estate Agent",
                metric: "10+ hrs saved/week",
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
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            From hours to minutes — generate a month of content for less than one freelance article.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                5 content packs/month
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
                All 6 platforms
              </li>
            </ul>
            <Link 
              href="/auth/signup" 
              className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Start Sparking Free
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
            <p className="text-sm text-teal-600 font-medium mb-5">or $290/year</p>
            <ul className="space-y-3 mb-8 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                30 content packs/month
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
                Saved content library
              </li>
            </ul>
            <Link 
              href="/auth/signup?plan=starter" 
              className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
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
            <p className="text-gray-500 text-sm mb-4 h-10">For growing businesses & teams</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-gray-900">$79</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-sm text-teal-600 font-medium mb-5">or $790/year</p>
            <ul className="space-y-3 mb-8 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                100 content packs/month
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
                3 businesses
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
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
            <p className="text-gray-500 text-sm mb-4 h-10">For agencies & multi-location</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-gray-900">$199</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-sm text-teal-600 font-medium mb-5">or $1990/year</p>
            <ul className="space-y-3 mb-8 text-gray-600 text-sm">
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
                10 businesses
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                3 users
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
          All paid plans include a 14-day free trial. Cancel anytime.
        </p>
      </section>

      {/* FAQ - Reduced to 5 Key Questions */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Common Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How fast can I create content?",
                  a: "In under 2 minutes. Just describe your topic in a sentence or two, and our AI generates 6 platform-optimized posts with a matching image (free stock photo or AI). You can create a week's worth of content during your coffee break."
                },
                {
                  q: "What platforms does GeoSpark support?",
                  a: "Every content pack includes posts optimized for Twitter/X, Facebook, Instagram, LinkedIn, TikTok, and Nextdoor — each formatted correctly for that platform's best practices and character limits."
                },
                {
                  q: "Can I edit the content before posting?",
                  a: "Absolutely! You have full control. Review each post, make any edits you want, and only post what you're happy with. You can also save posts to your library for later."
                },
                {
                  q: "Do I need design skills for the images?",
                  a: "Not at all. You get a matching image with every pack — we use free stock photos or AI generation. No Canva, no design experience needed."
                },
                {
                  q: "What if I'm not satisfied?",
                  a: "We offer a 14-day free trial on all paid plans and a 30-day money-back guarantee. If GeoSpark doesn't save you hours every week, we'll refund you — no questions asked."
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
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Save 10+ Hours Every Week?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join 5,000+ local businesses already using GeoSpark. 
            Turn one idea into 6 platform-ready posts in under 2 minutes.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Sparking — It's Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-teal-200 text-sm mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4 bg-white/10 rounded-lg p-3 inline-block">
                <Image 
                  src="/logo-geospark.png" 
                  alt="GeoSpark" 
                  width={180} 
                  height={48} 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm">
                AI-powered content for local businesses. One idea becomes 6 platform-ready posts in under 2 minutes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/demo" className="hover:text-teal-400">Live Demo</Link></li>
                <li><Link href="#pricing" className="hover:text-teal-400">Pricing</Link></li>
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
