import { SupabaseClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from './email'

// Default business types for quick selection
export const BUSINESS_TYPES = [
  { value: 'plumber', label: 'Plumber', icon: '🔧' },
  { value: 'electrician', label: 'Electrician', icon: '⚡' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'landscaper', label: 'Landscaper', icon: '🌿' },
  { value: 'cleaner', label: 'Cleaning Service', icon: '🧹' },
  { value: 'roofer', label: 'Roofer', icon: '🏠' },
  { value: 'painter', label: 'Painter', icon: '🎨' },
  { value: 'contractor', label: 'General Contractor', icon: '🔨' },
  { value: 'auto_repair', label: 'Auto Repair', icon: '🚗' },
  { value: 'salon', label: 'Salon/Barber', icon: '💇' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'fitness', label: 'Fitness/Gym', icon: '💪' },
  { value: 'dental', label: 'Dental Practice', icon: '🦷' },
  { value: 'veterinary', label: 'Veterinary', icon: '🐾' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏡' },
  { value: 'legal', label: 'Legal Services', icon: '⚖️' },
  { value: 'accounting', label: 'Accounting', icon: '📊' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'other', label: 'Other', icon: '🏢' },
]

// Default keywords by business type
export const DEFAULT_KEYWORDS: Record<string, string[]> = {
  plumber: ['emergency plumber', 'drain cleaning', 'water heater repair', 'leak detection', 'pipe repair'],
  electrician: ['electrical repair', 'panel upgrade', 'lighting installation', 'emergency electrician', 'wiring'],
  hvac: ['AC repair', 'heating repair', 'HVAC maintenance', 'furnace installation', 'duct cleaning'],
  landscaper: ['lawn care', 'landscaping', 'tree service', 'garden design', 'irrigation'],
  cleaner: ['house cleaning', 'deep cleaning', 'move out cleaning', 'office cleaning', 'carpet cleaning'],
  roofer: ['roof repair', 'roof replacement', 'leak repair', 'shingle repair', 'roof inspection'],
  painter: ['interior painting', 'exterior painting', 'cabinet painting', 'commercial painting', 'color consultation'],
  contractor: ['home remodeling', 'kitchen renovation', 'bathroom remodel', 'home addition', 'general contractor'],
  auto_repair: ['auto repair', 'brake service', 'oil change', 'transmission repair', 'car maintenance'],
  salon: ['haircut', 'hair color', 'styling', 'manicure', 'spa services'],
  restaurant: ['dining', 'catering', 'takeout', 'delivery', 'private events'],
  fitness: ['personal training', 'gym membership', 'fitness classes', 'yoga', 'weight loss'],
  dental: ['dentist', 'teeth cleaning', 'dental implants', 'cosmetic dentistry', 'emergency dental'],
  veterinary: ['veterinarian', 'pet care', 'pet vaccinations', 'pet surgery', 'animal hospital'],
  real_estate: ['homes for sale', 'real estate agent', 'property listing', 'home buying', 'home selling'],
  legal: ['attorney', 'lawyer', 'legal consultation', 'contract review', 'legal services'],
  accounting: ['accountant', 'tax preparation', 'bookkeeping', 'financial planning', 'business accounting'],
  photography: ['photographer', 'portrait photography', 'wedding photography', 'event photography', 'headshots'],
  other: ['local business', 'professional services', 'quality service', 'customer satisfaction'],
}

// Create user's initial setup
export async function initializeNewUser(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  fullName?: string
): Promise<void> {
  // 1. Create subscription record (free tier)
  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan: 'free',
    status: 'active',
  }).onConflict('user_id').ignore()

  // 2. Send welcome email
  try {
    await sendWelcomeEmail(email, fullName || 'there')
  } catch (e) {
    console.error('Failed to send welcome email:', e)
  }
}

// Create sample content for new users
export async function createSampleContent(
  supabase: SupabaseClient,
  userId: string,
  businessName: string,
  businessType: string,
  location: string
): Promise<void> {
  const sampleContent = [
    {
      user_id: userId,
      title: `Welcome to ${businessName}!`,
      body: `This is a sample blog post to help you get started. As a ${businessType} serving ${location}, we're committed to providing excellent service to our community.\n\nYou can edit or delete this sample content anytime. Use the "Create Content" button to generate new AI-powered content for your business!`,
      content_type: 'blog',
      status: 'draft',
      metadata: {
        sample: true,
        keywords: DEFAULT_KEYWORDS[businessType] || DEFAULT_KEYWORDS.other,
      },
    },
    {
      user_id: userId,
      title: 'Sample Social Post',
      body: `Looking for a trusted ${businessType} in ${location}? We've got you covered! 💪 Contact us today for a free quote. #${businessType.replace(/_/g, '')} #${location.replace(/\s/g, '')} #LocalBusiness`,
      content_type: 'social',
      status: 'draft',
      metadata: {
        sample: true,
        hashtags: [businessType.replace(/_/g, ''), location.replace(/\s/g, ''), 'LocalBusiness'],
      },
    },
  ]

  await supabase.from('content').insert(sampleContent)
}

// Get onboarding progress
export async function getOnboardingProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  hasProfile: boolean
  hasBusiness: boolean
  hasContent: boolean
  hasIntegration: boolean
  completionPercent: number
}> {
  const [profileResult, businessResult, contentResult, integrationResult] = await Promise.all([
    supabase.from('profiles').select('id').eq('id', userId).single(),
    supabase.from('businesses').select('id').eq('user_id', userId).limit(1),
    supabase.from('content').select('id').eq('user_id', userId).limit(1),
    supabase.from('integrations').select('id').eq('user_id', userId).limit(1),
  ])

  const hasProfile = !!profileResult.data
  const hasBusiness = (businessResult.data?.length || 0) > 0
  const hasContent = (contentResult.data?.length || 0) > 0
  const hasIntegration = (integrationResult.data?.length || 0) > 0

  const steps = [hasProfile, hasBusiness, hasContent, hasIntegration]
  const completed = steps.filter(Boolean).length
  const completionPercent = Math.round((completed / steps.length) * 100)

  return {
    hasProfile,
    hasBusiness,
    hasContent,
    hasIntegration,
    completionPercent,
  }
}
