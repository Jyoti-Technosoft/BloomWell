-- Add doctor_id field to evaluations table
-- This will allow us to assign evaluations to specific doctors

ALTER TABLE evaluations 
ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(255) REFERENCES users(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_doctor_id ON evaluations(doctor_id);

-- Add index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);

-- Update existing evaluations to have a default doctor (for migration)
-- This is a temporary measure - existing evaluations will be assigned to the first available doctor
UPDATE evaluations 
SET doctor_id = (
  SELECT u.id 
  FROM users u 
  WHERE u.role = 'doctor' 
  LIMIT 1
) 
WHERE doctor_id IS NULL;

-- Add comment explaining the new field
COMMENT ON COLUMN evaluations.doctor_id IS 'ID of the doctor assigned to review this evaluation';
