-- Add doctor_id field to evaluations table for doctor assignment
-- Migration: 007_add_doctor_assignment.sql

-- Add doctor_id column to evaluations table
ALTER TABLE evaluations 
ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(255);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_doctor_id 
ON evaluations(doctor_id);

-- Simple assignment: Assign all existing evaluations to first verified doctor
-- This is a temporary solution for testing
UPDATE evaluations 
SET doctor_id = (
  SELECT u.id 
  FROM users u 
  JOIN doctor_profiles dp ON u.id = dp.user_id 
  WHERE u.role = 'doctor' 
  AND dp.is_verified = true 
  ORDER BY u.created_at ASC 
  LIMIT 1
)
WHERE doctor_id IS NULL;

-- Log assignment
DO $$
BEGIN
  RAISE NOTICE 'Doctor assignment completed';
  RAISE NOTICE 'Total evaluations updated: %', (
    SELECT COUNT(*) FROM evaluations WHERE doctor_id IS NOT NULL
  );
  RAISE NOTICE 'Unassigned evaluations remaining: %', (
    SELECT COUNT(*) FROM evaluations WHERE doctor_id IS NULL
  );
END $$;
