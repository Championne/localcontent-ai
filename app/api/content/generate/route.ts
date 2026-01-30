import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { template, businessName, industry, topic, tone = 'professional' } = body

    // Validate required fields
    if (!template || !businessName || !industry || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, this would call OpenAI API
    // For now, we generate a mock response based on the template type
    let content = ''
    
    switch (template) {
      case 'blog-post':
        content = generateBlogPost(businessName, industry, topic, tone)
        break
      case 'social-post':
        content = generateSocialPost(businessName, industry, topic, tone)
        break
      case 'gmb-post':
        content = generateGMBPost(businessName, industry, topic, tone)
        break
      case 'email':
        content = generateEmail(businessName, industry, topic, tone)
        break
      default:
        content = generateBlogPost(businessName, industry, topic, tone)
    }

    // In production, save to database
    // const { data, error } = await supabase.from('content').insert({
    //   user_id: user.id,
    //   template,
    //   title: topic,
    //   content,
    //   status: 'draft'
    // })

    return NextResponse.json({
      success: true,
      content,
      template,
      metadata: {
        businessName,
        industry,
        topic,
        tone,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function generateBlogPost(business: string, industry: string, topic: string, tone: string): string {
  return `# ${topic}

*Written for ${business} | ${industry}*

## Introduction

As a trusted ${industry} professional, ${business} understands the importance of ${topic.toLowerCase()}. In this article, we'll explore key insights and actionable tips that can help you make informed decisions.

## Key Points to Consider

### 1. Understanding the Basics

When it comes to ${topic.toLowerCase()}, there are several fundamental aspects that every customer should understand. At ${business}, we believe in educating our clients to help them make the best choices.

### 2. Why This Matters

${topic} directly impacts your daily life and long-term satisfaction. Our team at ${business} has seen firsthand how proper attention to this area can lead to significant improvements.

### 3. Expert Tips

Here are some professional recommendations from our experienced team:

- Take time to research your options
- Don't hesitate to ask questions
- Consider long-term value over short-term savings
- Work with reputable professionals like ${business}

## Take Action Today

Ready to learn more about ${topic.toLowerCase()}? Contact ${business} today for a consultation. Our friendly team is here to help guide you through the process.

---

*${business} is your local ${industry} expert. Contact us today!*
`
}

function generateSocialPost(business: string, industry: string, topic: string, tone: string): string {
  return `✨ ${topic}

At ${business}, we're passionate about helping our community with all their ${industry.toLowerCase()} needs!

Here's a quick tip: Taking care of ${topic.toLowerCase()} early can save you time and money in the long run.

📞 Have questions? We're here to help!
📍 Serving our local community with pride

#${industry.replace(/\s+/g, '')} #Local${industry.replace(/\s+/g, '')} #${business.replace(/\s+/g, '')} #CommunityFirst #SmallBusiness
`
}

function generateGMBPost(business: string, industry: string, topic: string, tone: string): string {
  return `📢 ${topic}

${business} is excited to share important information about ${topic.toLowerCase()} with our valued customers!

As your trusted local ${industry.toLowerCase()} provider, we're committed to keeping you informed and helping you make the best decisions for your needs.

🔹 Professional service
🔹 Local expertise  
🔹 Customer satisfaction guaranteed

Ready to learn more? Give us a call or visit our location today!

📞 Call us now
📍 Visit us locally
💬 Message for questions
`
}

function generateEmail(business: string, industry: string, topic: string, tone: string): string {
  return `Subject: ${topic} - Important Updates from ${business}

Dear Valued Customer,

We hope this email finds you well! At ${business}, we're always looking for ways to better serve our community and keep you informed about important ${industry.toLowerCase()} topics.

**${topic}**

We wanted to reach out today to share some valuable insights about ${topic.toLowerCase()}. As your trusted local ${industry.toLowerCase()} partner, we believe it's important to keep you in the loop about developments that may affect you.

**What This Means For You:**

• Stay informed about the latest trends
• Make better decisions with expert guidance
• Access exclusive tips from our experienced team

**How We Can Help:**

Our team at ${business} is always here to answer your questions and provide personalized recommendations. Whether you need advice, service, or just want to chat about your options, we're just a call away.

Ready to take the next step? Simply reply to this email or give us a call at your convenience.

Thank you for being a valued member of our community!

Warm regards,

The ${business} Team

---
${business} | Your Local ${industry} Experts
`
}
