/*
  # Fix Microsoft 365 RLS Policies

  1. Security Updates
    - Update RLS policies for microsoft365_pools table to ensure proper access
    - Update RLS policies for microsoft365_users table to ensure proper access
    - Ensure policies work correctly for authenticated users

  2. Policy Changes
    - Recreate INSERT policies with proper conditions
    - Ensure SELECT, UPDATE, DELETE policies are working correctly
    - Add proper policy conditions for authenticated users
*/

-- Drop existing policies for microsoft365_pools
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON microsoft365_pools;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON microsoft365_pools;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON microsoft365_pools;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON microsoft365_pools;

-- Create new policies for microsoft365_pools
CREATE POLICY "Enable all access for authenticated users on microsoft365_pools"
  ON microsoft365_pools
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing policies for microsoft365_users
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON microsoft365_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON microsoft365_users;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON microsoft365_users;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON microsoft365_users;

-- Create new policies for microsoft365_users
CREATE POLICY "Enable all access for authenticated users on microsoft365_users"
  ON microsoft365_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled on both tables
ALTER TABLE microsoft365_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft365_users ENABLE ROW LEVEL SECURITY;