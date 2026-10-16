-- AgriExport Connect Database Schema
-- Version: 1.0.0
-- Database: agriexport_connect

CREATE DATABASE IF NOT EXISTS agriexport_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE agriexport_connect;

-- Disable foreign key checks during schema setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;

DROP TABLE IF EXISTS announcements;

DROP TABLE IF EXISTS export_guides;

DROP TABLE IF EXISTS mandi_prices;

DROP TABLE IF EXISTS complaints;

DROP TABLE IF EXISTS saved_searches;

DROP TABLE IF EXISTS saved_items;

DROP TABLE IF EXISTS notifications;

DROP TABLE IF EXISTS reviews;

DROP TABLE IF EXISTS messages;

DROP TABLE IF EXISTS deal_documents;

DROP TABLE IF EXISTS deal_status_history;

DROP TABLE IF EXISTS deals;

DROP TABLE IF EXISTS offers;

DROP TABLE IF EXISTS buyer_requirements;

DROP TABLE IF EXISTS listing_images;

DROP TABLE IF EXISTS produce_listings;

DROP TABLE IF EXISTS crops;

DROP TABLE IF EXISTS verification_documents;

DROP TABLE IF EXISTS enterprise_profiles;

DROP TABLE IF EXISTS farmer_profiles;

DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM(
        'farmer',
        'enterprise',
        'admin'
    ) NOT NULL,
    name VARCHAR(150) NOT NULL,
    avatar LONGTEXT DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Farmer Profiles
CREATE TABLE farmer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Gujarat',
    land_size VARCHAR(50),
    experience_years INT DEFAULT 5,
    primary_crops JSON,
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_farmer_district (district)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3. Enterprise Profiles
CREATE TABLE enterprise_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    business_type ENUM(
        'Exporter',
        'Trader',
        'Processor',
        'Manufacturer'
    ) DEFAULT 'Exporter',
    gst_number VARCHAR(30),
    iec_number VARCHAR(30),
    city VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Gujarat',
    country VARCHAR(100) DEFAULT 'India',
    countries_exported_to JSON,
    min_order_mt VARCHAR(50) DEFAULT '1 MT',
    website VARCHAR(255),
    established_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_enterprise_city (city),
    INDEX idx_enterprise_gst (gst_number)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4. Verification Documents
CREATE TABLE verification_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doc_type ENUM(
        'aadhar',
        '7_12',
        'gst',
        'iec',
        'apeda',
        'other'
    ) NOT NULL,
    doc_number VARCHAR(100),
    doc_url LONGTEXT NOT NULL,
    status ENUM(
        'pending',
        'verified',
        'rejected'
    ) DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by INT DEFAULT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_doc_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5. Crops Master Table
CREATE TABLE crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    gujarati_name VARCHAR(100),
    scientific_name VARCHAR(100),
    emoji VARCHAR(20) DEFAULT '🌱',
    image_url LONGTEXT,
    default_unit VARCHAR(20) DEFAULT 'kg',
    indicative_price DECIMAL(10, 2) DEFAULT 0.00,
    export_grade VARCHAR(100),
    description TEXT,
    attributes_schema JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 6. Produce Listings (by Farmers)
CREATE TABLE produce_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    crop_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    variety VARCHAR(100),
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    min_order_quantity DECIMAL(10, 2) DEFAULT 1.00,
    location_village VARCHAR(100),
    location_district VARCHAR(100),
    quality_grade VARCHAR(100),
    harvest_date DATE,
    packaging_type VARCHAR(100),
    organic_certified BOOLEAN DEFAULT FALSE,
    lab_tested BOOLEAN DEFAULT FALSE,
    attributes JSON,
    description TEXT,
    status ENUM(
        'active',
        'pending_approval',
        'sold',
        'expired',
        'archived'
    ) DEFAULT 'active',
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE,
    INDEX idx_listings_farmer (farmer_id),
    INDEX idx_listings_crop (crop_id),
    INDEX idx_listings_district (location_district),
    INDEX idx_listings_status (status),
    INDEX idx_listings_price (price_per_unit)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 7. Listing Images
CREATE TABLE listing_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_url LONGTEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES produce_listings (id) ON DELETE CASCADE,
    INDEX idx_listing_images (listing_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 8. Buyer Requirements (Posted by Enterprises)
CREATE TABLE buyer_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enterprise_id INT NOT NULL,
    crop_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'ton',
    min_lot_size VARCHAR(50) DEFAULT '1 MT',
    target_price DECIMAL(10, 2) NOT NULL,
    price_range VARCHAR(100),
    destination VARCHAR(150),
    destination_flag VARCHAR(20) DEFAULT '🌐',
    urgency ENUM(
        'urgent',
        'high-volume',
        'active',
        'standard'
    ) DEFAULT 'active',
    urgency_label VARCHAR(100),
    specs JSON,
    delivery_terms VARCHAR(255),
    payment_terms VARCHAR(255),
    deadline DATE,
    notes TEXT,
    image_url LONGTEXT,
    status ENUM(
        'open',
        'fulfilled',
        'cancelled',
        'expired'
    ) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE,
    INDEX idx_requirements_enterprise (enterprise_id),
    INDEX idx_requirements_crop (crop_id),
    INDEX idx_requirements_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 9. Offers & Quotes (Enterprise -> Farmer, or Farmer -> Enterprise Requirement)
CREATE TABLE offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT DEFAULT NULL,
    requirement_id INT DEFAULT NULL,
    enterprise_id INT NOT NULL,
    farmer_id INT NOT NULL,
    sender_role ENUM('enterprise', 'farmer') NOT NULL,
    offered_price DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    total_amount DECIMAL(14, 2) NOT NULL,
    delivery_terms VARCHAR(255),
    payment_terms VARCHAR(255),
    validity_date DATE,
    delivery_date VARCHAR(100),
    notes TEXT,
    lot_specs JSON,
    status ENUM(
        'new',
        'countered',
        'accepted',
        'rejected',
        'withdrawn'
    ) DEFAULT 'new',
    counter_price DECIMAL(10, 2) DEFAULT NULL,
    counter_notes TEXT,
    countered_by ENUM('enterprise', 'farmer') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES produce_listings (id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES buyer_requirements (id) ON DELETE CASCADE,
    FOREIGN KEY (enterprise_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_offers_enterprise (enterprise_id),
    INDEX idx_offers_farmer (farmer_id),
    INDEX idx_offers_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 10. Deals (Converted from accepted offers)
CREATE TABLE deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_code VARCHAR(50) UNIQUE NOT NULL,
    offer_id INT DEFAULT NULL,
    listing_id INT DEFAULT NULL,
    requirement_id INT DEFAULT NULL,
    farmer_id INT NOT NULL,
    enterprise_id INT NOT NULL,
    crop_id INT NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    agreed_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    advance_amount DECIMAL(14, 2) DEFAULT 0.00,
    payment_terms VARCHAR(255),
    delivery_terms VARCHAR(255),
    status ENUM(
        'deal_signed',
        'advance_paid',
        'inspection',
        'dispatched',
        'delivered',
        'payment_completed',
        'cancelled'
    ) DEFAULT 'deal_signed',
    milestone_progress INT DEFAULT 15,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers (id) ON DELETE SET NULL,
    FOREIGN KEY (listing_id) REFERENCES produce_listings (id) ON DELETE SET NULL,
    FOREIGN KEY (requirement_id) REFERENCES buyer_requirements (id) ON DELETE SET NULL,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (enterprise_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE,
    INDEX idx_deals_farmer (farmer_id),
    INDEX idx_deals_enterprise (enterprise_id),
    INDEX idx_deals_status (status),
    INDEX idx_deals_code (deal_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 11. Deal Status History
CREATE TABLE deal_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    note TEXT,
    updated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_history_deal (deal_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 12. Deal Documents
CREATE TABLE deal_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    doc_type ENUM(
        'contract',
        'lab_report',
        'invoice',
        'bill_of_lading',
        'inspection_cert',
        'payment_receipt',
        'other'
    ) NOT NULL,
    file_url LONGTEXT NOT NULL,
    file_size INT DEFAULT 0,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_docs_deal (deal_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 13. Messages / Chat
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    deal_id INT DEFAULT NULL,
    listing_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    attachment_url LONGTEXT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES produce_listings (id) ON DELETE CASCADE,
    INDEX idx_messages_convo (conversation_id),
    INDEX idx_messages_receiver (receiver_id, is_read)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 14. Reviews & Ratings
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_reviews_reviewee (reviewee_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 15. In-App Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    link VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 16. Saved Items (Bookmarks)
CREATE TABLE saved_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('listing', 'requirement') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_saved (user_id, item_type, item_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 17. Saved Searches
CREATE TABLE saved_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    search_name VARCHAR(100),
    filters JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 18. Complaints & Disputes
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT DEFAULT NULL,
    filed_by INT NOT NULL,
    against_user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'quality',
    status ENUM(
        'open',
        'investigating',
        'resolved',
        'dismissed'
    ) DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
    FOREIGN KEY (filed_by) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (against_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_complaints_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 19. Mandi Prices
CREATE TABLE mandi_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NULL,
    commodity VARCHAR(100),
    variety VARCHAR(100) DEFAULT 'General',
    grade VARCHAR(50) DEFAULT 'FAQ',
    market_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Gujarat',
    modal_price DECIMAL(10, 2) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Quintal',
    arrivals_tonnes DECIMAL(10, 2) DEFAULT 0.00,
    price_date DATE NOT NULL,
    trend ENUM('up', 'down', 'stable') DEFAULT 'stable',
    change_percent DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE,
    INDEX idx_mandi_crop (crop_id),
    INDEX idx_mandi_district (district),
    INDEX idx_mandi_date (price_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 20. Export Guides
CREATE TABLE export_guides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    crop_id INT DEFAULT NULL,
    category VARCHAR(100) NOT NULL,
    summary TEXT,
    content_markdown LONGTEXT,
    document_checklist JSON,
    destination_countries JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE SET NULL,
    INDEX idx_guide_slug (slug),
    INDEX idx_guide_category (category)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 21. Announcements
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role ENUM('all', 'farmer', 'enterprise') DEFAULT 'all',
    is_banner BOOLEAN DEFAULT FALSE,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 22. Activity Logs
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_action (action)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 23. Password Resets
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_resets_identifier (identifier),
    INDEX idx_resets_code (otp_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 24. Referential Integrity Triggers for Polymorphic saved_items
DROP TRIGGER IF EXISTS trg_produce_listings_after_delete;
CREATE TRIGGER trg_produce_listings_after_delete 
AFTER DELETE ON produce_listings 
FOR EACH ROW 
BEGIN 
    DELETE FROM saved_items WHERE item_type = 'listing' AND item_id = OLD.id; 
END;

DROP TRIGGER IF EXISTS trg_buyer_requirements_after_delete;
CREATE TRIGGER trg_buyer_requirements_after_delete 
AFTER DELETE ON buyer_requirements 
FOR EACH ROW 
BEGIN 
    DELETE FROM saved_items WHERE item_type = 'requirement' AND item_id = OLD.id; 
END;