/**
 * Professional stock images for blog posts (Unsplash).
 * Each slug maps to a high-quality image that fits the post's message.
 * URL format: w=1200 for consistent display, q=80 for quality.
 */
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&fit=crop`

export const BLOG_STOCK_IMAGES: Record<string, string> = {
  // Local SEO & Google
  the_ultimate_guide_to_optimizing_your_google_business_profile: U('1507676182492-cea01146efc6'),
  is_your_google_business_profile_hurting_your_local_sales: U('1556742049-0cfed4f6a45d'),
  how_local_businesses_can_dominate_google_maps_in_2024: U('1563013544-824ae1b704d3'),
  demystifying_local_search_results_a_handbook_for_smb_owners: U('1507676182492-cea01146efc6'),
  increase_foot_traffic_google_maps_local_pack: U('1563013544-824ae1b704d3'),
  claiming_your_local_online_presence_essential_steps_for_smbs: U('1441986300917-64674bd600d8'),
  beat_competitors_locally_advanced_strategies_for_google_rankings: U('1557804506-669a67965ba3'),
  beyond_your_address_advanced_local_seo_tactics_for_smbs: U('1517248135467-4c7edcad34c4'),
  why_your_small_business_needs_local_citations: U('1495474472287-4d71bcdd2085'),
  step_by_step_local_seo_checklist_for_businesses: U('1556742049-0cfed4f6a45d'),
  a_step_by_step_local_seo_checklist_for_businesses: U('1556742049-0cfed4f6a45d'),
  driving_foot_traffic_online_digital_strategies_for_brick_and_mortar_success: U('1563013544-824ae1b704d3'),

  // Marketing & community
  simple_email_marketing_strategies_for_local_businesses_that_convert: U('1557804506-669a67965ba3'),
  how_to_get_5_star_reviews_and_boost_your_local_reputation_today: U('1495474472287-4d71bcdd2085'),
  leveraging_local_events_turn_community_engagement_into_customers: U('1540575467063-499b5d98d753'),
  building_unbreakable_customer_loyalty_in_your_local_market: U('1552664730-d307ca844978'),
  word_of_mouth_marketing_rekindle_the_oldest_growth_hack_for_smbs: U('1557804506-669a67965ba3'),
  local_partnerships_collaborations_that_drive_mutual_business_growth: U('1542744173-8e7e53415bb6'),
  personalized_marketing_for_smbs_reaching_your_true_local_audience: U('1522071820081-0090120127c2'),
  creating_engaging_local_promotions_that_sell: U('1563013544-824ae1b704d3'),
  seasonal_marketing_campaigns_ideas_for_local_businesses_all_year_round: U('1495474472287-4d71bcdd2085'),
  hyperlocal_marketing_connecting_with_your_neighbors: U('1441986300917-64674bd600d8'),
  direct_mail_still_works_creative_strategies_for_local_businesses: U('1557804506-669a67965ba3'),
  forge_a_strong_local_brand_identity_in_the_digital_age: U('1517248135467-4c7edcad34c4'),
  '10_budget_friendly_marketing_ideas_for_local_business': U('1563013544-824ae1b704d3'),

  // AI & content
  unlock_content_superpowers_how_ai_transforms_local_business_blogs: U('1522071820081-0090120127c2'),
  writing_articles_that_rank_ai_assisted_seo_for_smbs: U('1507676182492-cea01146efc6'),
  generate_ideas_faster_ai_tools_for_local_business_content_brainstorming: U('1556761175-4b46a572b786'),
  beyond_text_using_ai_for_visual_and_video_content_for_smbs: U('1507676182492-cea01146efc6'),
  personalize_at_scale_ai_powered_content_for_your_local_community: U('1522071820081-0090120127c2'),
  content_strategy_simplified_building_a_6_month_plan_with_ai: U('1507676182492-cea01146efc6'),
  solving_the_content_consistency_crisis_with_ai_for_small_businesses: U('1556761175-4b46a572b786'),
  social_media_gold_auto_generate_engaging_posts_with_ai: U('1611162617474-5b21e879e113'),
  from_zero_to_published_your_first_ai_assisted_blog_post_guide: U('1507676182492-cea01146efc6'),
  ethical_ai_content_how_local_businesses_ensure_authenticity: U('1522071820081-0090120127c2'),
  saving_time_and_money_the_roi_of_ai_in_local_content_creation: U('1460925895917-afdab827c52f'),
  ai_for_busy_business_owners_crafting_content_in_minutes_not_hours: U('1507676182492-cea01146efc6'),
  the_essential_digital_toolkit_for_every_growing_small_business: U('1556761175-b413da4baf72'),

  // Business growth & data
  understand_your_local_customer_base_with_data_driven_insights: U('1460925895917-afdab827c52f'),
  the_power_of_local_data_making_smarter_business_decisions: U('1460925895917-afdab827c52f'),
  when_to_scale_investing_in_digital_marketing_for_local_business_growth: U('1542744173-8e7e53415bb6'),
  customer_journey_mapping_optimizing_your_local_buyer_s_path: U('1552664730-d307ca844978'),
  small_business_automation_tools_to_streamline_your_operations: U('1556761175-b413da4baf72'),
  subscription_models_for_smbs_building_recurring_local_revenue: U('1557804506-669a67965ba3'),
  future_proofing_your_local_business_adapting_to_digital_trends: U('1522071820081-0090120127c2'),
  e_commerce_for_local_shops_setting_up_your_online_storefront: U('1556742049-0cfed4f6a45d'),
  digital_payment_solutions_modernizing_your_local_business_transactions: U('1556742049-0cfed4f6a45d'),
}

export function getStockImageForSlug(slug: string): string | null {
  return BLOG_STOCK_IMAGES[slug] ?? null
}
