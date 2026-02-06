import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wide">About GeoSpark</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Empowering Local Businesses to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300"> Dominate Their Market</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We believe every local business deserves the same marketing power as the big brands. 
            GeoSpark makes it happen in under 2 minutes.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Our Mission</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                AI-Powered Content for Every Local Business
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                GeoSpark is dedicated to transforming how local businesses engage with their communities. 
                We combine cutting-edge AI with a deep understanding of local nuances to create content 
                that truly resonates with your audience.
              </p>
              <p className="text-gray-600 leading-relaxed">
                No more staring at blank screens. No more expensive agencies. No more generic content 
                that doesn't connect. Just describe your idea, and watch it transform into 6 platform-ready 
                posts with a matching image, all in under 2 minutes.
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    6
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Platforms</p>
                    <p className="text-sm text-gray-600">One idea, six posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Minutes</p>
                    <p className="text-sm text-gray-600">From idea to ready</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    10+
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Hours Saved</p>
                    <p className="text-sm text-gray-600">Every single week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Our Values</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              What Drives Us Every Day
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Empowerment</h3>
              <p className="text-gray-600 leading-relaxed">
                A deep commitment to the success and sustainability of local businesses and communities. 
                Your success is our success.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent Simplicity</h3>
              <p className="text-gray-600 leading-relaxed">
                Delivering sophisticated AI technology in an intuitive, easy-to-use platform. 
                Powerful results without the complexity.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Authentic Connection</h3>
              <p className="text-gray-600 leading-relaxed">
                Valuing content that genuinely resonates with local audiences and strengthens 
                community ties. Real connections, real results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-10 md:p-14 text-center">
            <span className="text-teal-200 font-semibold text-sm uppercase tracking-wide">Our Vision</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-6">
              10,000+ Local Businesses Thriving
            </h2>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto leading-relaxed">
              To become the go-to content platform for local businesses everywhere, fostering 
              vibrant local economies by enabling every business to effectively tell its unique story.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Content?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of local businesses already saving 10+ hours every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Start Sparking: It's Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/demo" 
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Try Live Demo
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
