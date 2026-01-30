import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={user?.user_metadata?.full_name || ''}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </div>

      {/* Business Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Business Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <input
              type="text"
              placeholder="Your Business Name"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="">Select industry...</option>
              <option value="restaurant">Restaurant</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="salon">Salon</option>
              <option value="dentist">Dentist</option>
              <option value="real-estate">Real Estate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              placeholder="City, State"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Save Business Info
          </button>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Integrations</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Google Business Profile</h3>
              <p className="text-sm text-muted-foreground">Post to GMB and track analytics</p>
            </div>
            <button className="px-4 py-2 border rounded-md hover:bg-muted">
              Connect
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Google Search Console</h3>
              <p className="text-sm text-muted-foreground">Track search performance</p>
            </div>
            <button className="px-4 py-2 border rounded-md hover:bg-muted">
              Connect
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Google Analytics</h3>
              <p className="text-sm text-muted-foreground">Track website traffic</p>
            </div>
            <button className="px-4 py-2 border rounded-md hover:bg-muted">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan: Free Trial</p>
            <p className="text-sm text-muted-foreground">Upgrade for more features</p>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )
}
