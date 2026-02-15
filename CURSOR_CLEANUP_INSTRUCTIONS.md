# CURSOR IMPLEMENTATION INSTRUCTIONS - Application Cleanup & Updates
## Phase 2: Remove Deprecated Features & Simplify UI

**Objective:** Clean up the application to match the new automated image generation system  
**Timeline:** 3 weeks of systematic updates  
**Priority:** HIGH - Improves user experience dramatically

---

## 🎯 YOUR MISSION

You've successfully implemented the new brand-aware image generation system. Now you need to **remove all the manual complexity** from the rest of the application since images are generated automatically.

**Core Principle:** The new system is 90% automated, so remove 60% of the manual controls from the UI.

---

## 📖 REQUIRED READING FIRST

Before making ANY changes, read these files in order:

1. **`/docs/APPLICATION_UPDATES_REQUIRED.md`**
   - Complete guide to all changes needed
   - Component-by-component breakdown
   - Database schema updates

2. **`/docs/QUICK_ACTION_SUMMARY.md`**
   - Quick reference for what to keep/delete
   - Priority checklist

---

## 🚀 IMPLEMENTATION PHASES

### **PHASE 1: BRANDING PAGE SIMPLIFICATION (Week 1, Day 1-2)**

#### Task 1.1: Simplify Branding Page UI

**File to update:** Find and update the branding page (likely `/app/dashboard/branding/page.tsx` or similar)

**WHAT TO KEEP (Only these 5 things):**
```typescript
interface SimplifiedBrandingData {
  // Essential fields
  primaryColor: string;        // ✅ KEEP - Used for personality detection
  secondaryColor?: string;     // ✅ KEEP - Optional variety
  businessName: string;        // ✅ KEEP - Appears on images
  industry: string;            // ✅ KEEP - Determines focal points
  
  // Optional fields
  logo?: File;                 // ✅ KEEP - For profile only, NOT for images
  tagline?: string;            // ✅ KEEP - Marketing copy
  description?: string;        // ✅ KEEP - Context
}
```

**WHAT TO DELETE (Remove these completely):**
```typescript
// ❌ DELETE all of these from the interface and UI:
frameStyle?: string;
tintColor?: string;
overlayOpacity?: number;
logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
borderWidth?: number;
borderColor?: string;
shadowEffect?: boolean;
customFrameOptions?: any;
```

**UI Components to REMOVE:**
- Remove `<FrameSelector />` component entirely
- Remove `<TintAdjuster />` component entirely
- Remove `<LogoPositioner />` component entirely
- Remove `<OverlayEditor />` component entirely
- Remove any opacity sliders
- Remove border style pickers
- Remove shadow effect toggles

**What the simplified branding page should look like:**

```tsx
export default function BrandingPage() {
  const [brandData, setBrandData] = useState<SimplifiedBrandingData>({
    primaryColor: '#000000',
    secondaryColor: '',
    businessName: '',
    industry: '',
  });

  return (
    <div className="branding-page">
      <h1>Your Brand Identity</h1>
      <p>We'll automatically match images to your brand</p>
      
      {/* SECTION 1: Brand Colors */}
      <section className="brand-colors">
        <h2>Brand Colors</h2>
        
        <ColorPicker
          label="Primary Color"
          value={brandData.primaryColor}
          onChange={(color) => setBrandData({ ...brandData, primaryColor: color })}
          hint="Main brand color - used for text bars and lighting"
        />
        
        <ColorPicker
          label="Secondary Color (Optional)"
          value={brandData.secondaryColor}
          onChange={(color) => setBrandData({ ...brandData, secondaryColor: color })}
          hint="Complementary color for variety"
        />
        
        {/* NEW: Show brand personality preview */}
        <BrandPersonalityPreview 
          primaryColor={brandData.primaryColor}
          secondaryColor={brandData.secondaryColor}
        />
      </section>
      
      {/* SECTION 2: Business Info */}
      <section className="business-info">
        <h2>Business Information</h2>
        
        <Input
          label="Business Name"
          value={brandData.businessName}
          onChange={(name) => setBrandData({ ...brandData, businessName: name })}
          hint="Appears on generated images"
        />
        
        <Select
          label="Industry"
          value={brandData.industry}
          options={industryOptions}
          onChange={(industry) => setBrandData({ ...brandData, industry })}
          hint="Helps us create relevant imagery"
        />
      </section>
      
      {/* SECTION 3: Optional Branding */}
      <section className="optional-branding">
        <h2>Additional Branding (Optional)</h2>
        
        <FileUpload
          label="Logo"
          accept="image/*"
          hint="Used for your profile, not for generated images"
          onChange={(file) => setBrandData({ ...brandData, logo: file })}
        />
        
        <Input
          label="Tagline"
          value={brandData.tagline}
          onChange={(tagline) => setBrandData({ ...brandData, tagline })}
          hint="Appears in marketing materials"
        />
      </section>
      
      <Button onClick={saveBranding}>Save Brand Settings</Button>
    </div>
  );
}
```

#### Task 1.2: Create Brand Personality Preview Component

**New file:** `/app/dashboard/branding/components/BrandPersonalityPreview.tsx`

```tsx
'use client';

import { detectBrandPersonality } from '@/lib/branding/personality-detection';

interface BrandPersonalityPreviewProps {
  primaryColor: string;
  secondaryColor?: string;
}

export function BrandPersonalityPreview({ 
  primaryColor, 
  secondaryColor 
}: BrandPersonalityPreviewProps) {
  if (!primaryColor || primaryColor === '#000000') {
    return null;
  }
  
  const personality = detectBrandPersonality(primaryColor, secondaryColor);
  
  const icons = {
    energetic: '⚡',
    professional: '💼',
    friendly: '😊',
    luxury: '✨'
  };
  
  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icons[personality.personality]}</span>
        <h3 className="font-semibold text-lg capitalize">
          {personality.personality} Brand
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        <strong>Mood:</strong> {personality.mood}
      </p>
      
      <div className="space-y-1 text-xs text-gray-500">
        <p>
          <strong>Colors:</strong> {personality.colorDescription}
        </p>
        <p>
          <strong>Lighting:</strong> {personality.lightingStyle}
        </p>
      </div>
      
      <p className="mt-3 text-sm text-blue-600">
        💡 We'll automatically create images with this vibe
      </p>
    </div>
  );
}
```

---

### **PHASE 2: IMAGE GENERATION PAGE CLEANUP (Week 1, Day 3-4)**

#### Task 2.1: Remove Step 3 Customization UI

**File to update:** Find the image generation component (likely `/app/dashboard/content/components/ImageGenerator.tsx` or similar)

**BEFORE (Complex with Step 3):**
```tsx
// ❌ OLD - Has manual customization step
Step 1: Write content
Step 2: Generate image  
Step 3: Customize image (ADD LOGO, PICK FRAME, ADJUST TINT, ETC.) ← DELETE THIS
Step 4: Publish
```

**AFTER (Simple):**
```tsx
// ✅ NEW - Automatic, no customization needed
Step 1: Write content
Step 2: Generate image (with optional product photo upload)
Step 3: Publish (just regenerate if needed)
```

**Components to DELETE entirely:**
- `<ImageCustomizer />` - Remove this entire component
- `<LogoUploadStep />` - Remove this
- `<FrameSelectionStep />` - Remove this
- `<TintAdjustmentStep />` - Remove this
- `<TextPositioningStep />` - Remove this

**Replace with simplified version:**

```tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ImageGeneratorProps {
  content: Content;
  business: Business;
}

export function ImageGenerator({ content, business }: ImageGeneratorProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{
    cost: number;
    personality: string;
    model: string;
  } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Convert product image to base64 if provided
      let productImageBase64 = null;
      if (productImage) {
        productImageBase64 = await fileToBase64(productImage);
      }
      
      const response = await fetch('/api/content/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: content.title,
          businessName: business.name,
          industry: business.industry,
          brandColors: {
            primary: business.primaryColor,
            secondary: business.secondaryColor
          },
          productImage: productImageBase64,
          addTextOverlay: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.url);
        setMetadata({
          cost: data.cost,
          personality: data.personality,
          model: data.model
        });
        toast.success('Image generated successfully!');
      } else {
        toast.error('Generation failed: ' + data.error);
      }
    } catch (error) {
      toast.error('Failed to generate image');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="image-generator space-y-6">
      {/* Product Photo Upload (Optional) */}
      <div className="product-upload border-2 border-dashed rounded-lg p-6">
        <h3 className="font-semibold mb-2">
          Have a product photo? (Optional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          📸 Best results: Clean background, good lighting, product fills frame
        </p>
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProductImage(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        
        {productImage && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(productImage)}
              alt="Product preview"
              className="max-w-xs rounded"
            />
            <button
              onClick={() => setProductImage(null)}
              className="text-sm text-red-600 mt-2"
            >
              Remove photo
            </button>
          </div>
        )}
      </div>

      {/* Generated Image or Generate Button */}
      {generatedImage ? (
        <div className="generated-preview">
          <img
            src={generatedImage}
            alt="Generated"
            className="w-full rounded-lg shadow-lg"
          />
          
          {metadata && (
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {metadata.personality} vibe
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                ${metadata.cost.toFixed(3)}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                {metadata.model === 'sdxl' ? 'Cost-optimized' : 'High quality'}
              </span>
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGenerate}
              className="btn-secondary"
              disabled={isGenerating}
            >
              🔄 Regenerate
            </button>
            
            <a
              href={generatedImage}
              download="generated-image.jpg"
              className="btn-secondary"
            >
              ⬇️ Download
            </a>
            
            <button
              onClick={() => {/* Handle publish */}}
              className="btn-primary flex-1"
            >
              ✅ Use This Image
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary btn-lg"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>✨ Generate Brand-Matched Image</>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            We'll create an image that matches your brand automatically
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

### **PHASE 3: DATABASE SCHEMA UPDATES (Week 1, Day 5)**

#### Task 3.1: Create Database Migration

**New file:** `/supabase/migrations/[timestamp]_update_images_schema.sql`

```sql
-- Add new columns for image generation metadata
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS model_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS generation_cost DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS generation_time INTEGER,
ADD COLUMN IF NOT EXISTS brand_personality VARCHAR(20),
ADD COLUMN IF NOT EXISTS has_product_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_removal_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5, 2);

-- Remove deprecated columns
ALTER TABLE images 
DROP COLUMN IF EXISTS frame_style,
DROP COLUMN IF EXISTS tint_color,
DROP COLUMN IF EXISTS overlay_opacity,
DROP COLUMN IF EXISTS logo_position,
DROP COLUMN IF EXISTS border_width,
DROP COLUMN IF EXISTS border_color,
DROP COLUMN IF EXISTS shadow_effect;

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_images_model_cost 
ON images(model_used, generation_cost);

CREATE INDEX IF NOT EXISTS idx_images_personality 
ON images(brand_personality);

CREATE INDEX IF NOT EXISTS idx_images_created_at 
ON images(created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN images.model_used IS 'AI model used: sdxl or dalle3';
COMMENT ON COLUMN images.generation_cost IS 'Cost in USD';
COMMENT ON COLUMN images.brand_personality IS 'Detected brand personality: energetic, professional, friendly, luxury';
```

#### Task 3.2: Update TypeScript Types

**File to update:** `/types/database.ts` or wherever your types are defined

```typescript
// Update the Image type
export interface Image {
  id: string;
  url: string;
  contentId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // NEW: Generation metadata
  modelUsed: 'sdxl' | 'dalle3' | null;
  generationCost: number | null;
  generationTime: number | null;
  brandPersonality: 'energetic' | 'professional' | 'friendly' | 'luxury' | null;
  hasProductImage: boolean;
  backgroundRemovalMethod: 'free' | 'paid' | 'none' | null;
  qualityScore: number | null;
  
  // REMOVED (delete these if they exist):
  // frameStyle?: string;
  // tintColor?: string;
  // overlayOpacity?: number;
  // logoPosition?: string;
}

// Update the branding type
export interface BusinessBranding {
  id: string;
  businessId: string;
  
  // KEEP these
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  businessName: string;
  industry: string;
  logo?: string;
  tagline?: string;
  description?: string;
  
  // REMOVE these (delete if they exist):
  // frameStyle?: string;
  // tintColor?: string;
  // overlayOpacity?: number;
  // logoPosition?: string;
  // borderWidth?: number;
  // borderColor?: string;
}
```

---

### **PHASE 4: DELETE DEPRECATED FILES (Week 1, Day 5)**

#### Task 4.1: Delete Component Files

**Delete these files entirely (if they exist):**

```bash
# Image editing components
/components/image-editor/FrameSelector.tsx
/components/image-editor/FrameSelector.jsx
/components/image-editor/TintAdjuster.tsx
/components/image-editor/TintAdjuster.jsx
/components/image-editor/LogoPositioner.tsx
/components/image-editor/LogoPositioner.jsx
/components/image-editor/OverlayEditor.tsx
/components/image-editor/OverlayEditor.jsx
/components/image-editor/BorderStylePicker.tsx
/components/image-editor/ShadowEffectControl.tsx
/components/image-editor/OpacitySlider.tsx

# If there's an entire image-editor directory with no other files, delete it
/components/image-editor/

# Utility functions for old system
/lib/image-processing/frame-generator.ts
/lib/image-processing/tint-overlay.ts
/lib/image-processing/logo-placement.ts
/lib/image-processing/border-effects.ts

# Old API routes
/app/api/image/add-frame/route.ts
/app/api/image/add-tint/route.ts
/app/api/image/position-logo/route.ts
/app/api/image/composite/route.ts
/app/api/image/branding-recommendation/route.ts
/app/api/image/upload-overlay/route.ts
```

**How to safely delete:**
1. First, search your codebase for imports of these files
2. Remove all imports/references
3. Then delete the files
4. Run TypeScript check: `npm run type-check`
5. Fix any remaining errors

---

### **PHASE 5: UPDATE ANALYTICS (Week 2, Day 1-2)**

#### Task 5.1: Create Cost Tracking Widget

**New file:** `/app/admin/analytics/components/CostTrackingWidget.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

interface CostAnalytics {
  totalCost: number;
  costPerImage: number;
  sdxlCost: number;
  dalle3Cost: number;
  backgroundRemovalCost: number;
  modelUsageRatio: {
    sdxl: number;
    dalle3: number;
  };
  timeSaved: number;
}

export function CostTrackingWidget() {
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics/costs')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading cost analytics...</div>;
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  return (
    <div className="widget bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Image Generation Costs</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Metric
          label="Total This Month"
          value={`$${analytics.totalCost.toFixed(2)}`}
          trend="-14%"
          trendPositive
        />
        
        <Metric
          label="Avg Per Image"
          value={`$${analytics.costPerImage.toFixed(3)}`}
        />
        
        <Metric
          label="SDXL Usage"
          value={`${analytics.modelUsageRatio.sdxl}%`}
          subtitle="Cost-optimized"
        />
        
        <Metric
          label="Time Saved"
          value={`${analytics.timeSaved} hrs`}
          subtitle="vs manual editing"
        />
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Cost Breakdown</h4>
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between">
            <span>SDXL generation:</span>
            <span className="font-mono">${analytics.sdxlCost.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>DALL-E generation:</span>
            <span className="font-mono">${analytics.dalle3Cost.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Background removal:</span>
            <span className="font-mono">${analytics.backgroundRemovalCost.toFixed(2)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Metric({ 
  label, 
  value, 
  subtitle, 
  trend, 
  trendPositive 
}: { 
  label: string; 
  value: string; 
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      {trend && (
        <p className={`text-xs ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}
```

#### Task 5.2: Create API Endpoint for Cost Analytics

**New file:** `/app/api/admin/analytics/costs/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  // Get current month's images with cost data
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data: images, error } = await supabase
    .from('images')
    .select('model_used, generation_cost, background_removal_method, created_at')
    .gte('created_at', startOfMonth.toISOString());
  
  if (error || !images) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
  
  // Calculate metrics
  const totalCost = images.reduce((sum, img) => sum + (img.generation_cost || 0), 0);
  const costPerImage = images.length > 0 ? totalCost / images.length : 0;
  
  const sdxlImages = images.filter(img => img.model_used === 'sdxl');
  const dalle3Images = images.filter(img => img.model_used === 'dalle3');
  
  const sdxlCost = sdxlImages.reduce((sum, img) => sum + (img.generation_cost || 0), 0);
  const dalle3Cost = dalle3Images.reduce((sum, img) => sum + (img.generation_cost || 0), 0);
  
  const paidRemovalImages = images.filter(img => img.background_removal_method === 'paid');
  const backgroundRemovalCost = paidRemovalImages.length * 0.20; // $0.20 per paid removal
  
  // Estimate time saved (6 minutes manual editing vs 0.5 minutes automated)
  const timeSaved = images.length * 5.5 / 60; // hours
  
  return NextResponse.json({
    totalCost,
    costPerImage,
    sdxlCost,
    dalle3Cost,
    backgroundRemovalCost,
    modelUsageRatio: {
      sdxl: images.length > 0 ? (sdxlImages.length / images.length * 100) : 0,
      dalle3: images.length > 0 ? (dalle3Images.length / images.length * 100) : 0
    },
    timeSaved: Math.round(timeSaved)
  });
}
```

---

### **PHASE 6: UPDATE IMAGE RATING SYSTEM (Week 2, Day 3-4)**

#### Task 6.1: Update Rating Criteria

**File to update:** `/lib/rating/image-quality.ts` or similar

Replace old rating system with new criteria:

```typescript
import sharp from 'sharp';
import { hexToHSL } from '@/lib/branding/personality-detection';

export interface ImageQualityRating {
  // Brand integration
  brandColorMatch: number;        // 0-100
  brandPersonalityFit: number;    // 0-100
  
  // Composition
  focalPointClarity: number;      // 0-100
  compositionBalance: number;     // 0-100
  
  // Technical
  imageSharpness: number;         // 0-100
  lightingQuality: number;        // 0-100
  
  // Text
  textReadability: number;        // 0-100
  textContrast: number;           // 0-100
  
  // Overall
  overallScore: number;           // Weighted average
}

export async function rateImageQuality(
  imageUrl: string,
  brandPrimaryColor: string,
  brandPersonality: string
): Promise<ImageQualityRating> {
  // Fetch image
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  
  // Analyze different aspects
  const brandColorMatch = await analyzeBrandColorMatch(imageBuffer, brandPrimaryColor);
  const focalPointClarity = await analyzeFocalPointClarity(imageBuffer);
  const textContrast = await analyzeTextContrast(imageBuffer);
  
  // Calculate overall score (weighted)
  const overallScore = (
    brandColorMatch * 0.25 +
    focalPointClarity * 0.30 +
    textContrast * 0.20 +
    75 * 0.25  // Default scores for other metrics
  );
  
  return {
    brandColorMatch,
    brandPersonalityFit: 80, // Placeholder - would need ML model
    focalPointClarity,
    compositionBalance: 75, // Placeholder
    imageSharpness: 85, // Placeholder
    lightingQuality: 80, // Placeholder
    textReadability: textContrast,
    textContrast,
    overallScore
  };
}

async function analyzeBrandColorMatch(
  imageBuffer: Buffer,
  brandPrimaryColor: string
): Promise<number> {
  // Get dominant colors from image
  const { dominant } = await sharp(imageBuffer).stats();
  
  // Convert to HSL
  const brandHSL = hexToHSL(brandPrimaryColor);
  const imageHSL = {
    h: 0, // Would calculate from RGB
    s: 0,
    l: 0
  };
  
  // Calculate color distance (simplified)
  const hueDistance = Math.abs(brandHSL.h - imageHSL.h);
  
  // Score: 100 = perfect match, 0 = opposite colors
  return Math.max(0, 100 - hueDistance / 3.6);
}

async function analyzeFocalPointClarity(
  imageBuffer: Buffer
): Promise<number> {
  // Use edge detection to find focal areas
  const edges = await sharp(imageBuffer)
    .greyscale()
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
    })
    .raw()
    .toBuffer();
  
  // Calculate edge concentration (simplified)
  // High concentration = clear focal point
  const edgeSum = edges.reduce((sum, val) => sum + val, 0);
  const avgEdge = edgeSum / edges.length;
  
  // Score based on edge concentration
  return Math.min(100, avgEdge * 2);
}

async function analyzeTextContrast(
  imageBuffer: Buffer
): Promise<number> {
  // Sample bottom portion where text typically appears
  const metadata = await sharp(imageBuffer).metadata();
  const height = metadata.height || 1024;
  
  const bottomSection = await sharp(imageBuffer)
    .extract({
      left: 0,
      top: Math.floor(height * 0.8),
      width: metadata.width || 1024,
      height: Math.floor(height * 0.2)
    })
    .greyscale()
    .raw()
    .toBuffer();
  
  // Calculate contrast (simplified)
  const avg = bottomSection.reduce((sum, val) => sum + val, 0) / bottomSection.length;
  
  // Good contrast if very dark or very light (text bar area)
  const contrastScore = avg < 50 || avg > 200 ? 90 : 60;
  
  return contrastScore;
}
```

---

### **PHASE 7: UPDATE EMAIL TEMPLATES (Week 2, Day 5)**

#### Task 7.1: Create Personality-Aware Email Template

**File to update:** `/lib/email/templates/campaign-email.tsx`

```typescript
interface EmailTemplateProps {
  content: {
    title: string;
    description: string;
    link: string;
  };
  imageData: {
    url: string;
    personality: 'energetic' | 'professional' | 'friendly' | 'luxury';
    cost: number;
    model: string;
  };
  business: {
    name: string;
    primaryColor: string;
  };
}

export function generateCampaignEmail({
  content,
  imageData,
  business
}: EmailTemplateProps) {
  const personalityConfig = {
    energetic: {
      subject: `🔥 ${content.title} - ${business.name}`,
      greeting: "Hey there!",
      ctaText: "Let's Go!",
      emoji: "⚡"
    },
    professional: {
      subject: `${content.title} | ${business.name}`,
      greeting: "Hello,",
      ctaText: "Learn More",
      emoji: "💼"
    },
    friendly: {
      subject: `${content.title} 😊 - ${business.name}`,
      greeting: "Hi friend!",
      ctaText: "Check It Out",
      emoji: "👋"
    },
    luxury: {
      subject: `Exclusive: ${content.title}`,
      greeting: "Dear Valued Client,",
      ctaText: "Discover More",
      emoji: "✨"
    }
  };
  
  const config = personalityConfig[imageData.personality];
  
  return {
    subject: config.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
            <tr>
              <td>
                <!-- Brand-matched image -->
                <img 
                  src="${imageData.url}" 
                  alt="${content.title}"
                  style="width: 100%; height: auto; display: block;"
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 20px;">
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                  ${config.greeting}
                </p>
                
                <!-- Title -->
                <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #111827;">
                  ${config.emoji} ${content.title}
                </h1>
                
                <!-- Description -->
                <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #4B5563;">
                  ${content.description}
                </p>
                
                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 8px; background-color: ${business.primaryColor};">
                      <a 
                        href="${content.link}"
                        style="
                          display: inline-block;
                          padding: 14px 28px;
                          color: #ffffff;
                          text-decoration: none;
                          font-weight: 600;
                          font-size: 16px;
                        "
                      >
                        ${config.ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                  ${business.name}
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    metadata: {
      personality: imageData.personality,
      generatedWith: imageData.model,
      cost: imageData.cost
    }
  };
}
```

---

## 🧪 TESTING CHECKLIST

After completing each phase, test the following:

### Phase 1 Testing (Branding Page):
- [ ] Branding page loads without errors
- [ ] Can set primary and secondary colors
- [ ] Brand personality preview appears
- [ ] Can save branding settings
- [ ] Old controls (frame, tint, etc.) are gone
- [ ] No TypeScript errors

### Phase 2 Testing (Image Generation):
- [ ] Can generate image without product photo
- [ ] Can generate image with product photo
- [ ] Regenerate button works
- [ ] Download button works
- [ ] Cost and personality display correctly
- [ ] No Step 3 customization UI present
- [ ] No TypeScript errors

### Phase 3 Testing (Database):
- [ ] Migration runs successfully
- [ ] New columns exist in database
- [ ] Old columns are removed
- [ ] Indexes are created
- [ ] Can insert/query images with new schema

### Phase 4 Testing (File Deletion):
- [ ] Deleted files don't exist
- [ ] No broken imports
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Application runs without crashes

### Phase 5 Testing (Analytics):
- [ ] Cost tracking widget displays
- [ ] Data loads correctly
- [ ] Metrics are accurate
- [ ] API endpoint returns valid data

### Phase 6 Testing (Rating):
- [ ] Image quality rating works
- [ ] Brand color match calculates
- [ ] Focal point clarity calculates
- [ ] Overall score is reasonable

### Phase 7 Testing (Email):
- [ ] Email templates generate correctly
- [ ] Personality affects subject/tone
- [ ] Images display in email
- [ ] CTA buttons work

---

## 🚨 IMPORTANT NOTES

### Before You Start:
1. **Create a git branch:** `git checkout -b cleanup-deprecated-features`
2. **Backup database:** Create a backup before running migrations
3. **Test locally first:** Don't deploy to production until fully tested

### While Working:
1. **Commit frequently:** After each phase completion
2. **Test incrementally:** Test after each task
3. **Document issues:** Create `CLEANUP_ISSUES.md` if you encounter problems
4. **Ask for help:** If stuck, document what's blocking you

### Red Flags to Watch For:
- ⚠️ TypeScript errors after deleting files → Fix imports
- ⚠️ Build failures → Check for missing dependencies
- ⚠️ Database errors → Verify migration syntax
- ⚠️ UI not rendering → Check component paths
- ⚠️ API errors → Verify new schema matches code

---

## 📊 SUCCESS CRITERIA

You've succeeded when:

### User-Facing:
- ✅ Branding page has only 5-7 inputs (not 15+)
- ✅ Image generation is one-click (no Step 3)
- ✅ Brand personality shows automatically
- ✅ No manual logo/frame/tint controls anywhere

### Technical:
- ✅ Database schema updated
- ✅ All deprecated files deleted
- ✅ TypeScript compiles with no errors
- ✅ Build succeeds: `npm run build`
- ✅ All tests pass

### Analytics:
- ✅ Cost tracking shows real data
- ✅ Model usage percentages display
- ✅ Quality ratings work

### Overall:
- ✅ Application feels simpler to use
- ✅ No broken functionality
- ✅ Performance same or better

---

## 🎯 FINAL DELIVERABLE

When complete, create: `/docs/CLEANUP_COMPLETE.md`

Include:
- ✅ What was simplified
- ✅ What was deleted
- ✅ What was updated
- ✅ Test results
- ⚠️ Any issues encountered
- 🔜 Remaining work (if any)

---

**START WITH PHASE 1 AND WORK SYSTEMATICALLY. TEST AFTER EACH PHASE. GOOD LUCK!** 🚀
