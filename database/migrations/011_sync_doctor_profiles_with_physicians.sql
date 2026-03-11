-- Update doctor_profiles table to match physicians table structure
-- Migration: 011_sync_doctor_profiles_with_physicians.sql

-- Add role column to match physicians table
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(100);

-- Update all doctor profiles with role from physicians table
UPDATE doctor_profiles dp
SET role = p.role
FROM physicians p
WHERE dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Update specialties to match physicians table format
UPDATE doctor_profiles dp
SET specialties = p.specialties
FROM physicians p
WHERE dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Update professional_role to match physicians role if it's null or empty
UPDATE doctor_profiles dp
SET professional_role = p.role
FROM physicians p
WHERE (dp.professional_role IS NULL OR dp.professional_role = '')
AND dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Update education to match physicians education if it's null or generic
UPDATE doctor_profiles dp
SET education = p.education
FROM physicians p
WHERE (dp.education IS NULL OR dp.education = 'MD from Medical School, Board Certified')
AND dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Update work_experience to match physicians bio if it's null or generic
UPDATE doctor_profiles dp
SET work_experience = p.bio
FROM physicians p
WHERE (dp.work_experience IS NULL OR dp.work_experience = 'Extensive experience')
AND dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Update experience_years based on physicians experience
UPDATE doctor_profiles dp
SET experience_years = 
  CASE 
    WHEN p.experience ~ '\d+' THEN 
      (CAST(SPLIT_PART(SPLIT_PART(p.experience, ' ', 1), '+', 1) AS INTEGER))
    ELSE 5
  END
FROM physicians p
WHERE dp.first_name || ' ' || dp.last_name = REPLACE(p.name, 'Dr. ', '');

-- Simple logging
SELECT 'Doctor profiles synced with physicians table' as status;
