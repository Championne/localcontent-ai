/**
 * Generate Static Example Content
 * 
 * Run this script ONCE to generate 3 real AI content examples for the demo page.
 * Copy the output and share it so it can be hardcoded.
 * 
 * Usage:
 *   node scripts/generate-example-content.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('\n❌ Error: OPENAI_API_KEY not set\n');
  console.log('Run with:');
  console.log('  $env:OPENAI_API_KEY="sk-..."; node scripts/generate-example-content.js\n');
  process.exit(1);
}

async function generateContent(systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.choices[0].message.content;
}

async function main() {
  console.log('\n🎨 GeoSpark Example Content Generator\n');
  console.log('Generating 3 real AI content examples...\n');
  console.log('='.repeat(60) + '\n');

  // 1. Blog Post - Restaurant
  console.log('📝 BLOG POST (Restaurant - Farm-to-Table)\n');
  try {
    const blogContent = await generateContent(
      `You are an expert content writer specializing in SEO-optimized blog posts for local businesses.
Your writing is engaging, informative, and naturally incorporates local SEO best practices.
Write in a conversational yet professional tone that builds trust with local customers.
Include relevant headers (using markdown ##), bullet points, and a clear call-to-action.
Focus on providing genuine value while subtly promoting the business.
Do NOT use placeholder text like [City] or [Name] - write complete content.`,
      `**Business Name:** Harvest Kitchen
**Industry:** Restaurant
**Location:** Austin, TX
**Topic:** Farm-to-Table Spring Menu Launch

Write a comprehensive, SEO-optimized blog post (400-500 words) that:
- Has an engaging, keyword-rich title
- Opens with a hook that addresses the reader's needs
- Includes 2-3 main sections with descriptive headers (##)
- Provides actionable tips, insights, or valuable information
- Naturally mentions the business name 2-3 times
- Ends with a clear call-to-action`
    );
    console.log(blogContent);
    console.log('\n' + '-'.repeat(60) + '\n');
  } catch (e) {
    console.error('Error:', e.message);
  }

  // 2. Google Business Post - Fitness
  console.log('📍 GOOGLE BUSINESS POST (Fitness - Personal Training)\n');
  try {
    const gmbContent = await generateContent(
      `You are a Google Business Profile expert for local businesses.
Write punchy, action-driving posts that convert local searchers into customers.
Remember: People searching on Google Maps are ready to buy - be direct!
Use 2-3 emojis max. Keep it scannable. Focus on benefits.
Do NOT use placeholder text - write complete content.`,
      `**Business Name:** Iron Peak Gym
**Industry:** Fitness / Gym
**Location:** Denver, CO
**Topic:** Free Personal Training Session Offer

Write a Google Business Profile UPDATE post (150-200 characters) that:
- Opens with a compelling benefit or hook
- Creates urgency or excitement
- Tells them exactly what to do next
- Uses 2-3 emojis strategically
- Is direct and benefit-focused`
    );
    console.log(gmbContent);
    console.log('\n' + '-'.repeat(60) + '\n');
  } catch (e) {
    console.error('Error:', e.message);
  }

  // 3. Email Newsletter - Real Estate
  console.log('📧 EMAIL NEWSLETTER (Real Estate - Market Update)\n');
  try {
    const emailContent = await generateContent(
      `You are an email marketing specialist for local businesses.
Write compelling emails that nurture customer relationships and drive action.
Use a warm, personal tone while maintaining professionalism.
Structure: Subject line, greeting, valuable content, clear CTA.
Keep emails scannable with short paragraphs and bullet points where appropriate.
Do NOT use placeholder text like [First Name] - use "Hi there" instead.`,
      `**Business Name:** Westside Realty
**Industry:** Real Estate
**Location:** Seattle, WA
**Topic:** February Housing Market Update

Write a marketing email that includes:

**Subject Line:** (compelling, 40-60 characters, creates curiosity)

**Email Body:**
- Personalized greeting (use "Hi there")
- Opening that connects with the reader
- 2-3 paragraphs of valuable content about the current market
- Key insights or tips (use bullet points)
- Clear, actionable CTA
- Warm sign-off from "The Westside Realty Team"

Keep the total body around 200-250 words. Make it scannable and ready to send.`
    );
    console.log(emailContent);
    console.log('\n' + '-'.repeat(60) + '\n');
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('='.repeat(60));
  console.log('\n✨ Done! Copy the content above and share it.\n');
}

main().catch(console.error);
