'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button
import Image from 'next/image'; // For logo

export function Header() {
  return (
    <header className="bg-background border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
      <nav className="relative flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-placeholder.svg" // Placeholder logo, replace with actual
              alt="LocalContent.ai Logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-foreground">LocalContent.ai</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-grow justify-center space-x-8">
          <Link href="/home" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Navigation (Hamburger or similar will be added later if needed) */}
        <div className="md:hidden">
          {/* Placeholder for mobile menu icon */}
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </nav>
    </header>
  );
}
