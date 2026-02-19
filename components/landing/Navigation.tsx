'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Case Studies', href: '#case-studies' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20)
  })

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-black/[0.04] border-b border-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-geospark.png"
            alt="GeoSpark"
            width={180}
            height={48}
            className={`h-10 w-auto transition-all duration-500 ${scrolled ? '' : 'brightness-0 invert'}`}
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled
                  ? 'text-gray-600 hover:text-spark-600 hover:bg-spark-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/login"
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:text-spark-600' : 'text-white/80 hover:text-white'
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-spark-500 to-amber-500 hover:from-spark-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-spark-500/25 hover:shadow-xl hover:shadow-spark-500/40 hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-gray-700' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className={`w-full h-0.5 rounded-full block origin-center transition-colors ${
                scrolled || mobileOpen ? 'bg-gray-700' : 'bg-white'
              }`}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className={`w-full h-0.5 rounded-full block transition-colors ${
                scrolled || mobileOpen ? 'bg-gray-700' : 'bg-white'
              }`}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className={`w-full h-0.5 rounded-full block origin-center transition-colors ${
                scrolled || mobileOpen ? 'bg-gray-700' : 'bg-white'
              }`}
            />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:text-spark-600 hover:bg-spark-50 rounded-lg font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-gray-700 font-medium text-center rounded-lg hover:bg-gray-50">
                  Sign In
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="bg-gradient-to-r from-spark-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-center shadow-lg shadow-spark-500/25">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
