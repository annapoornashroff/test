-- Forever N Co. Database Schema Creation Script
-- Run this script in your PostgreSQL database to create all required tables

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================================
-- WEDDINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS weddings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    is_date_fixed BOOLEAN DEFAULT FALSE,
    duration INTEGER DEFAULT 2,
    events JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    estimated_guests INTEGER DEFAULT 100,
    actual_guests INTEGER,
    budget DECIMAL(12, 2) NOT NULL,
    spent DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'planning',
    family_details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for weddings table
CREATE INDEX IF NOT EXISTS idx_weddings_user_id ON weddings(user_id);
CREATE INDEX IF NOT EXISTS idx_weddings_date ON weddings(date);
CREATE INDEX IF NOT EXISTS idx_weddings_status ON weddings(status);
CREATE INDEX IF NOT EXISTS idx_weddings_location ON weddings(location);

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    price_min DECIMAL(12, 2),
    price_max DECIMAL(12, 2),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    availability JSONB DEFAULT '[]'::jsonb,
    services JSONB DEFAULT '[]'::jsonb,
    portfolio JSONB DEFAULT '[]'::jsonb,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    contact_website VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for vendors table
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(location);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_is_featured ON vendors(is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating);
CREATE INDEX IF NOT EXISTS idx_vendors_price_range ON vendors(price_min, price_max);

-- ============================================================================
-- PACKAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    discount_percentage INTEGER DEFAULT 0,
    duration VARCHAR(50),
    includes JSONB DEFAULT '[]'::jsonb,
    vendors JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT FALSE,
    is_customizable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for packages table
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_is_popular ON packages(is_popular);
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);

-- ============================================================================
-- CART_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'wishlisted',
    visit_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for cart_items table
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_wedding_id ON cart_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_vendor_id ON cart_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_status ON cart_items(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_category ON cart_items(category);

-- ============================================================================
-- GUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    relationship VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Family',
    confirmation_status VARCHAR(50) DEFAULT 'pending',
    invitation_sent BOOLEAN DEFAULT FALSE,
    invitation_sent_at TIMESTAMP,
    response_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for guests table
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_confirmation_status ON guests(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);
CREATE INDEX IF NOT EXISTS idx_guests_phone_number ON guests(phone_number);

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    image_url VARCHAR(500),
    wedding_date TIMESTAMP NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for testimonials table
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_wedding_date ON testimonials(wedding_date);

-- ============================================================================
-- ADDITIONAL CONSTRAINTS AND CHECKS
-- ============================================================================

-- Add check constraints for data validation
ALTER TABLE users ADD CONSTRAINT chk_users_phone_format 
    CHECK (phone_number ~ '^\+[1-9]\d{1,14}$');

ALTER TABLE weddings ADD CONSTRAINT chk_weddings_budget_positive 
    CHECK (budget > 0);

ALTER TABLE weddings ADD CONSTRAINT chk_weddings_spent_non_negative 
    CHECK (spent >= 0);

ALTER TABLE weddings ADD CONSTRAINT chk_weddings_duration_positive 
    CHECK (duration > 0);

ALTER TABLE vendors ADD CONSTRAINT chk_vendors_rating_range 
    CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE vendors ADD CONSTRAINT chk_vendors_price_range 
    CHECK (price_min >= 0 AND (price_max IS NULL OR price_max >= price_min));

ALTER TABLE packages ADD CONSTRAINT chk_packages_price_positive 
    CHECK (price > 0);

ALTER TABLE packages ADD CONSTRAINT chk_packages_discount_range 
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

ALTER TABLE cart_items ADD CONSTRAINT chk_cart_items_price_positive 
    CHECK (price > 0);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at 
    BEFORE UPDATE ON weddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at 
    BEFORE UPDATE ON packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at 
    BEFORE UPDATE ON guests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- ============================================================================

-- Insert sample vendors
INSERT INTO vendors (name, category, location, description, price_min, price_max, rating, review_count, contact_phone, contact_email, is_featured, images, services, portfolio) VALUES
('Royal Photography Studio', 'Photography', 'Mumbai', 'Professional wedding photography with cinematic style', 50000, 200000, 4.8, 156, '+91 98765 43210', 'info@royalphotography.com', TRUE, 
 '["https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg"]'::jsonb,
 '["Wedding Photography", "Pre-wedding Shoot", "Candid Photography"]'::jsonb,
 '["https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg"]'::jsonb),

('Spice Garden Catering', 'Catering', 'Delhi', 'Multi-cuisine catering with authentic Indian flavors', 800, 1500, 4.9, 203, '+91 87654 32109', 'orders@spicegarden.com', TRUE,
 '["https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg"]'::jsonb,
 '["Indian Cuisine", "Continental", "Live Counters"]'::jsonb,
 '[]'::jsonb),

('Elegant Decorators', 'Decoration', 'Bangalore', 'Theme-based wedding decorations and floral arrangements', 100000, 500000, 4.7, 89, '+91 76543 21098', 'info@elegantdecorators.com', FALSE,
 '["https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg"]'::jsonb,
 '["Theme Decoration", "Floral Arrangements", "Lighting"]'::jsonb,
 '[]'::jsonb),

('Melody Makers', 'Music & DJ', 'Mumbai', 'Professional DJ services and live music arrangements', 25000, 75000, 4.6, 134, '+91 98765 43211', 'info@melodymakers.com', FALSE,
 '["https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg"]'::jsonb,
 '["DJ Services", "Live Music", "Sound System"]'::jsonb,
 '[]'::jsonb),

('Glamour Studio', 'Makeup', 'Chennai', 'Professional bridal makeup and hair styling', 15000, 50000, 4.8, 167, '+91 98765 43212', 'info@glamourstudio.com', FALSE,
 '["https://images.pexels.com/photos/1444443/pexels-photo-1444443.jpeg"]'::jsonb,
 '["Bridal Makeup", "Hair Styling", "Pre-wedding Makeup"]'::jsonb,
 '[]'::jsonb),

('Grand Palace Venues', 'Venues', 'Jaipur', 'Luxury wedding venues with traditional architecture', 200000, 1000000, 4.9, 98, '+91 98765 43213', 'bookings@grandpalace.com', TRUE,
 '["https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg"]'::jsonb,
 '["Wedding Halls", "Garden Venues", "Heritage Properties"]'::jsonb,
 '[]'::jsonb);

-- Insert sample packages
INSERT INTO packages (name, description, price, original_price, discount_percentage, duration, is_popular, image_url, includes, vendors) VALUES
('Royal Wedding Package', 'A luxurious wedding experience with premium vendors', 500000, 700000, 29, '3 Days', TRUE, 
 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
 '["Premium Venue Booking", "Professional Photography & Videography", "Luxury Catering (250 guests)", "Theme-based Decoration", "Bridal Makeup & Hair", "DJ & Sound System", "Wedding Coordination"]'::jsonb,
 '[{"category": "Photography", "vendor_name": "Royal Photography Studio", "vendor_id": 1}, {"category": "Catering", "vendor_name": "Spice Garden Catering", "vendor_id": 2}]'::jsonb),

('Intimate Wedding Package', 'Perfect for smaller, intimate wedding celebrations', 250000, 350000, 29, '2 Days', FALSE,
 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg',
 '["Boutique Venue", "Professional Photography", "Catering for 100 guests", "Floral Decoration", "Bridal Makeup", "Music System", "Basic Coordination"]'::jsonb,
 '[]'::jsonb);

-- Insert sample testimonials
INSERT INTO testimonials (name, location, rating, comment, wedding_date, image_url, is_featured) VALUES
('Priya & Arjun', 'Mumbai', 5, 'Forever N Co made our dream wedding come true! The seamless planning and attention to detail was incredible. Every vendor was perfectly coordinated.', '2024-02-14', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg', TRUE),

('Sneha & Vikram', 'Delhi', 5, 'The e-commerce experience was game-changing! We could plan everything online and track our progress. No stress, just pure joy on our wedding day.', '2024-01-20', 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg', TRUE),

('Kavya & Rohit', 'Bangalore', 5, 'Outstanding service! The team handled everything from vendor coordination to last-minute changes. Our families were amazed by the flawless execution.', '2024-03-10', 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg', TRUE);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table creation
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify sample data
SELECT 'vendors' as table_name, COUNT(*) as record_count FROM vendors
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Forever N Co. database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, weddings, vendors, packages, cart_items, guests, testimonials';
    RAISE NOTICE '🔗 Foreign key relationships established';
    RAISE NOTICE '📈 Indexes created for optimal performance';
    RAISE NOTICE '🛡️ Data validation constraints added';
    RAISE NOTICE '⏰ Auto-update triggers configured';
    RAISE NOTICE '🌱 Sample data inserted for development';
    RAISE NOTICE '🚀 Database is ready for the Forever N Co. application!';
END $$;