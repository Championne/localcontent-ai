/**
 * Personality-Aware Campaign Email Template
 *
 * Adapts subject line, greeting, CTA text, and emoji usage
 * based on the detected brand personality.
 */

type BrandPersonalityType = 'energetic' | 'professional' | 'friendly' | 'luxury'

interface CampaignEmailInput {
  content: {
    title: string
    description: string
    link: string
  }
  image?: {
    url: string
    personality: BrandPersonalityType
    model?: string
    cost?: number
  }
  business: {
    name: string
    primaryColor: string
  }
}

interface CampaignEmailOutput {
  subject: string
  html: string
  metadata: {
    personality: BrandPersonalityType
    generatedWith?: string
    cost?: number
  }
}

const personalityConfig: Record<BrandPersonalityType, { subject: (t: string, b: string) => string; greeting: string; cta: string; emoji: string }> = {
  energetic: {
    subject: (t, b) => `🔥 ${t} - ${b}`,
    greeting: 'Hey there!',
    cta: "Let's Go!",
    emoji: '⚡',
  },
  professional: {
    subject: (t, b) => `${t} | ${b}`,
    greeting: 'Hello,',
    cta: 'Learn More',
    emoji: '💼',
  },
  friendly: {
    subject: (t, b) => `${t} 😊 - ${b}`,
    greeting: 'Hi friend!',
    cta: 'Check It Out',
    emoji: '👋',
  },
  luxury: {
    subject: (t, b) => `Exclusive: ${t}`,
    greeting: 'Dear Valued Client,',
    cta: 'Discover More',
    emoji: '✨',
  },
}

export function generateCampaignEmail(input: CampaignEmailInput): CampaignEmailOutput {
  const personality = input.image?.personality ?? 'professional'
  const cfg = personalityConfig[personality]
  const { content, business } = input
  const btnColor = business.primaryColor || '#0d9488'

  const subject = cfg.subject(content.title, business.name)

  const imageBlock = input.image
    ? `<tr><td><img src="${input.image.url}" alt="${content.title}" style="width:100%;height:auto;display:block;" /></td></tr>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
${imageBlock}
<tr><td style="padding:30px 20px;">
<p style="margin:0 0 20px;font-size:16px;color:#374151;">${cfg.greeting}</p>
<h1 style="margin:0 0 15px;font-size:28px;font-weight:700;color:#111827;">${cfg.emoji} ${content.title}</h1>
<p style="margin:0 0 25px;font-size:16px;line-height:1.6;color:#4B5563;">${content.description}</p>
<table cellpadding="0" cellspacing="0"><tr>
<td style="border-radius:8px;background-color:${btnColor};">
<a href="${content.link}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">${cfg.cta}</a>
</td>
</tr></table>
</td></tr>
<tr><td style="padding:20px;text-align:center;border-top:1px solid #E5E7EB;">
<p style="margin:0;font-size:12px;color:#9CA3AF;">${business.name}</p>
</td></tr>
</table>
</body>
</html>`

  return {
    subject,
    html,
    metadata: {
      personality,
      generatedWith: input.image?.model,
      cost: input.image?.cost,
    },
  }
}
