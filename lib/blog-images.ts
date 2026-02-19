/**
 * Blog post hero images.
 * Previously used Unsplash CDN URLs — now cleared.
 * Blog posts fall back to their default state when no image is mapped.
 */

export const BLOG_STOCK_IMAGES: Record<string, string> = {}

export function getStockImageForSlug(_slug: string): string | null {
  return BLOG_STOCK_IMAGES[_slug] ?? null
}
