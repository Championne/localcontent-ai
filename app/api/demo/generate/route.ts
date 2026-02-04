import { NextResponse } from 'next/server'
import { generateContent, generateSocialPack, isOpenAIConfigured } from '@/lib/openai'

export const maxDuration = 60 // Allow up to 60 seconds

// Sample businesses for random demo
const DEMO_BUSINESSES = [
  { businessName: "Sunrise Bakery", industry: "Bakery", topic: "Fresh Sourdough Bread Every Morning" },
  { businessName: "Peak Fitness Studio", industry: "Fitness", topic: "Summer Body Transformation Program" },
  { businessName: "Green Leaf Landscaping", industry: "Landscaping", topic: "Spring Garden Makeover Tips" },
  { businessName: "Cozy Corner Cafe", industry: "Coffee Shop", topic: "New Seasonal Pumpkin Spice Menu" },
  { businessName: "Swift Auto Repair", industry: "Auto Repair", topic: "Winter Car Maintenance Checklist" },
  { businessName: "Bright Smile Dental", industry: "Dentistry", topic: "Family Dental Care Made Easy" },
  { businessName: "Harbor View Realty", industry: "Real Estate", topic: "First-Time Home Buyer Guide" },
  { businessName: "Paws & Claws Pet Spa", industry: "Pet Grooming", topic: "Summer Grooming Specials" },
  { businessName: "Iron Works Gym", industry: "Gym", topic: "New Year Fitness Challenge" },
  { businessName: "Bella's Italian Kitchen", industry: "Restaurant", topic: "Homemade Pasta Night Every Thursday" },
  { businessName: "Pixel Perfect Photography", industry: "Photography", topic: "Holiday Family Portrait Sessions" },
  { businessName: "Green Thumb Garden Center", industry: "Garden Center", topic: "Container Gardening for Beginners" },
  { businessName: "Sparkle Clean Services", industry: "Cleaning", topic: "Spring Deep Clean Special Offer" },
  { businessName: "Mountain View Plumbing", industry: "Plumbing", topic: "Emergency Plumbing Services 24/7" },
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
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous'
  
  if (!checkRateLimit(ip)) {
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
    
    // If not provided, pick random
    if (!businessName || !industry || !topic) {
      const randomBusiness = DEMO_BUSINESSES[Math.floor(Math.random() * DEMO_BUSINESSES.length)]
      businessName = businessName || randomBusiness.businessName
      industry = industry || randomBusiness.industry
      topic = topic || randomBusiness.topic
    }
    
    // Pick random content type if not specified
    if (!contentType || !CONTENT_TYPES.includes(contentType)) {
      contentType = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)]
    }

    let content: string | Record<string, unknown>
    let displayType: string

    if (!isOpenAIConfigured()) {
      // Return mock data with a note
      return NextResponse.json({
        success: true,
        demo: true,
        aiPowered: false,
        businessName,
        industry,
        topic,
        contentType,
        displayType: contentType === 'social-pack' ? 'Social Media Pack' : 
                     contentType === 'blog-post' ? 'Blog Post' :
                     contentType === 'gmb-post' ? 'Google Business Post' : 'Email Newsletter',
        content: getMockContent(contentType, businessName, industry, topic),
        message: 'Demo mode - configure AI for live generation'
      })
    }

    // Generate real content with AI
    if (contentType === 'social-pack') {
      content = await generateSocialPack({
        businessName,
        industry,
        topic,
        tone: 'professional',
      })
      displayType = 'Social Media Pack'
    } else {
      content = await generateContent({
        template: contentType as 'blog-post' | 'gmb-post' | 'email',
        businessName,
        industry,
        topic,
        tone: 'professional',
        gbpPostType: contentType === 'gmb-post' ? 'update' : undefined,
      })
      displayType = contentType === 'blog-post' ? 'Blog Post' :
                    contentType === 'gmb-post' ? 'Google Business Post' : 'Email Newsletter'
    }

    return NextResponse.json({
      success: true,
      demo: true,
      aiPowered: true,
      businessName,
      industry,
      topic,
      contentType,
      displayType,
      content,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Demo generation error:', error)
    return NextResponse.json(
      { error: 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Mock content for when AI is not configured
function getMockContent(type: string, business: string, industry: string, topic: string) {
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
