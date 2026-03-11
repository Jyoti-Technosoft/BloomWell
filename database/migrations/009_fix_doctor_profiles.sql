-- Fix Doctor Profiles - Add Missing Doctor and Correct Names
-- Migration: 009_fix_doctor_profiles.sql

-- Fix Jennifer Davis profile (currently shows as Jennifer Brown)
UPDATE doctor_profiles 
SET first_name = 'Jennifer', last_name = 'Davis'
WHERE email = 'jennifer.davis@bloomwell.com';

-- Add missing David Wilson (Pediatrics)
-- First, check if user exists, if not create it
INSERT INTO users (id, email, password_hash, role, full_name, date_of_birth, phone_number, created_at)
SELECT 
  'doctor_david_wilson_' || EXTRACT(EPOCH FROM NOW())::text,
  'david.wilson@bloomwell.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- Doctor123!
  'doctor',
  'David Wilson',
  '1980-01-15', -- Default date of birth
  '+1 (555) 123-4567',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'david.wilson@bloomwell.com'
);

-- Then create doctor profile
INSERT INTO doctor_profiles (
  user_id, 
  first_name, 
  last_name, 
  specialization,
  license_number,
  license_state,
  license_expiry_date,
  npi_number,
  phone_number,
  email,
  is_verified,
  verification_status,
  created_at
)
SELECT 
  u.id,
  'David',
  'Wilson',
  'Pediatrics',
  'PED123456',
  'CA',
  '2025-12-31', -- Default license expiry
  '9876543210', -- Unique NPI number
  '+1 (555) 123-4567',
  'david.wilson@bloomwell.com',
  true,
  'verified',
  CURRENT_TIMESTAMP
FROM users u
WHERE u.email = 'david.wilson@bloomwell.com'
AND NOT EXISTS (
  SELECT 1 FROM doctor_profiles dp WHERE dp.user_id = u.id
);

-- Update all existing doctors to have proper bloomwell.com emails
UPDATE users 
SET email = REPLACE(email, '@bloomwell.com', '@bloomwell.com')
WHERE role = 'doctor' 
AND email NOT LIKE '%@bloomwell.com';

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Doctor profiles updated successfully';
  
  -- Count doctors
  PERFORM pg_notify('doctor_update', 'Doctor profiles have been updated');
  
  RAISE NOTICE 'Total doctors after update: %', (
    SELECT COUNT(*) FROM doctor_profiles
  );
  
  -- Show updated doctor list
  RAISE NOTICE 'Updated doctors:';
  FOR doctor IN 
    SELECT dp.first_name, dp.last_name, dp.email, dp.specialization 
    FROM doctor_profiles dp
    JOIN users u ON dp.user_id = u.id
    ORDER BY dp.first_name
  LOOP
    RAISE NOTICE '  - % % (%s) - %s', 
      doctor.first_name, 
      doctor.last_name, 
      doctor.email, 
      doctor.specialization;
  END LOOP;
END $$;
