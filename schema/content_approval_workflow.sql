
-- Table for Brands
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Locations (associated with Brands)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    zip_code VARCHAR(20),
    country VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_brand
        FOREIGN KEY(brand_id)
        REFERENCES brands(id)
        ON DELETE CASCADE,
    UNIQUE (brand_id, name) -- Ensure location names are unique per brand
);

-- Table for Localized Content
CREATE TABLE IF NOT EXISTS localized_content (
    id SERIAL PRIMARY KEY,
    brand_id INT NOT NULL,
    location_id INT, -- Can be NULL if content is for the whole brand
    content_type VARCHAR(50) NOT NULL, -- e.g., 'text', 'image', 'video'
    content_data JSONB NOT NULL, -- Actual content, e.g., {'text': '...', 'image_url': '...'}
    generated_by_user_id INT, -- User who generated/submitted the content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected', 'revision_requested'
    published_at TIMESTAMP,
    CONSTRAINT fk_brand_content
        FOREIGN KEY(brand_id)
        REFERENCES brands(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_location_content
        FOREIGN KEY(location_id)
        REFERENCES locations(id)
        ON DELETE SET NULL, -- If a location is deleted, content remains but loses location association
    CONSTRAINT fk_generated_by_user
        FOREIGN KEY(generated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL -- If a user is deleted, content remains but loses generator association
);

-- Table for Content Approval Requests
CREATE TABLE IF NOT EXISTS content_approval_requests (
    id SERIAL PRIMARY KEY,
    localized_content_id INT NOT NULL,
    approver_user_id INT NOT NULL, -- The user designated to approve this content
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected', 'revision_requested'
    approval_date TIMESTAMP,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_localized_content
        FOREIGN KEY(localized_content_id)
        REFERENCES localized_content(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_approver_user
        FOREIGN KEY(approver_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table for User Roles specific to approval workflow (e.g., Brand Manager, Local Owner)
CREATE TABLE IF NOT EXISTS approver_roles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    brand_id INT, -- NULL for global roles, otherwise specific to a brand
    location_id INT, -- NULL for brand-level roles, otherwise specific to a location
    role_name VARCHAR(100) NOT NULL, -- e.g., 'brand_manager', 'local_owner'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_brand_role
        FOREIGN KEY(brand_id)
        REFERENCES brands(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_location_role
        FOREIGN KEY(location_id)
        REFERENCES locations(id)
        ON DELETE CASCADE,
    -- A user can have only one role per brand/location combination
    UNIQUE (user_id, brand_id, location_id, role_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands (name);
CREATE INDEX IF NOT EXISTS idx_locations_brand_id ON locations (brand_id);
CREATE INDEX IF NOT EXISTS idx_localized_content_brand_id ON localized_content (brand_id);
CREATE INDEX IF NOT EXISTS idx_localized_content_location_id ON localized_content (location_id);
CREATE INDEX IF NOT EXISTS idx_localized_content_approval_status ON localized_content (approval_status);
CREATE INDEX IF NOT EXISTS idx_content_approval_requests_localized_content_id ON content_approval_requests (localized_content_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_requests_approver_user_id ON content_approval_requests (approver_user_id);
CREATE INDEX IF NOT EXISTS idx_approver_roles_user_id ON approver_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_approver_roles_brand_id ON approver_roles (brand_id);
CREATE INDEX IF NOT EXISTS idx_approver_roles_location_id ON approver_roles (location_id);
