import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 text-muted-foreground text-sm">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">LocalContent.ai</h3>
          <p>&copy; {currentYear} LocalContent.ai. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-md font-semibold text-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/home" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Social Media (Placeholders) */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-foreground mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary transition-colors"><i className="fab fa-facebook-f"></i> Facebook</a>
            <a href="#" className="hover:text-primary transition-colors"><i className="fab fa-twitter"></i> Twitter</a>
            <a href="#" className="hover:text-primary transition-colors"><i className="fab fa-linkedin-in"></i> LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
