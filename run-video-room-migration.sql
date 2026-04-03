-- Manual Migration Script for missing columns
-- Run this manually in your PostgreSQL database to add missing columns

-- Add video_room_url column to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS video_room_url VARCHAR(500);

-- Add updated_at column if it doesn't exist
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance  
CREATE INDEX IF NOT EXISTS idx_consultations_video_room_url ON consultations(video_room_url);
CREATE INDEX IF NOT EXISTS idx_consultations_updated_at ON consultations(updated_at);

-- Add comments to document the column purposes
COMMENT ON COLUMN consultations.video_room_url IS 'URL for the video consultation room (Daily.co)';
COMMENT ON COLUMN consultations.updated_at IS 'Timestamp when the consultation was last updated';
