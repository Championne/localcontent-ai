-- Add generation metadata columns to generated_images
-- Supports the new brand-aware image generation system

ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS model_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS generation_cost DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS brand_personality VARCHAR(20),
ADD COLUMN IF NOT EXISTS has_product_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_removal_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5, 2);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_generated_images_model_cost
ON generated_images(model_used, generation_cost);

CREATE INDEX IF NOT EXISTS idx_generated_images_personality
ON generated_images(brand_personality);

-- Add marketing framework column to generated_texts
ALTER TABLE generated_texts
ADD COLUMN IF NOT EXISTS framework VARCHAR(10),
ADD COLUMN IF NOT EXISTS framework_confidence SMALLINT,
ADD COLUMN IF NOT EXISTS awareness_level VARCHAR(20);

COMMENT ON COLUMN generated_images.model_used IS 'AI model: sdxl or dalle3';
COMMENT ON COLUMN generated_images.generation_cost IS 'Cost in USD';
COMMENT ON COLUMN generated_images.brand_personality IS 'Detected: energetic, professional, friendly, luxury';
COMMENT ON COLUMN generated_texts.framework IS 'Marketing framework used: aida, pas, bab, fab, 4ps';
