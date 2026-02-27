-- Create appointments table for doctor-patient bookings
-- Migration: 008_create_appointments_table.sql

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id VARCHAR(255) NOT NULL,
  patient_id VARCHAR(255) NOT NULL,
  evaluation_id VARCHAR(255) REFERENCES evaluations(id) ON DELETE SET NULL,
  
  -- Appointment details
  appointment_type VARCHAR(50) DEFAULT 'consultation', -- consultation, follow_up, review
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  
  -- Meeting details
  meeting_link TEXT,
  meeting_type VARCHAR(50) DEFAULT 'video', -- video, phone, in_person
  
  -- Clinical information
  notes TEXT,
  prescription TEXT,
  doctor_notes TEXT,
  
  -- Cancellation details
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_evaluation_id ON appointments(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can see their own appointments
CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (
    doctor_id = current_setting('app.current_user_id', true)
  );

-- Policy: Doctors can create appointments for their patients
CREATE POLICY "Doctors can create appointments" ON appointments
  FOR INSERT WITH CHECK (
    doctor_id = current_setting('app.current_user_id', true)
  );

-- Policy: Doctors can update their appointments
CREATE POLICY "Doctors can update their appointments" ON appointments
  FOR UPDATE USING (
    doctor_id = current_setting('app.current_user_id', true)
  );

-- Policy: Admins can see all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    current_setting('app.current_user_role', true) = 'admin'
  );

-- Create a view for easier querying
CREATE OR REPLACE VIEW appointment_details AS
SELECT 
  a.id,
  a.doctor_id,
  a.patient_id,
  a.evaluation_id,
  a.appointment_type,
  a.status,
  a.scheduled_at,
  a.duration_minutes,
  a.meeting_link,
  a.meeting_type,
  a.notes,
  a.prescription,
  a.doctor_notes,
  a.cancelled_at,
  a.cancellation_reason,
  a.created_at,
  a.updated_at,
  -- Patient information
  u.full_name as patient_name,
  u.email as patient_email,
  u.phone_number as patient_phone,
  -- Doctor information
  dp.first_name as doctor_first_name,
  dp.last_name as doctor_last_name,
  dp.specialization as doctor_specialization,
  -- Evaluation information
  e.medicine_name as evaluation_medicine,
  e.status as evaluation_status
FROM appointments a
LEFT JOIN users u ON a.patient_id = u.id
LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
LEFT JOIN evaluations e ON a.evaluation_id = e.id;

-- Log creation
DO $$
BEGIN
  RAISE NOTICE 'Appointments table created successfully';
END $$;
