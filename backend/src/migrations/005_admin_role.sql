-- Add role column to users table (Cocopoy-style DB role check)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Set the admin email's role to 'admin' (configurable in .env ADMIN_EMAIL)
UPDATE users SET role = 'admin' WHERE email = 'admin@yaro.com';

-- Seed the admin user if not exists (run after Supabase Auth user is created)
INSERT INTO users (id, name, email, role)
SELECT id, email, email, 'admin'
FROM auth.users
WHERE email = 'admin@yaro.com'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@yaro.com');
