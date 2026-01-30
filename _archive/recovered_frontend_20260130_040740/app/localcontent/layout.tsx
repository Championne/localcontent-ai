import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css"; // Assuming globals.css is relative to the root app directory
import { Header } from "@/components/localcontent/Header";
import { Footer } from "@/components/localcontent/Footer";
import { Toaster } from "@/components/ui/sonner"; // Assuming toaster might be used

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "LocalContent.ai - Business Profile Setup",
  description: "Set up your business profile on LocalContent.ai",
};

export default function LocalContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
