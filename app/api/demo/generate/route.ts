import { NextResponse } from 'next/server'
import { generateContent, generateSocialPack, isOpenAIConfigured, SocialPackResult } from '@/lib/openai'
import { generateImage, isImageGenerationConfigured, detectBestStyle } from '@/lib/openai/images'

export const maxDuration = 90 // Allow up to 90 seconds for text + image

// IP Allowlist - these IPs bypass ALL limits (rate limit + demo limit)
// Set DEMO_ALLOWLIST_IPS in .env.local as comma-separated IPs: "123.45.67.89,98.76.54.32"
const ALLOWLISTED_IPS = (process.env.DEMO_ALLOWLIST_IPS || '').split(',').map(ip => ip.trim()).filter(Boolean)

function isAllowlisted(ip: string): boolean {
  return ALLOWLISTED_IPS.includes(ip)
}

// Demo limits removed – no cap on demo generations

// Sample businesses for random demo - expanded to cover all industry selector options
const DEMO_BUSINESSES = [
  // Plumbing & HVAC
  { businessName: "Mountain View Plumbing", industry: "Plumbing", topic: "Emergency Plumbing Services 24/7" },
  { businessName: "Comfort Zone HVAC", industry: "Plumbing", topic: "AC Tune-Up Special Before Summer" },
  { businessName: "RapidFlow Plumbers", industry: "Plumbing", topic: "Drain Cleaning Tips for Homeowners" },
  
  // Restaurant & Cafe
  { businessName: "Bella's Italian Kitchen", industry: "Restaurant", topic: "Homemade Pasta Night Every Thursday" },
  { businessName: "Cozy Corner Cafe", industry: "Restaurant", topic: "New Seasonal Pumpkin Spice Menu" },
  { businessName: "Sunrise Bakery", industry: "Restaurant", topic: "Fresh Sourdough Bread Every Morning" },
  
  // Dental Practice
  { businessName: "Bright Smile Dental", industry: "Dental", topic: "Family Dental Care Made Easy" },
  { businessName: "Pearl White Dentistry", industry: "Dental", topic: "Teeth Whitening Special Offer" },
  { businessName: "Gentle Care Dental", industry: "Dental", topic: "Anxiety-Free Dental Visits" },
  
  // Fitness & Gym
  { businessName: "Peak Fitness Studio", industry: "Fitness", topic: "Summer Body Transformation Program" },
  { businessName: "Iron Works Gym", industry: "Fitness", topic: "New Year Fitness Challenge" },
  { businessName: "FlexZone Training", industry: "Fitness", topic: "Personal Training Introductory Offer" },
  
  // Hair Salon & Spa
  { businessName: "Glamour Hair Studio", industry: "Beauty Salon", topic: "Summer Hair Color Trends" },
  { businessName: "Serenity Day Spa", industry: "Beauty Salon", topic: "Valentine's Couples Massage Package" },
  { businessName: "Style & Grace Salon", industry: "Beauty Salon", topic: "Bridal Hair & Makeup Services" },
  
  // Real Estate
  { businessName: "Harbor View Realty", industry: "Real Estate", topic: "First-Time Home Buyer Guide" },
  { businessName: "Premier Properties Group", industry: "Real Estate", topic: "Market Update: Best Time to Sell" },
  { businessName: "Hometown Realtors", industry: "Real Estate", topic: "Open House This Weekend" },
  
  // Law Firm
  { businessName: "Justice & Associates", industry: "Legal Services", topic: "Free Initial Consultation Offer" },
  { businessName: "Family Law Partners", industry: "Legal Services", topic: "Divorce Mediation Services" },
  { businessName: "Business Law Group", industry: "Legal Services", topic: "Protect Your Small Business" },
  
  // Auto Repair
  { businessName: "Swift Auto Repair", industry: "Auto Repair", topic: "Winter Car Maintenance Checklist" },
  { businessName: "Precision Auto Care", industry: "Auto Repair", topic: "Brake Service Special This Month" },
  { businessName: "Honest Mechanic Shop", industry: "Auto Repair", topic: "Free Vehicle Inspection" },
  
  // Landscaping
  { businessName: "Green Leaf Landscaping", industry: "Landscaping", topic: "Spring Garden Makeover Tips" },
  { businessName: "Nature's Touch Lawn Care", industry: "Landscaping", topic: "Seasonal Lawn Maintenance Plans" },
  { businessName: "Outdoor Living Designs", industry: "Landscaping", topic: "Backyard Patio Installation" },
  
  // Cleaning Service
  { businessName: "Sparkle Clean Services", industry: "Cleaning", topic: "Spring Deep Clean Special Offer" },
  { businessName: "Fresh Start Cleaning", industry: "Cleaning", topic: "Move-In/Move-Out Cleaning" },
  { businessName: "Green Clean Pros", industry: "Cleaning", topic: "Eco-Friendly Office Cleaning" },
  
  // Accounting
  { businessName: "Balance Sheet Accounting", industry: "Accounting", topic: "Tax Season Preparation Tips" },
  { businessName: "Small Biz Books", industry: "Accounting", topic: "Bookkeeping Services for Startups" },
  { businessName: "Financial Focus CPA", industry: "Accounting", topic: "Year-End Tax Planning Strategies" },
  
  // Additional variety
  { businessName: "Paws & Claws Pet Spa", industry: "Pet Grooming", topic: "Summer Grooming Specials" },
  { businessName: "Pixel Perfect Photography", industry: "Photography", topic: "Holiday Family Portrait Sessions" },
  { businessName: "Green Thumb Garden Center", industry: "Garden Center", topic: "Container Gardening for Beginners" },
  { businessName: "Coastal Electric", industry: "Electrician", topic: "Smart Home Installation Services" },
]

const CONTENT_TYPES = ['social-pack', 'blog-post', 'gmb-post', 'email'] as const

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: Request) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'anonymous'
  
  const isUnlimited = isAllowlisted(ip)
  
  // Skip rate limit for allowlisted IPs
  if (!isUnlimited && !checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    
    // Allow custom business or pick random
    let businessName = body.businessName
    let industry = body.industry
    let topic = body.topic
    let contentType = body.contentType
    
    // If industry is specified, filter businesses by that industry
    // If not provided, pick random from all
    if (!businessName || !topic) {
      let availableBusinesses = DEMO_BUSINESSES
      
      // Filter by industry if provided
      if (industry) {
        const matchingBusinesses = DEMO_BUSINESSES.filter(b => 
          b.industry.toLowerCase().includes(industry.toLowerCase()) ||
          industry.toLowerCase().includes(b.industry.toLowerCase())
        )
        if (matchingBusinesses.length > 0) {
          availableBusinesses = matchingBusinesses
        }
      }
      
      const randomBusiness = availableBusinesses[Math.floor(Math.random() * availableBusinesses.length)]
      businessName = businessName || randomBusiness.businessName
      industry = industry || randomBusiness.industry
      topic = topic || randomBusiness.topic
    }
    
    // Pick random content type if not specified
    if (!contentType || !CONTENT_TYPES.includes(contentType)) {
      contentType = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)]
    }

    let content: string | SocialPackResult
    let displayType: string
    let aiPowered = false

    // No demo limits – usage info for optional client display only
    const usageInfo = {
      demoCount: 0,
      remainingDemos: 999,
      hasEmail: false,
      requiresEmail: false,
      requiresSignup: false,
      unlimited: true
    }

    displayType = contentType === 'social-pack' ? 'Social Media Pack' : 
                  contentType === 'blog-post' ? 'Blog Post' :
                  contentType === 'gmb-post' ? 'Google Business Post' : 'Email Newsletter'

    // Try AI generation first, fall back to mock content on any failure
    if (isOpenAIConfigured()) {
      try {
        if (contentType === 'social-pack') {
          content = await generateSocialPack({
            businessName,
            industry,
            topic,
            tone: 'professional',
          })
        } else {
          content = await generateContent({
            template: contentType as 'blog-post' | 'gmb-post' | 'email',
            businessName,
            industry,
            topic,
            tone: 'professional',
            gbpPostType: contentType === 'gmb-post' ? 'update' : undefined,
          })
        }
        aiPowered = true
      } catch (aiError) {
        console.error('[Demo] AI content generation failed, using mock:', aiError instanceof Error ? aiError.message : aiError)
        content = getMockContent(contentType, businessName, industry, topic)
      }
    } else {
      content = getMockContent(contentType, businessName, industry, topic)
    }

    // If AI content failed and we got mock, content is already set above
    if (!content) {
      content = getMockContent(contentType, businessName, industry, topic)
    }

    // Image: try AI image, gracefully skip on failure
    let imageUrl: string | undefined
    let imageSource: string | undefined
    let imageError: string | undefined
    const imageConfigured = isImageGenerationConfigured()

    if (imageConfigured) {
      try {
        const style = detectBestStyle(topic)
        const imageResult = await generateImage({
          topic,
          businessName,
          industry,
          style,
          contentType,
        })
        imageUrl = imageResult.url
        imageSource = 'ai'
      } catch (imgError: unknown) {
        const errMsg = imgError instanceof Error ? imgError.message : String(imgError)
        console.error('[Demo] AI image generation failed:', errMsg)
        imageError = errMsg
      }
    }

    console.log(`[Demo] Generation complete: ai=${aiPowered}, image=${imageSource || 'none'}`)
    const response = NextResponse.json({
      success: true,
      demo: true,
      aiPowered,
      businessName,
      industry,
      topic,
      contentType,
      displayType,
      content,
      imageUrl,
      imageSource,
      imageError: imageError || undefined,
      generatedAt: new Date().toISOString(),
      usage: usageInfo
    })
    return response

  } catch (error) {
    console.error('Demo generation error:', error)
    return NextResponse.json(
      { error: 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Mock content for when AI is not configured
function getMockContent(type: string, business: string, industry: string, topic: string): string | SocialPackResult {
  if (type === 'social-pack') {
    return {
      twitter: { content: `🔥 ${topic} at ${business}! Your local ${industry.toLowerCase()} experts are here to help. #${industry.replace(/\s+/g, '')} #LocalBusiness #SupportLocal`, charCount: 120 },
      facebook: { content: `Hey neighbors! ${business} here with exciting news about ${topic.toLowerCase()}. We've been serving this community with pride and can't wait to share this with you! Stop by and see what's new. 🎉`, charCount: 180 },
      instagram: { content: `✨ ${topic} ✨\n\nAt ${business}, we believe in bringing the best to our community. Here's something special we've been working on...\n\nTap the link in bio to learn more! 💫`, hashtags: `#${industry.replace(/\s+/g, '')} #Local${industry.replace(/\s+/g, '')} #SmallBusiness #SupportLocal #CommunityFirst`, charCount: 200 },
      linkedin: { content: `Excited to announce: ${topic}\n\nAt ${business}, we're committed to excellence in the ${industry.toLowerCase()} industry. This initiative represents our dedication to serving our customers better.\n\n#${industry.replace(/\s+/g, '')} #BusinessGrowth #LocalBusiness`, charCount: 250 },
      tiktok: { content: `POV: You just discovered the best ${industry.toLowerCase()} spot in town 😍 ${topic} at ${business}! #${industry.replace(/\s+/g, '')}Tok #SmallBusiness #Local`, charCount: 130 },
      nextdoor: { content: `Hi neighbors! ${business} here. We wanted to share some exciting news: ${topic.toLowerCase()}. As your local ${industry.toLowerCase()} provider, we're always looking for ways to better serve our community. Feel free to reach out with any questions!`, charCount: 230 }
    }
  }
  
  if (type === 'blog-post') {
    return `# ${topic}\n\n*By ${business} | Your Local ${industry} Experts*\n\n## Introduction\n\nWelcome to ${business}! As your trusted local ${industry.toLowerCase()} provider, we're excited to share valuable insights about ${topic.toLowerCase()}.\n\n## Why This Matters\n\nIn today's fast-paced world, understanding ${topic.toLowerCase()} can make a real difference for you and your family. Our team at ${business} has years of experience helping customers just like you.\n\n## Key Takeaways\n\n- **Quality matters** - Don't settle for less than the best\n- **Local expertise** - We understand your community's unique needs\n- **Personal service** - You're not just a number to us\n\n## Take Action Today\n\nReady to learn more? Contact ${business} today and let us show you why we're the area's most trusted ${industry.toLowerCase()} professionals.\n\n---\n\n*${business} - Proudly serving our community*`
  }
  
  if (type === 'gmb-post') {
    return `🎉 ${topic}!\n\nVisit ${business} today and discover why we're the area's favorite ${industry.toLowerCase()} destination.\n\n✅ Expert service\n✅ Friendly staff\n✅ Competitive prices\n\nTap "Learn More" to get started!`
  }
  
  // Email
  return `Subject: ${topic} - News from ${business}\n\nHi there,\n\nWe hope this message finds you well! At ${business}, we're always working to bring you the best in ${industry.toLowerCase()} services.\n\n**${topic}**\n\nWe're excited to share this with our valued customers. Here's what you need to know:\n\n• Quality you can trust\n• Service you deserve\n• Prices that make sense\n\nReady to take the next step? Simply reply to this email or visit us today.\n\nWarm regards,\nThe ${business} Team`
}
