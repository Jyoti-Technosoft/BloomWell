-- Physicians Table with Doctor Authentication Fields
-- This migration creates the physicians table for the public directory
-- Links to doctor_profiles for verified healthcare providers

CREATE TABLE IF NOT EXISTS physicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_state VARCHAR(50) NOT NULL,
    npi_number VARCHAR(20) UNIQUE,
    professional_bio TEXT,
    consultation_fee DECIMAL(10,2),
    languages JSONB DEFAULT '["English"]',
    hospital_affiliations JSONB DEFAULT '[]',
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    years_experience INTEGER,
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_physicians_email ON physicians(email);
CREATE INDEX IF NOT EXISTS idx_physicians_specialization ON physicians(specialization);
CREATE INDEX IF NOT EXISTS idx_physicians_verification_status ON physicians(verification_status);
CREATE INDEX IF NOT EXISTS idx_physicians_rating ON physicians(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_physicians_user_id ON physicians(user_id);

-- Enable Row Level Security
ALTER TABLE physicians ENABLE ROW LEVEL SECURITY;

-- RLS Policies for physicians table
CREATE POLICY "Public read access to verified physicians" ON physicians
    FOR SELECT USING (
        is_verified = TRUE 
        AND verification_status = 'verified'
    );

CREATE POLICY "Physicians can update their own profile" ON physicians
    FOR UPDATE USING (
        user_id IN (
            SELECT dp.user_id 
            FROM doctor_profiles dp 
            WHERE dp.id = physicians.user_id
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_physicians_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_physicians_updated_at
    BEFORE UPDATE ON physicians
    FOR EACH ROW
    EXECUTE FUNCTION update_physicians_updated_at();

-- Insert sample physicians data for testing
INSERT INTO physicians (
    user_id,
    first_name,
    last_name,
    email,
    phone_number,
    specialization,
    license_number,
    license_state,
    npi_number,
    professional_bio,
    consultation_fee,
    languages,
    hospital_affiliations,
    profile_image_url,
    is_verified,
    verification_status,
    average_rating,
    total_reviews,
    years_experience,
    education,
    certifications
) VALUES 
(
    gen_random_uuid(),
    'Sarah',
    'Johnson',
    'sarah.johnson@bloomwell.com',
    '+1 (555) 123-4567',
    'Obstetrics & Gynecology',
    'MD123456',
    'CA',
    '1234567890',
    'Board-certified OB/GYN with over 10 years of experience specializing in women''s health, prenatal care, and minimally invasive gynecological surgery. Passionate about providing personalized care and empowering women through every stage of life.',
    150.00,
    '["English", "Spanish"]',
    '["BloomWell Medical Center", "Women''s Health Hospital"]',
    '/images/physicians/sarah-johnson.jpg',
    true,
    'verified',
    4.8,
    127,
    12,
    '[
        {
            "degree": "Doctor of Medicine",
            "institution": "Harvard Medical School",
            "year": "2010"
        },
        {
            "degree": "Residency in Obstetrics & Gynecology",
            "institution": "Massachusetts General Hospital",
            "year": "2014"
        }
    ]',
    '[
        {
            "name": "Board Certification in Obstetrics & Gynecology",
            "issuer": "American Board of Obstetrics and Gynecology",
            "year": "2015",
            "expiry": "2025"
        },
        {
            "name": "Advanced Cardiac Life Support",
            "issuer": "American Heart Association",
            "year": "2018",
            "expiry": "2024"
        }
    ]'
),
(
    gen_random_uuid(),
    'Michael',
    'Chen',
    'michael.chen@bloomwell.com',
    '+1 (555) 987-6543',
    'Family Medicine',
    'MD789012',
    'NY',
    '9876543210',
    'Experienced family medicine physician dedicated to providing comprehensive primary care. Special interests include preventive care, chronic disease management, and geriatric health.',
    120.00,
    '["English", "Mandarin"]',
    '["Community Health Center"]',
    '/images/physicians/michael-chen.jpg',
    true,
    'verified',
    4.6,
    89,
    8,
    '[
        {
            "degree": "Doctor of Osteopathic Medicine",
            "institution": "New York College of Osteopathic Medicine",
            "year": "2012"
        }
    ]',
    '[
        {
            "name": "Board Certification in Family Medicine",
            "issuer": "American Board of Family Medicine",
            "year": "2014",
            "expiry": "2024"
        }
    ]'
),
(
    gen_random_uuid(),
    'Emily',
    'Rodriguez',
    'emily.rodriguez@bloomwell.com',
    '+1 (555) 456-7890',
    'Internal Medicine',
    'MD345678',
    'TX',
    '1122334455',
    'Internal medicine specialist with expertise in preventive care, women''s health, and chronic disease management. Committed to building long-term patient relationships through compassionate care.',
    135.00,
    '["English"]',
    '["BloomWell Medical Center", "General Hospital"]',
    '/images/physicians/emily-rodriguez.jpg',
    true,
    'verified',
    4.9,
    156,
    15,
    '[
        {
            "degree": "Doctor of Medicine",
            "institution": "University of Texas Southwestern Medical Center",
            "year": "2008"
        },
        {
            "degree": "Residency in Internal Medicine",
            "institution": "Baylor University Medical Center",
            "year": "2011"
        }
    ]',
    '[
        {
            "name": "Board Certification in Internal Medicine",
            "issuer": "American Board of Internal Medicine",
            "year": "2013",
            "expiry": "2023"
        }
    ]'
)
ON CONFLICT (email) DO NOTHING;

-- Create view for public physician directory
CREATE OR REPLACE VIEW public_physicians AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone_number,
    p.specialization,
    p.license_number,
    p.license_state,
    p.professional_bio,
    p.consultation_fee,
    p.languages,
    p.hospital_affiliations,
    p.profile_image_url,
    p.average_rating,
    p.total_reviews,
    p.years_experience,
    p.education,
    p.certifications,
    p.created_at,
    dp.verification_status as doctor_verification_status,
    dp.is_verified as doctor_is_verified
FROM physicians p
LEFT JOIN doctor_profiles dp ON p.user_id = dp.id
WHERE p.is_verified = true AND p.verification_status = 'verified';

-- Grant public access to the view
GRANT SELECT ON public_physicians TO PUBLIC;
