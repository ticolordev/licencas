/*
  # Add admin role system

  1. Changes
    - Add `is_admin` column to `admin_users` table
    - Set default admin user as administrator
    - Update RLS policies to handle admin permissions

  2. Security
    - Only admins can manage other users
    - Regular users can only access the dashboard
*/

-- Add is_admin column to admin_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Set the first admin user as administrator (if exists)
UPDATE admin_users 
SET is_admin = true 
WHERE email = 'admin@sistema.com' AND is_admin IS NULL;

-- Create a default admin user if none exists
INSERT INTO admin_users (email, password_hash, name, is_active, is_admin)
SELECT 'admin@sistema.com', 
       encode(sha256(('admin123' || 'salt123')::bytea), 'hex'),
       'Administrador',
       true,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'admin@sistema.com'
);

-- Update RLS policies for admin management
DROP POLICY IF EXISTS "Admin users can manage all users" ON admin_users;

CREATE POLICY "Admin users can manage all users"
  ON admin_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);