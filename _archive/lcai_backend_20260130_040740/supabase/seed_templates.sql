-- Seed Default Templates for LocalContent.ai
-- Run this in Supabase SQL Editor after creating tables

-- Create a system user for default templates (use a fixed UUID)
-- This user owns all default templates
DO $$
BEGIN
  -- Insert default templates with a placeholder system user
  -- These will be marked as is_public = true so all users can access them
  
  -- ============================================
  -- BLOG TEMPLATES
  -- ============================================
  
  INSERT INTO public.templates (
    id, name, description, content_type, category, 
    prompt_template, variables, example_output, 
    is_public, usage_count, created_by
  ) VALUES 
  
  -- Local Service Highlight
  (
    gen_random_uuid(),
    'Local Service Spotlight',
    'Highlight a specific service you offer with local relevance',
    'blog',
    'services',
    'Write a blog post highlighting our {{service_name}} service. Focus on how it benefits {{target_audience}} in {{location}}. Include why locals choose us and a call to action.',
    '["service_name", "target_audience", "location"]',
    '{"title": "Why [Location] Residents Trust Us for [Service]", "body": "When it comes to [service] in [location]..."}',
    true,
    0,
    NULL
  ),
  
  -- Seasonal Content
  (
    gen_random_uuid(),
    'Seasonal Tips & Advice',
    'Timely content tied to seasons or holidays',
    'blog',
    'seasonal',
    'Write a helpful blog post about {{topic}} tips for {{season}}. Include practical advice for {{target_audience}} in our local area. Make it actionable and shareable.',
    '["topic", "season", "target_audience"]',
    '{"title": "Essential [Season] [Topic] Tips for Homeowners", "body": "As [season] approaches..."}',
    true,
    0,
    NULL
  ),
  
  -- Customer Success Story
  (
    gen_random_uuid(),
    'Customer Success Story',
    'Share a customer win (without naming them)',
    'blog',
    'testimonials',
    'Write a blog post about a recent success story. A {{customer_type}} came to us with {{problem}}. Describe how we solved it with {{solution}} and the results they achieved. Keep it anonymous but relatable.',
    '["customer_type", "problem", "solution"]',
    '{"title": "How We Helped a Local [Customer Type] Overcome [Problem]", "body": "Recently, we had the pleasure of helping..."}',
    true,
    0,
    NULL
  ),
  
  -- FAQ Deep Dive
  (
    gen_random_uuid(),
    'FAQ Deep Dive',
    'Turn a common question into helpful content',
    'blog',
    'educational',
    'Write an in-depth blog post answering the question: "{{question}}". Provide thorough, helpful information for {{target_audience}}. Include related tips and when to seek professional help.',
    '["question", "target_audience"]',
    '{"title": "[Question]? Here''s What You Need to Know", "body": "One of the most common questions we receive is..."}',
    true,
    0,
    NULL
  ),
  
  -- Behind the Scenes
  (
    gen_random_uuid(),
    'Behind the Scenes',
    'Show the human side of your business',
    'blog',
    'brand',
    'Write a friendly behind-the-scenes blog post about {{topic}}. Share insights about our team, process, or values. Make readers feel connected to our business.',
    '["topic"]',
    '{"title": "Behind the Scenes: [Topic]", "body": "Ever wondered what goes on behind the scenes at..."}',
    true,
    0,
    NULL
  ),

  -- ============================================
  -- SOCIAL MEDIA TEMPLATES
  -- ============================================
  
  -- Quick Tip
  (
    gen_random_uuid(),
    'Quick Tip Post',
    'Share a helpful tip in a social-friendly format',
    'social',
    'tips',
    'Create a short, engaging social media post sharing a quick tip about {{topic}}. Make it actionable and end with engagement (question or CTA). Keep under 280 characters for the main text.',
    '["topic"]',
    '{"title": "Quick Tip", "body": "Pro tip: [tip]! 💡 Have you tried this? Let us know in the comments!", "hashtags": ["ProTip", "LocalBusiness"]}',
    true,
    0,
    NULL
  ),
  
  -- Before/After
  (
    gen_random_uuid(),
    'Before & After Showcase',
    'Show transformation results',
    'social',
    'showcase',
    'Write social media copy for a before/after post showing {{transformation}}. Express pride in the work and invite engagement. Include relevant hashtags.',
    '["transformation"]',
    '{"title": "Transformation Tuesday", "body": "What a difference! 🔄 Swipe to see the transformation. Ready for your own? Link in bio!", "hashtags": ["BeforeAndAfter", "TransformationTuesday"]}',
    true,
    0,
    NULL
  ),
  
  -- Team Spotlight
  (
    gen_random_uuid(),
    'Team Member Spotlight',
    'Introduce a team member',
    'social',
    'team',
    'Create a warm social media post introducing {{team_member_role}}. Share something interesting about them (without getting too personal). Make the business feel human and approachable.',
    '["team_member_role"]',
    '{"title": "Meet the Team", "body": "Meet our amazing [role]! 👋 Fun fact: [fact]. We''re grateful to have them on our team!", "hashtags": ["MeetTheTeam", "SmallBusiness"]}',
    true,
    0,
    NULL
  ),
  
  -- Local Love
  (
    gen_random_uuid(),
    'Local Community Post',
    'Show love for your local community',
    'social',
    'community',
    'Write a social post celebrating something local - could be {{local_topic}} like a local event, landmark, or community achievement. Show your business is part of the community fabric.',
    '["local_topic"]',
    '{"title": "Local Love", "body": "We love being part of this amazing community! 🏘️ [Local topic] reminds us why we do what we do.", "hashtags": ["SupportLocal", "CommunityLove"]}',
    true,
    0,
    NULL
  ),
  
  -- Special Offer
  (
    gen_random_uuid(),
    'Limited Time Offer',
    'Promote a special deal or offer',
    'social',
    'promotional',
    'Create an engaging social post for our {{offer_type}} offer: {{offer_details}}. Create urgency without being pushy. Include clear CTA.',
    '["offer_type", "offer_details"]',
    '{"title": "Special Offer", "body": "🎉 [Offer type] ALERT! [Details]. Don''t miss out - offer ends [date]! DM us or click the link in bio.", "hashtags": ["SpecialOffer", "LimitedTime"]}',
    true,
    0,
    NULL
  ),

  -- ============================================
  -- GOOGLE BUSINESS PROFILE TEMPLATES
  -- ============================================
  
  -- What's New Update
  (
    gen_random_uuid(),
    'Business Update Post',
    'Share news or updates about your business',
    'gmb',
    'updates',
    'Write a Google Business Profile post about {{update_topic}}. Keep it professional but friendly. Under 1500 characters. Include a clear call to action.',
    '["update_topic"]',
    '{"title": "Exciting News!", "body": "We''re excited to share [update]. This means [benefit for customers]. Stop by or give us a call to learn more!", "callToAction": "Learn more"}',
    true,
    0,
    NULL
  ),
  
  -- Event Announcement
  (
    gen_random_uuid(),
    'Event Announcement',
    'Promote an upcoming event',
    'gmb',
    'events',
    'Create a Google Business post announcing our {{event_name}} on {{event_date}}. Include key details and encourage attendance/participation.',
    '["event_name", "event_date"]',
    '{"title": "Join Us!", "body": "Mark your calendars! 📅 [Event name] is happening on [date]. [Details]. We''d love to see you there!", "callToAction": "Sign up"}',
    true,
    0,
    NULL
  ),
  
  -- Offer Post
  (
    gen_random_uuid(),
    'GMB Offer Post',
    'Promote a special offer on Google',
    'gmb',
    'offers',
    'Write a Google Business offer post for {{offer_description}}. Valid until {{end_date}}. Make it compelling and include terms if needed.',
    '["offer_description", "end_date"]',
    '{"title": "Special Offer", "body": "For a limited time: [offer]. Valid through [date]. Mention this post when you visit!", "callToAction": "Get offer"}',
    true,
    0,
    NULL
  ),
  
  -- Service Highlight
  (
    gen_random_uuid(),
    'Service Highlight Post',
    'Feature a specific service on GMB',
    'gmb',
    'services',
    'Create a Google Business post highlighting our {{service_name}} service. Explain the benefit and why customers should choose us.',
    '["service_name"]',
    '{"title": "Featured Service", "body": "Looking for quality [service]? We''ve got you covered! Our team provides [benefit]. Book your appointment today.", "callToAction": "Book now"}',
    true,
    0,
    NULL
  ),

  -- ============================================
  -- EMAIL TEMPLATES
  -- ============================================
  
  -- Welcome Email
  (
    gen_random_uuid(),
    'New Customer Welcome',
    'Welcome a new customer',
    'email',
    'onboarding',
    'Write a warm welcome email for a new {{customer_type}} customer. Thank them for choosing us, set expectations, and provide next steps.',
    '["customer_type"]',
    '{"title": "Welcome to [Business Name]!", "body": "Dear [Name],\n\nThank you for choosing us for your [service] needs..."}',
    true,
    0,
    NULL
  ),
  
  -- Follow-up Email
  (
    gen_random_uuid(),
    'Service Follow-up',
    'Follow up after providing a service',
    'email',
    'follow-up',
    'Write a follow-up email for a customer who recently received {{service_type}}. Check on their satisfaction and invite feedback.',
    '["service_type"]',
    '{"title": "How Was Your Experience?", "body": "Hi [Name],\n\nWe hope you''re enjoying your [service]. We wanted to check in and see if everything met your expectations..."}',
    true,
    0,
    NULL
  ),
  
  -- Re-engagement Email
  (
    gen_random_uuid(),
    'We Miss You',
    'Re-engage inactive customers',
    'email',
    'retention',
    'Write a friendly re-engagement email for customers who haven''t visited in a while. Remind them of our value and give them a reason to return. Optionally include {{special_offer}}.',
    '["special_offer"]',
    '{"title": "We Miss You!", "body": "Hi [Name],\n\nIt''s been a while since we''ve seen you, and we wanted to reach out..."}',
    true,
    0,
    NULL
  ),
  
  -- Review Request
  (
    gen_random_uuid(),
    'Review Request',
    'Ask for a review after positive experience',
    'email',
    'reviews',
    'Write a polite email asking a satisfied customer to leave a review. Reference their recent {{service_type}} and make it easy for them.',
    '["service_type"]',
    '{"title": "Quick Favor?", "body": "Hi [Name],\n\nThank you again for trusting us with your [service]. If you have a moment, we''d be incredibly grateful if you could share your experience..."}',
    true,
    0,
    NULL
  )
  
  ON CONFLICT DO NOTHING;
  
END $$;

-- Create index for faster template queries
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_content_type ON public.templates(content_type);
