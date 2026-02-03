export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <p className="text-muted-foreground mb-8">
        Track your content performance and see the impact on your business.
      </p>

      {/* Placeholder Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Content</p>
          <p className="text-3xl font-bold mt-1">0</p>
          <p className="text-xs text-green-600 mt-1">-</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">GMB Views</p>
          <p className="text-3xl font-bold mt-1">-</p>
          <p className="text-xs text-muted-foreground mt-1">Connect GMB to track</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Search Impressions</p>
          <p className="text-3xl font-bold mt-1">-</p>
          <p className="text-xs text-muted-foreground mt-1">Connect Search Console</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="text-3xl font-bold mt-1">-</p>
          <p className="text-xs text-muted-foreground mt-1">Connect GMB to track</p>
        </div>
      </div>

      {/* Impact Dashboard Placeholder */}
      <div className="bg-card border rounded-lg p-8">
        <h2 className="text-lg font-semibold mb-4">Impact Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Connect your Google Business Profile to see your before/after metrics and growth trends.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Before LocalContent.ai</h3>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-muted-foreground">Baseline metrics will appear here</p>
              <p className="text-sm mt-2">Connect integrations to capture baseline</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">After LocalContent.ai</h3>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-muted-foreground">Growth metrics will appear here</p>
              <p className="text-sm mt-2">Track your progress over time</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90">
            Connect Google Business Profile
          </button>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Growth Trends</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Competitor Benchmark</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Shareable Reports</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  )
}
