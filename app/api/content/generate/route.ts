import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateContent, ContentTemplate, isOpenAIConfigured } from '@/lib/openai'

export async function POST(request: Request) {
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { 
      template, 
      businessName, 
      industry, 
      topic, 
      tone = 'professional',
      additionalContext,
      saveAsDraft = false 
    } = body

    // Validate required fields
    if (!template || !businessName || !industry || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: template, businessName, industry, topic' },
        { status: 400 }
      )
    }

    // Validate template type
    const validTemplates: ContentTemplate[] = ['blog-post', 'social-post', 'gmb-post', 'email', 'review-response']
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      )
    }

    // Check usage limits (get subscription)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, content_generated_this_month')
      .eq('user_id', user.id)
      .single()

    const plan = subscription?.plan || 'free'
    const usedThisMonth = subscription?.content_generated_this_month || 0
    
    const limits: Record<string, number> = {
      free: 5,
      starter: 25,
      growth: 100,
      pro: -1, // unlimited
    }

    const limit = limits[plan] || 5
    if (limit !== -1 && usedThisMonth >= limit) {
      return NextResponse.json(
        { error: 'Monthly content limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    let content: string

    // Check if OpenAI is configured
    if (isOpenAIConfigured()) {
      // Use real AI generation
      content = await generateContent({
        template,
        businessName,
        industry,
        topic,
        tone,
        additionalContext,
      })
    } else {
      // Fall back to mock content for development
      content = generateMockContent(template, businessName, industry, topic, tone)
    }

    // Optionally save to database as draft
    let savedContent = null
    if (saveAsDraft) {
      const { data, error } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          template,
          title: topic,
          content,
          metadata: { businessName, industry, tone, additionalContext },
          status: 'draft'
        })
        .select()
        .single()

      if (!error) {
        savedContent = data

        // Update usage counter
        await supabase
          .from('subscriptions')
          .update({ 
            content_generated_this_month: usedThisMonth + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({
      success: true,
      content,
      savedContent,
      template,
      metadata: {
        businessName,
        industry,
        topic,
        tone,
        generatedAt: new Date().toISOString(),
        aiGenerated: isOpenAIConfigured()
      }
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}

// Mock content generator for development/demo
function generateMockContent(
  template: string, 
  business: string, 
  industry: string, 
  topic: string, 
  tone: string
): string {
  switch (template) {
    case 'blog-post':
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

*${business} is your local ${industry} expert. Contact us today!*`

    case 'social-post':
      return `✨ ${topic}

At ${business}, we're passionate about helping our community with all their ${industry.toLowerCase()} needs!

Here's a quick tip: Taking care of ${topic.toLowerCase()} early can save you time and money in the long run.

📞 Have questions? We're here to help!
📍 Serving our local community with pride

#${industry.replace(/\s+/g, '')} #Local${industry.replace(/\s+/g, '')} #SmallBusiness`

    case 'gmb-post':
      return `📢 ${topic}

${business} is excited to share important information about ${topic.toLowerCase()} with our valued customers!

As your trusted local ${industry.toLowerCase()} provider, we're committed to keeping you informed and helping you make the best decisions for your needs.

🔹 Professional service
🔹 Local expertise  
🔹 Customer satisfaction guaranteed

Ready to learn more? Give us a call or visit our location today!`

    case 'email':
      return `Subject: ${topic} - Important Updates from ${business}

Dear Valued Customer,

We hope this email finds you well! At ${business}, we're always looking for ways to better serve our community.

**${topic}**

We wanted to reach out today to share some valuable insights about ${topic.toLowerCase()}. As your trusted local ${industry.toLowerCase()} partner, we believe it's important to keep you in the loop.

**How We Can Help:**

Our team at ${business} is always here to answer your questions and provide personalized recommendations.

Ready to take the next step? Simply reply to this email or give us a call.

Warm regards,
The ${business} Team`

    case 'review-response':
      return `Thank you so much for taking the time to share your feedback! At ${business}, we truly value our customers and are delighted to hear about your positive experience.

Your kind words mean the world to our team. We look forward to serving you again soon!

Best regards,
The ${business} Team`

    default:
      return `Content for ${topic} - ${business}`
  }
}
