import Navigation from '@/components/landing/Navigation'
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import Differentiator from '@/components/landing/Differentiator'
import Benefits from '@/components/landing/Benefits'
import HowItWorks from '@/components/landing/HowItWorks'
import LiveDemoEmbed from '@/components/landing/LiveDemoEmbed'
import CaseStudies from '@/components/landing/CaseStudies'
import ComparisonTable from '@/components/landing/ComparisonTable'
import FAQ from '@/components/landing/FAQ'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navigation />
      <Hero />
      <SocialProof />
      <Differentiator />
      <Benefits />
      <HowItWorks />
      <LiveDemoEmbed />
      <CaseStudies />
      <ComparisonTable />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
