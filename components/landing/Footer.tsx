import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Live Demo', href: '#demo' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Case Studies', href: '#case-studies' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  'Get Started': [
    { label: 'Free Trial', href: '/auth/signup' },
    { label: 'Sign In', href: '/auth/login' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 bg-white/10 rounded-xl p-3 inline-block">
              <Image
                src="/logo-geospark.png"
                alt="GeoSpark"
                width={180}
                height={48}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              AI content that learns your brand. Dual learning engine builds irreplaceable intelligence with every post.
            </p>
            <p className="text-xs text-gray-600 mt-4">
              2,400 data points after 12 months. Your competitors can&apos;t replicate it.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-spark-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GeoSpark. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="/privacy" className="hover:text-spark-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-spark-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
