import Link from 'next/link'
import Image from 'next/image'

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Real Examples</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">
            Content Created by GeoSpark
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            See what AI-generated local content looks like. Every example below was created in seconds — 
            tailored for a local coffee shop called "The Daily Grind."
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Try It Free for 14 Days
          </Link>
        </div>
      </section>

      {/* Social Media Pack */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📱 Social Media Pack
            </h2>
            <p className="text-gray-600">
              6 platform-optimized posts generated in one click. Each post is tailored to the platform's style, tone, and audience.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Facebook */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#1877F2] text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">The Daily Grind Cafe</p>
                    <p className="text-xs text-gray-500">Just now · 🌐</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  ☕ Nothing beats a fresh cup from your neighborhood cafe! Stop by The Daily Grind on Main Street this weekend — we're featuring our new seasonal Maple Pecan Latte. Perfect for those crisp fall mornings! 🍁
                </p>
                <p className="text-sm text-gray-500 mb-4">#LocalCoffee #MainStreet #RiversideCA #FallDrinks #SupportLocal</p>
                <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <span className="text-5xl">☕🍂</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗️ Share</span>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">thedailygrindcafe</p>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-6xl">☕✨</span>
                </div>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">thedailygrindcafe</span> That first sip feeling ✨ Our baristas craft every cup with love right here on Main Street. Tag someone who needs their coffee fix today! ☕️
                </p>
                <p className="text-sm text-blue-600">#CoffeeLovers #CafeLife #RiversideEats #LocalCoffeeShop #MorningVibes #CoffeeTime</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#0A66C2] text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">The Daily Grind Cafe</p>
                    <p className="text-xs text-gray-500">Local Coffee Shop · Riverside, CA</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Supporting local businesses isn't just good ethics — it's good business. For 15 years, The Daily Grind has been more than a coffee shop. We're a community hub where entrepreneurs brainstorm, freelancers find their flow, and neighbors become friends.
                  <br/><br/>
                  This fall, we're giving back with 10% off for local business owners. Because when one of us grows, we all grow.
                  <br/><br/>
                  #SmallBusiness #LocalEconomy #CommunityFirst #RiversideBusiness
                </p>
              </div>
            </div>

            {/* X/Twitter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">The Daily Grind</p>
                    <p className="text-xs text-gray-500">@dailygrindcafe</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Monday motivation starts with great coffee ☕ 
                  <br/><br/>
                  Who else needs their local cafe fix today? 🙋‍♀️ 
                  <br/><br/>
                  Stop by Main Street — first 10 customers get a free pastry with any latte! 🥐
                </p>
                <p className="text-sm text-blue-500">#MondayMotivation #CoffeeFirst #RiversideCA</p>
              </div>
            </div>

            {/* Google Business */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#4285F4] text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google Business
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">The Daily Grind Cafe</p>
                    <p className="text-xs text-gray-500">Update · Just now</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  🎉 <strong>New Seasonal Menu Alert!</strong>
                  <br/><br/>
                  Visit The Daily Grind at 123 Main Street, Riverside to try our Maple Pecan Latte — made with locally-roasted beans and real maple syrup.
                  <br/><br/>
                  📍 123 Main Street, Riverside CA
                  <br/>
                  ⏰ Open 7am - 7pm daily
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                  Get Directions
                </button>
              </div>
            </div>

            {/* Nextdoor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#00B246] text-white px-4 py-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                Nextdoor
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">☕</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">The Daily Grind Cafe</p>
                    <p className="text-xs text-gray-500">Local Business · Downtown</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Hey neighbors! 👋 
                  <br/><br/>
                  We're offering <strong>10% off for Riverside residents</strong> this week at The Daily Grind. Just mention you saw this on Nextdoor!
                  <br/><br/>
                  We've been part of this community for 15 years and we're grateful for your support. Come say hi — we'd love to meet you! ☕
                  <br/><br/>
                  📍 123 Main Street (next to the library)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Post Example */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📝 Blog Post
            </h2>
            <p className="text-gray-600">
              SEO-optimized articles that help you rank for local searches. ~800 words, ready to publish.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="aspect-[3/1] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              <span className="text-7xl">☕🏪</span>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-medium">Local Guide</span>
                <span>•</span>
                <span>5 min read</span>
                <span>•</span>
                <span>Riverside, CA</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                5 Reasons Why The Daily Grind is Riverside's Favorite Coffee Spot
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                When it comes to finding the perfect cup of coffee in Riverside, locals know there's one place that stands above the rest. Nestled on Main Street in the heart of downtown, The Daily Grind has been serving our community for over 15 years. Here's why this neighborhood gem has become the go-to spot for coffee lovers across Riverside County...
              </p>
              <h4 className="text-xl font-bold text-gray-900 mb-3">1. Locally-Roasted Beans</h4>
              <p className="text-gray-600 leading-relaxed mb-6">
                Unlike chain coffee shops that ship beans from across the country, The Daily Grind partners with Riverside Roasters — a local roastery just 10 miles away. This means every cup is made with beans roasted within the past week, ensuring maximum freshness and flavor...
              </p>
              <h4 className="text-xl font-bold text-gray-900 mb-3">2. A True Community Hub</h4>
              <p className="text-gray-600 leading-relaxed mb-6">
                Walk into The Daily Grind on any given morning and you'll find a mix of remote workers, students from nearby UC Riverside, and longtime Riverside residents catching up over lattes. The spacious interior, free WiFi, and welcoming atmosphere make it the perfect "third place" between home and work...
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                <strong>SEO Keywords included:</strong> coffee shop Riverside, best coffee Riverside CA, local cafe downtown Riverside, coffee near me, Riverside coffee roasters
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Example */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📧 Email Newsletter
            </h2>
            <p className="text-gray-600">
              Engaging newsletters with personalization, clear CTAs, and mobile-friendly design.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Email Header */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">D</div>
                <div>
                  <p className="font-semibold text-gray-900">The Daily Grind Cafe</p>
                  <p className="text-sm text-gray-500">hello@dailygrindcafe.com</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">To: <span className="text-gray-700">sarah@email.com</span></p>
                <p className="font-semibold text-gray-900 mt-1">Subject: Your October Coffee Fix Awaits ☕🍁</p>
              </div>
            </div>
            
            {/* Email Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Hey Sarah,
              </p>
              <p className="text-gray-700 mb-4">
                Fall is officially here, and so is our most requested seasonal menu! 🍂
              </p>
              <p className="text-gray-700 mb-4">
                This month, we're bringing back the <strong>Maple Pecan Latte</strong> — made with locally-sourced maple syrup and topped with candied pecans. It's like autumn in a cup.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-amber-800 mb-1">🎁 Exclusive for Newsletter Subscribers</p>
                <p className="text-amber-700">Show this email for <strong>$2 off</strong> any seasonal drink this week!</p>
              </div>
              <p className="text-gray-700 mb-6">
                We can't wait to see you at 123 Main Street. Swing by before 9am and the pastry case is fully stocked! 🥐
              </p>
              <a href="#" className="block bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors mb-6">
                View Our Fall Menu →
              </a>
              <p className="text-gray-700 mb-2">
                Stay caffeinated,
              </p>
              <p className="text-gray-700 font-semibold">
                The Daily Grind Team ☕
              </p>
            </div>

            {/* Email Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>The Daily Grind Cafe · 123 Main Street · Riverside, CA 92501</p>
              <p className="mt-1">
                <a href="#" className="text-gray-500 hover:text-gray-700">Unsubscribe</a> · 
                <a href="#" className="text-gray-500 hover:text-gray-700 ml-2">View in browser</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Content Like This?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Generate a month of local content in minutes. Blog posts, newsletters, social media — all tailored for your business.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free 14-Day Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-teal-200 text-sm mt-4">No credit card required</p>
        </div>
      </section>
    </div>
  )
}
