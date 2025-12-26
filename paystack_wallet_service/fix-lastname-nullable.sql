-- Make last_name nullable to support Google accounts without family names
ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;
