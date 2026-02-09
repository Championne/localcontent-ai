import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateContent, generateSocialPack, ContentTemplate, isOpenAIConfigured, SocialPackResult, GbpPostType } from '@/lib/openai'
import {
  generateImage,
  isImageGenerationConfigured,
  hasImageQuota,
  getRemainingImageQuota,
  detectBestStyle,
  IMAGE_LIMITS,
  ImageStyle
} from '@/lib/openai/images'
import { persistContentImage } from '@/lib/content-image'
import { getStockImageOptions, isStockImageConfigured } from '@/lib/stock-images'

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
      saveAsDraft = false,
      generateImageFlag = false,
      imageSource = 'stock', // 'stock' | 'ai': default free stock, optional AI
      imageStyle,
      regenerateMode = 'all', // 'all' | 'text' | 'image'
      stockPage, // optional 1-based page for stock images; when omitted, use random page so regenerate returns new pictures
      // Branding (from Brand identity)
      tagline,
      defaultCtaPrimary,
      defaultCtaSecondary,
      seoKeywords,
      shortAbout,
      website,
      socialHandles,
      serviceAreas,
      location,
      brandPrimaryColor,
      brandSecondaryColor,
      brandAccentColor,
      // GBP-specific fields
      gbpPostType,
      gbpExpiration,
      gbpEventDate,
      gbpEventTime,
      // New style system fields
      subVariation,
      postType: requestPostType,
      preferredStyles,
      avoidStyles,
      includeAiImage = false, // explicit opt-in for DALL-E generation
    } = body
    
    // Determine what to generate based on mode
    const shouldGenerateText = regenerateMode === 'all' || regenerateMode === 'text'
    const shouldGenerateImage = (regenerateMode === 'all' || regenerateMode === 'image') && generateImageFlag
    // Use random stock page when not specified so "Generate all (images)" returns different results each time
    const stockImagePage =
      typeof stockPage === 'number' && stockPage >= 1 && stockPage <= 20
        ? stockPage
        : Math.floor(1 + Math.random() * 8)

    // Validate required fields
    if (!template || !businessName || !industry || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: template, businessName, industry, topic' },
        { status: 400 }
      )
    }

    // Validate template type
    const validTemplates: ContentTemplate[] = ['blog-post', 'social-post', 'social-pack', 'gmb-post', 'email', 'review-response']
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      )
    }

    // Check usage limits (get subscription)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, content_generated_this_month, images_generated_this_month')
      .eq('user_id', user.id)
      .single()

    const plan = subscription?.plan || 'free'
    const usedThisMonth = subscription?.content_generated_this_month || 0
    const imagesUsedThisMonth = subscription?.images_generated_this_month || 0
    
    const limits: Record<string, number> = {
      free: 5,
      starter: 30,
      pro: 100,
      premium: -1, // unlimited
    }

    const limit = limits[plan] || 5
    if (limit !== -1 && usedThisMonth >= limit) {
      return NextResponse.json(
        { error: 'Monthly content limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Image quota only applies when using AI (stock is free)
    if (generateImageFlag && imageSource === 'ai' && !hasImageQuota(plan, imagesUsedThisMonth)) {
      return NextResponse.json(
        { error: 'Monthly image limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Determine image style (use provided or auto-detect with weighted scoring)
    const ALL_STYLES: ImageStyle[] = ['promotional', 'professional', 'friendly', 'seasonal', 'artistic', 'graffiti', 'lifestyle', 'minimalist', 'vintage', 'wellness']
    const bizPreferred = Array.isArray(preferredStyles) ? preferredStyles : undefined
    const bizAvoided = Array.isArray(avoidStyles) ? avoidStyles : undefined
    const effectivePostType = requestPostType || template
    const finalImageStyle: ImageStyle = (imageStyle && ALL_STYLES.includes(imageStyle))
      ? imageStyle
      : detectBestStyle(topic, industry, effectivePostType, bizPreferred, bizAvoided)

    // Handle social-pack separately
    if (template === 'social-pack') {
      let socialPack: SocialPackResult | null = null

      // Only generate text if requested
      if (shouldGenerateText) {
        if (isOpenAIConfigured()) {
          socialPack = await generateSocialPack({
            businessName,
            industry,
            topic,
            tone,
            location: location || undefined,
            additionalContext,
            tagline: tagline || undefined,
            defaultCtaPrimary: defaultCtaPrimary || undefined,
            defaultCtaSecondary: defaultCtaSecondary || undefined,
            seoKeywords: seoKeywords || undefined,
            shortAbout: shortAbout || undefined,
            website: website || undefined,
            socialHandles: socialHandles || undefined,
            serviceAreas: serviceAreas || undefined,
          })
        } else {
          // Mock social pack for development
          socialPack = generateMockSocialPack(businessName, industry, topic)
        }
      }

      // Image: stock = return options for picker; AI = single generated image. AI only when explicitly opted-in via includeAiImage or imageSource==='ai'.
      let image = null
      let generatedImageId: string | null = null
      let stockImageOptions: Array<{ url: string; attribution: string; photographerName: string; photographerUrl: string; downloadLocation?: string }> = []
      if (shouldGenerateImage) {
        const useStock = imageSource === 'stock' && isStockImageConfigured()
        const canUseAi = isImageGenerationConfigured() && hasImageQuota(plan, imagesUsedThisMonth)
        try {
          if (useStock) {
            const options = await getStockImageOptions({ topic, industry, contentType: template }, 5, stockImagePage)
            if (options.length) stockImageOptions = options
          }
          // Only generate AI image when user explicitly opted in, or when imageSource is 'ai', or when no stock images were found (fallback)
          const shouldGenerateAiImage = canUseAi && (imageSource === 'ai' || includeAiImage || stockImageOptions.length === 0)
          if (shouldGenerateAiImage) {
            const imageResult = await generateImage({
              topic,
              businessName,
              industry,
              style: finalImageStyle,
              subVariation: subVariation || undefined,
              contentType: template,
              postType: effectivePostType,
              preferredStyles: bizPreferred,
              avoidStyles: bizAvoided,
              brandPrimaryColor: brandPrimaryColor || undefined,
              brandSecondaryColor: brandSecondaryColor || undefined,
              brandAccentColor: brandAccentColor || undefined,
            })
            const permanentUrl = await persistContentImage(supabase, user.id, imageResult.url)
            const imageUrl = permanentUrl || imageResult.url
            image = {
              url: imageUrl,
              style: imageResult.style,
              size: imageResult.size,
              generatedAt: new Date().toISOString(),
              source: 'ai'
            }
            const { data: imgRow } = await supabase
              .from('generated_images')
              .insert({
                user_id: user.id,
                image_url: imageUrl,
                topic,
                business_name: businessName,
                industry,
                style: imageResult.style,
                content_type: template,
                size: imageResult.size,
                full_prompt: imageResult.fullPrompt || null,
                revised_prompt: imageResult.revisedPrompt || null,
                prompt_version: 'v1',
                source: 'ai'
              })
              .select('id')
              .single()
            if (imgRow) generatedImageId = imgRow.id
            await supabase
              .from('subscriptions')
              .update({
                images_generated_this_month: imagesUsedThisMonth + 1,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
          }
        } catch (imgError) {
          console.error('Image generation failed:', imgError)
        }
      }

      // Record text generation for Text Library
      let generatedTextId: string | null = null
      const contentStr = JSON.stringify(socialPack)
      const preview = contentStr.length > 500 ? contentStr.slice(0, 500) + '…' : contentStr
      const { data: textRow } = await supabase
        .from('generated_texts')
        .insert({
          user_id: user.id,
          template: 'social-pack',
          topic,
          business_name: businessName,
          industry,
          tone,
          content_preview: preview,
          content_full: contentStr,
          prompt_summary: `topic: ${topic}, template: social-pack, business: ${businessName}, industry: ${industry}`,
          prompt_version: 'v1'
        })
        .select('id')
        .single()
      if (textRow) generatedTextId = textRow.id

      // Optionally save to database
      let savedContent = null
      if (saveAsDraft) {
        const { data, error } = await supabase
          .from('content')
          .insert({
            user_id: user.id,
            template: 'social-pack',
            title: topic,
            content: contentStr,
            metadata: {
              businessName,
              industry,
              tone,
              additionalContext,
              type: 'social-pack',
              image_url: image?.url || null,
              image_style: image?.style || null
            },
            status: 'draft'
          })
          .select()
          .single()

        if (!error && data) {
          savedContent = data
          if (generatedImageId) {
            await supabase.from('generated_images').update({ content_id: data.id }).eq('id', generatedImageId)
          }
          if (generatedTextId) {
            await supabase.from('generated_texts').update({ content_id: data.id }).eq('id', generatedTextId)
          }
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
        socialPack,
        image,
        stockImageOptions: stockImageOptions.length ? stockImageOptions : undefined,
        savedContent,
        generated_image_id: generatedImageId,
        generated_text_id: generatedTextId,
        template: 'social-pack',
        metadata: {
          businessName,
          industry,
          topic,
          tone,
          generatedAt: new Date().toISOString(),
          aiGenerated: isOpenAIConfigured(),
          imageGenerated: !!image || stockImageOptions.length > 0
        },
        usage: {
          imagesRemaining: getRemainingImageQuota(plan, imagesUsedThisMonth + (image && (image as { source?: string }).source === 'ai' ? 1 : 0)),
          imageLimit: IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
        }
      })
    }

    // Handle regular content templates
    let content: string | null = null

    // Only generate text if requested
    if (shouldGenerateText) {
      if (isOpenAIConfigured()) {
        content = await generateContent({
          template,
          businessName,
          industry,
          topic,
          tone,
          location: location || undefined,
          additionalContext,
          tagline: tagline || undefined,
          defaultCtaPrimary: defaultCtaPrimary || undefined,
          defaultCtaSecondary: defaultCtaSecondary || undefined,
          seoKeywords: seoKeywords || undefined,
          shortAbout: shortAbout || undefined,
          website: website || undefined,
          socialHandles: socialHandles || undefined,
          serviceAreas: serviceAreas || undefined,
          gbpPostType: template === 'gmb-post' ? (gbpPostType as GbpPostType || 'update') : undefined,
          gbpExpiration: template === 'gmb-post' && gbpPostType === 'offer' ? gbpExpiration : undefined,
          gbpEventDate: template === 'gmb-post' && gbpPostType === 'event' ? gbpEventDate : undefined,
          gbpEventTime: template === 'gmb-post' && gbpPostType === 'event' ? gbpEventTime : undefined,
        })
      } else {
        content = generateMockContent(template, businessName, industry, topic, tone, gbpPostType)
      }
    }

    // Image: stock = return options for picker; AI = single generated image. AI only when explicitly opted-in via includeAiImage or imageSource==='ai'.
    let image = null
    let generatedImageId: string | null = null
    let stockImageOptions: Array<{ url: string; attribution: string; photographerName: string; photographerUrl: string; downloadLocation?: string }> = []
    if (shouldGenerateImage) {
      const useStock = imageSource === 'stock' && isStockImageConfigured()
      const canUseAi = isImageGenerationConfigured() && hasImageQuota(plan, imagesUsedThisMonth)
      try {
        if (useStock) {
          const options = await getStockImageOptions({ topic, industry, contentType: template }, 5, stockImagePage)
          if (options.length) stockImageOptions = options
        }
        // Only generate AI image when user explicitly opted in, or when imageSource is 'ai', or when no stock images were found (fallback)
        const shouldGenerateAiImage = canUseAi && (imageSource === 'ai' || includeAiImage || stockImageOptions.length === 0)
        if (shouldGenerateAiImage) {
          const imageResult = await generateImage({
            topic,
            businessName,
            industry,
            style: finalImageStyle,
            subVariation: subVariation || undefined,
            contentType: template,
            postType: effectivePostType,
            preferredStyles: bizPreferred,
            avoidStyles: bizAvoided,
            brandPrimaryColor: brandPrimaryColor || undefined,
            brandSecondaryColor: brandSecondaryColor || undefined,
            brandAccentColor: brandAccentColor || undefined,
          })
          const permanentUrl = await persistContentImage(supabase, user.id, imageResult.url)
          const imageUrl = permanentUrl || imageResult.url
          image = {
            url: imageUrl,
            style: imageResult.style,
            size: imageResult.size,
            generatedAt: new Date().toISOString(),
            source: 'ai'
          }
          const { data: imgRow } = await supabase
            .from('generated_images')
            .insert({
              user_id: user.id,
              image_url: imageUrl,
              topic,
              business_name: businessName,
              industry,
              style: imageResult.style,
              content_type: template,
              size: imageResult.size,
              full_prompt: imageResult.fullPrompt || null,
              revised_prompt: imageResult.revisedPrompt || null,
              prompt_version: 'v1',
              source: 'ai'
            })
            .select('id')
            .single()
          if (imgRow) generatedImageId = imgRow.id
          await supabase
            .from('subscriptions')
            .update({
              images_generated_this_month: imagesUsedThisMonth + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
        }
      } catch (imgError) {
        console.error('Image generation failed:', imgError)
      }
    }

    // Record text generation for Text Library
    let generatedTextId: string | null = null
    const contentPreview = content && content.length > 500 ? content.slice(0, 500) + '…' : (content || '')
    const { data: textRow } = await supabase
      .from('generated_texts')
      .insert({
        user_id: user.id,
        template,
        topic,
        business_name: businessName,
        industry,
        tone,
        content_preview: contentPreview,
        content_full: content || null,
        prompt_summary: `topic: ${topic}, template: ${template}, business: ${businessName}, industry: ${industry}`,
        prompt_version: 'v1'
      })
      .select('id')
      .single()
    if (textRow) generatedTextId = textRow.id

    // Optionally save to database as draft
    let savedContent = null
    if (saveAsDraft) {
      const { data, error } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          template,
          title: topic,
          content: content || '',
          metadata: { 
            businessName, 
            industry, 
            tone, 
            additionalContext,
            gbpPostType: template === 'gmb-post' ? gbpPostType : undefined,
            image_url: image?.url || null,
            image_style: image?.style || null
          },
          status: 'draft'
        })
        .select()
        .single()

      if (!error && data) {
        savedContent = data
        if (generatedImageId) {
          await supabase.from('generated_images').update({ content_id: data.id }).eq('id', generatedImageId)
        }
        if (generatedTextId) {
          await supabase.from('generated_texts').update({ content_id: data.id }).eq('id', generatedTextId)
        }
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
      image,
      stockImageOptions: stockImageOptions.length ? stockImageOptions : undefined,
      savedContent,
      generated_image_id: generatedImageId,
      generated_text_id: generatedTextId,
      template,
      metadata: {
        businessName,
        industry,
        topic,
        tone,
        gbpPostType: template === 'gmb-post' ? gbpPostType : undefined,
        generatedAt: new Date().toISOString(),
        aiGenerated: isOpenAIConfigured(),
        imageGenerated: !!image || stockImageOptions.length > 0
      },
      usage: {
        imagesRemaining: getRemainingImageQuota(plan, imagesUsedThisMonth + (image && (image as { source?: string }).source === 'ai' ? 1 : 0)),
        imageLimit: IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
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

// Mock social pack generator for development
function generateMockSocialPack(business: string, industry: string, topic: string): SocialPackResult {
  return {
    twitter: {
      content: `${topic} tip from ${business}! Quick wins for your ${industry.toLowerCase()} needs. Let's connect! #${industry.replace(/\s+/g, '')} #LocalBusiness`,
      charCount: 95
    },
    facebook: {
      content: `Hey neighbors! ${business} here with some thoughts on ${topic.toLowerCase()}. What's your experience been?`,
      charCount: 78
    },
    instagram: {
      content: `✨ ${topic} ✨\n\nAt ${business}, we're all about helping our community thrive. Here's what we've learned about ${topic.toLowerCase()} over the years...\n\nTap the link in bio to learn more! 💪`,
      hashtags: `#${industry.replace(/\s+/g, '')} #Local${industry.replace(/\s+/g, '')} #SmallBusiness #SupportLocal #${topic.replace(/\s+/g, '')} #CommunityFirst #LocalExperts #TrustedPros`,
      charCount: 180
    },
    linkedin: {
      content: `Insight from ${business}: ${topic} is transforming how local ${industry.toLowerCase()} businesses serve their communities.\n\nHere's what we're seeing in the market and how it impacts you...\n\n#${industry.replace(/\s+/g, '')} #BusinessInsights #LocalBusiness`,
      charCount: 195
    },
    tiktok: {
      content: `POV: You finally found a ${industry.toLowerCase()} pro who actually gets it 😤✨ ${topic} tips coming your way! #${industry.replace(/\s+/g, '')}Tok #LocalBiz #SmallBusiness`,
      charCount: 125
    },
    nextdoor: {
      content: `Hi neighbors! ${business} here. We've been serving our community for years and wanted to share some helpful info about ${topic.toLowerCase()}. Feel free to reach out if you have any questions - always happy to help a neighbor!`,
      charCount: 210
    }
  }
}

// Mock content generator for development/demo
function generateMockContent(
  template: string, 
  business: string, 
  industry: string, 
  topic: string, 
  tone: string,
  gbpPostType?: string
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
      // Generate different mock content based on GBP post type
      if (gbpPostType === 'offer') {
        return `🎁 Special Offer: ${topic}!

${business} is offering this exclusive deal for a limited time. Don't miss out on this opportunity to save.

✅ Quality service guaranteed
✅ Local expertise you can trust

Tap "Get Offer" to claim yours today!`
      } else if (gbpPostType === 'event') {
        return `📅 Upcoming Event: ${topic}

Join ${business} for this special event! We're excited to share our ${industry.toLowerCase()} expertise with the community.

🔹 Learn from the experts
🔹 Meet your neighbors
🔹 Limited spots available

Tap "Book" to reserve your spot!`
      } else {
        return `📢 ${topic}

${business} is excited to share important information about ${topic.toLowerCase()} with our valued customers!

As your trusted local ${industry.toLowerCase()} provider, we're committed to keeping you informed.

🔹 Professional service
🔹 Local expertise  

Tap "Learn More" to get all the details!`
      }

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
