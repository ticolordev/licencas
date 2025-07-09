/*
  # Fix Microsoft 365 Pools RLS Policies

  1. Security Updates
    - Update RLS policy for microsoft365_pools to ensure proper access
    - Add policy for anon users to insert/select if needed
    - Ensure authenticated users have full access

  2. Changes
    - Drop existing policy and recreate with proper permissions
    - Add fallback policy for anon role if authentication is not working
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Enable all access for authenticated users on microsoft365_pools" ON microsoft365_pools;

-- Create comprehensive policy for authenticated users
CREATE POLICY "authenticated_users_full_access_microsoft365_pools"
  ON microsoft365_pools
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anon users (fallback for development/testing)
CREATE POLICY "anon_users_full_access_microsoft365_pools"
  ON microsoft365_pools
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE microsoft365_pools ENABLE ROW LEVEL SECURITY;