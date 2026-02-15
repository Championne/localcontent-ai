'use client'

const FRAMEWORKS = [
  {
    id: 'aida',
    name: 'AIDA',
    subtitle: 'Attention \u2192 Interest \u2192 Desire \u2192 Action',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Best for cold audiences and awareness campaigns. Grabs attention, builds curiosity, creates desire, then drives action.',
    useWhen: [
      'New product or service launch',
      'Reaching cold audiences who don\u2019t know you',
      'Awareness-stage social media posts',
      'First-time customer acquisition',
    ],
    example: {
      industry: 'HVAC',
      steps: [
        { label: 'Attention', text: 'Is your AC bill higher than your mortgage?' },
        { label: 'Interest', text: 'Our smart HVAC systems cut cooling costs by up to 40%.' },
        { label: 'Desire', text: 'Imagine saving $200/month while staying perfectly comfortable.' },
        { label: 'Action', text: 'Get your free energy audit today.' },
      ],
    },
  },
  {
    id: 'pas',
    name: 'PAS',
    subtitle: 'Problem \u2192 Agitate \u2192 Solution',
    color: 'bg-red-50 border-red-200 text-red-900',
    badge: 'bg-red-100 text-red-700',
    description: 'Best for pain-aware audiences with urgent needs. Validates their problem, makes it vivid, then presents your fix.',
    useWhen: [
      'Emergency or urgent services',
      'High competition markets',
      'Seasonal/urgent needs',
      'Audience already knows they have a problem',
    ],
    example: {
      industry: 'Plumbing',
      steps: [
        { label: 'Problem', text: 'AC broke down in the middle of summer?' },
        { label: 'Agitate', text: 'Every hour without cooling is miserable. Your family is sweating, food is spoiling, and emergency rates are through the roof.' },
        { label: 'Solution', text: 'We offer same-day emergency service with upfront pricing. Call now.' },
      ],
    },
  },
  {
    id: 'bab',
    name: 'BAB',
    subtitle: 'Before \u2192 After \u2192 Bridge',
    color: 'bg-green-50 border-green-200 text-green-900',
    badge: 'bg-green-100 text-green-700',
    description: 'Best for transformation stories and service businesses. Shows the journey from pain to resolution.',
    useWhen: [
      'Service-based businesses',
      'Case studies and testimonials',
      'Audiences comparing options',
      'Solution-aware prospects',
    ],
    example: {
      industry: 'Plumbing',
      steps: [
        { label: 'Before', text: 'Tired of calling plumbers who never show up?' },
        { label: 'After', text: 'Imagine having a trusted plumber who arrives on time, every time, with transparent pricing.' },
        { label: 'Bridge', text: 'Our same-day service guarantee and 5-star reviews make it happen.' },
      ],
    },
  },
  {
    id: 'fab',
    name: 'FAB',
    subtitle: 'Features \u2192 Advantages \u2192 Benefits',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    badge: 'bg-purple-100 text-purple-700',
    description: 'Best for product-focused content and educated buyers. Translates features into real-world value.',
    useWhen: [
      'Product-aware audiences comparing options',
      'Technical or educated buyers',
      'B2B service descriptions',
      'Feature announcements',
    ],
    example: {
      industry: 'Restaurant Equipment',
      steps: [
        { label: 'Features', text: 'Commercial-grade ice maker produces 500 lbs/day.' },
        { label: 'Advantages', text: '3x more capacity than standard units.' },
        { label: 'Benefits', text: 'Never run out of ice during rush hours, keep customers happy.' },
      ],
    },
  },
  {
    id: '4ps',
    name: '4Ps',
    subtitle: 'Promise \u2192 Picture \u2192 Proof \u2192 Push',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
    description: 'Best for high-ticket services where trust is critical. Combines bold claims with evidence and urgency.',
    useWhen: [
      'High-value service offerings',
      'Trust-critical sales (roofing, medical, legal)',
      'Final conversion push for ready-to-buy audience',
      'When social proof is your strongest asset',
    ],
    example: {
      industry: 'Roofing',
      steps: [
        { label: 'Promise', text: 'Lifetime warranty on all roof installations.' },
        { label: 'Picture', text: 'Your family protected for decades, no worries about leaks or repairs.' },
        { label: 'Proof', text: 'Join 500+ homeowners who chose us (see reviews).' },
        { label: 'Push', text: 'Schedule free inspection this week — only 3 slots left.' },
      ],
    },
  },
]

const AWARENESS_LEVELS = [
  { level: 'Unaware', desc: 'Don\u2019t know they have a problem', framework: 'AIDA', content: 'Educational, "Did you know\u2026"' },
  { level: 'Problem Aware', desc: 'Know the problem, not the solution', framework: 'PAS', content: 'Problem-focused, pain points' },
  { level: 'Solution Aware', desc: 'Know solutions exist, not yours', framework: 'BAB / FAB', content: 'Comparison, benefits' },
  { level: 'Product Aware', desc: 'Know your product, considering options', framework: '4Ps / FAB', content: 'Proof, differentiation' },
  { level: 'Most Aware', desc: 'Ready to buy, need final push', framework: '4Ps', content: 'Offers, guarantees, urgency' },
]

export default function FrameworksLibraryPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Marketing Frameworks</h1>
        <p className="text-gray-500 text-sm">GeoSpark automatically picks the best framework for your content. Learn how each one works.</p>
      </div>

      <div className="space-y-6 mb-12">
        {FRAMEWORKS.map((fw) => (
          <div key={fw.id} className={`rounded-xl border p-5 ${fw.color}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-lg font-bold">{fw.name}</h2>
                <p className="text-sm opacity-80">{fw.subtitle}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${fw.badge}`}>
                {fw.id === 'aida' ? 'Awareness' : fw.id === 'pas' ? 'Urgency' : fw.id === 'bab' ? 'Transformation' : fw.id === 'fab' ? 'Comparison' : 'Conversion'}
              </span>
            </div>

            <p className="text-sm mb-3">{fw.description}</p>

            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5">Use when</h4>
              <ul className="text-sm space-y-0.5">
                {fw.useWhen.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-white/60 border border-current/10 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">Example — {fw.example.industry}</h4>
              <div className="space-y-1.5">
                {fw.example.steps.map((s, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold">{s.label}:</span>{' '}
                    <span className="opacity-90">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Awareness Levels */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Market Awareness Levels</h2>
        <p className="text-gray-500 text-sm mb-4">
          GeoSpark auto-detects your audience&apos;s awareness level from the topic you write and picks the matching framework.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Level</th>
                <th className="px-4 py-2.5 text-left font-semibold">Description</th>
                <th className="px-4 py-2.5 text-left font-semibold">Framework</th>
                <th className="px-4 py-2.5 text-left font-semibold">Content Style</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {AWARENESS_LEVELS.map((al, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{al.level}</td>
                  <td className="px-4 py-2.5 text-gray-600">{al.desc}</td>
                  <td className="px-4 py-2.5 font-semibold text-blue-700">{al.framework}</td>
                  <td className="px-4 py-2.5 text-gray-600">{al.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
