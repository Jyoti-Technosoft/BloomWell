-- Add video_room_url column to consultations table
-- This column will store the Daily.co room URL for video consultations

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS video_room_url VARCHAR(500);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_video_room_url ON consultations(video_room_url);

-- Add comment to document the column purpose
COMMENT ON COLUMN consultations.video_room_url IS 'URL for the video consultation room (Daily.co)';
