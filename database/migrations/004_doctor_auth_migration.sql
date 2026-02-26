-- Doctor Authentication and Role Management Migration
-- This migration adds role-based authentication support for doctors

-- Add role field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin'));

-- Create doctor_profiles table
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    license_state VARCHAR(50) NOT NULL,
    license_expiry_date DATE NOT NULL,
    npi_number VARCHAR(20) UNIQUE, -- National Provider Identifier
    dea_number VARCHAR(20), -- Drug Enforcement Administration number
    phone_number VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    professional_bio TEXT,
    education JSONB, -- Array of education objects
    experience JSONB, -- Array of experience objects
    certifications JSONB, -- Array of certifications
    hospital_affiliations JSONB, -- Array of hospital affiliations
    languages JSONB DEFAULT '["English"]', -- Array of languages spoken
    consultation_fee DECIMAL(10,2),
    availability JSONB, -- Doctor's availability schedule
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB, -- Upload verification documents
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctor_availability table for detailed scheduling
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    consultation_type VARCHAR(20) DEFAULT 'video' CHECK (consultation_type IN ('video', 'in_person', 'both')),
    max_appointments INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctor_specializations table
CREATE TABLE IF NOT EXISTS doctor_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert common specializations
INSERT INTO doctor_specializations (name, description) VALUES
('Obstetrics & Gynecology', 'Specialized care for women''s reproductive health and pregnancy'),
('Family Medicine', 'Comprehensive healthcare for patients of all ages'),
('Internal Medicine', 'Prevention, diagnosis, and treatment of adult diseases'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Psychiatry', 'Diagnosis and treatment of mental, emotional, and behavioral disorders'),
('Dermatology', 'Diagnosis and treatment of skin, hair, and nail conditions')
ON CONFLICT (name) DO NOTHING;

-- Create doctor_specialization_link table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS doctor_specialization_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES doctor_specializations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, specialization_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_license ON doctor_profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verification ON doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specialization_link_doctor ON doctor_specialization_link(doctor_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON doctor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

-- Policies for doctor_profiles
CREATE POLICY "Users can view their own doctor profile" ON doctor_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own doctor profile" ON doctor_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all doctor profiles" ON doctor_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all doctor profiles" ON doctor_profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for doctor_availability
CREATE POLICY "Doctors can manage their own availability" ON doctor_availability
    FOR ALL USING (
        EXISTS (SELECT 1 FROM doctor_profiles dp WHERE dp.id = doctor_id AND dp.user_id = auth.uid())
    );

CREATE POLICY "Users can view doctor availability" ON doctor_availability
    FOR SELECT USING (true); -- Public read access for booking

-- Create a function to check if user is a doctor
CREATE OR REPLACE FUNCTION is_doctor(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = user_uuid AND role = 'doctor'
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get doctor profile by user ID
CREATE OR REPLACE FUNCTION get_doctor_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    specialization VARCHAR,
    license_number VARCHAR,
    license_state VARCHAR,
    license_expiry_date DATE,
    npi_number VARCHAR,
    dea_number VARCHAR,
    phone_number VARCHAR,
    email VARCHAR,
    professional_bio TEXT,
    is_verified BOOLEAN,
    verification_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.id,
        dp.user_id,
        dp.first_name,
        dp.last_name,
        dp.specialization,
        dp.license_number,
        dp.license_state,
        dp.license_expiry_date,
        dp.npi_number,
        dp.dea_number,
        dp.phone_number,
        dp.email,
        dp.professional_bio,
        dp.is_verified,
        dp.verification_status
    FROM doctor_profiles dp
    WHERE dp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
