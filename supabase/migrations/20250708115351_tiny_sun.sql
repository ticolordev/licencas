/*
  # Fix Microsoft 365 RLS Policies

  1. Security Updates
    - Drop existing policies that may be incorrectly configured
    - Create new comprehensive policies for microsoft365_pools table
    - Create new comprehensive policies for microsoft365_users table
    - Ensure all CRUD operations work for authenticated users

  2. Policy Details
    - Allow authenticated users to perform all operations (SELECT, INSERT, UPDATE, DELETE)
    - Use proper policy syntax for each operation type
    - Ensure WITH CHECK clauses are properly set for INSERT and UPDATE operations
*/

-- Drop existing policies for microsoft365_pools
DROP POLICY IF EXISTS "Usuários autenticados podem ver pools Microsoft 365" ON microsoft365_pools;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir pools Microsoft 365" ON microsoft365_pools;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar pools Microsoft 365" ON microsoft365_pools;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar pools Microsoft 365" ON microsoft365_pools;

-- Create new comprehensive policies for microsoft365_pools
CREATE POLICY "Enable read access for authenticated users"
  ON microsoft365_pools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON microsoft365_pools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON microsoft365_pools
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON microsoft365_pools
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies for microsoft365_users
DROP POLICY IF EXISTS "Usuários autenticados podem ver usuários Microsoft 365" ON microsoft365_users;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir usuários Microsoft 365" ON microsoft365_users;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar usuários Microsoft 365" ON microsoft365_users;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar usuários Microsoft 365" ON microsoft365_users;

-- Create new comprehensive policies for microsoft365_users
CREATE POLICY "Enable read access for authenticated users"
  ON microsoft365_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON microsoft365_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON microsoft365_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON microsoft365_users
  FOR DELETE
  TO authenticated
  USING (true);