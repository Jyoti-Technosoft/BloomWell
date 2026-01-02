-- Grant permissions to bloomwell_user
-- Run this as a PostgreSQL superuser (like postgres)

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO bloomwell_user;

-- Grant create permission on schema
GRANT CREATE ON SCHEMA public TO bloomwell_user;

-- Grant permissions on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bloomwell_user;

-- Grant permissions on all existing sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bloomwell_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bloomwell_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bloomwell_user;
