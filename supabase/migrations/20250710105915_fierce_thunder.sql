/*
  # Corrigir políticas RLS para todas as tabelas

  1. Políticas RLS para microsoft365_users
    - Permitir todas as operações para usuários autenticados e anônimos
  
  2. Políticas RLS para license_pools  
    - Permitir todas as operações para usuários autenticados e anônimos
    
  3. Políticas RLS para license_assignments
    - Permitir todas as operações para usuários autenticados e anônimos
    
  4. Políticas RLS para legacy_licenses
    - Permitir todas as operações para usuários autenticados e anônimos
*/

-- Políticas para microsoft365_users
DO $$
BEGIN
  -- Verificar se a política para usuários autenticados já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'microsoft365_users' 
    AND policyname = 'authenticated_users_full_access_microsoft365_users'
  ) THEN
    CREATE POLICY "authenticated_users_full_access_microsoft365_users"
      ON microsoft365_users
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Verificar se a política para usuários anônimos já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'microsoft365_users' 
    AND policyname = 'anon_users_full_access_microsoft365_users'
  ) THEN
    CREATE POLICY "anon_users_full_access_microsoft365_users"
      ON microsoft365_users
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para license_pools
DO $$
BEGIN
  -- Verificar se a política para usuários autenticados já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'license_pools' 
    AND policyname = 'authenticated_users_full_access_license_pools'
  ) THEN
    CREATE POLICY "authenticated_users_full_access_license_pools"
      ON license_pools
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Verificar se a política para usuários anônimos já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'license_pools' 
    AND policyname = 'anon_users_full_access_license_pools'
  ) THEN
    CREATE POLICY "anon_users_full_access_license_pools"
      ON license_pools
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para license_assignments
DO $$
BEGIN
  -- Verificar se a política para usuários autenticados já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'license_assignments' 
    AND policyname = 'authenticated_users_full_access_license_assignments'
  ) THEN
    CREATE POLICY "authenticated_users_full_access_license_assignments"
      ON license_assignments
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Verificar se a política para usuários anônimos já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'license_assignments' 
    AND policyname = 'anon_users_full_access_license_assignments'
  ) THEN
    CREATE POLICY "anon_users_full_access_license_assignments"
      ON license_assignments
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para legacy_licenses
DO $$
BEGIN
  -- Verificar se a política para usuários autenticados já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'legacy_licenses' 
    AND policyname = 'authenticated_users_full_access_legacy_licenses'
  ) THEN
    CREATE POLICY "authenticated_users_full_access_legacy_licenses"
      ON legacy_licenses
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Verificar se a política para usuários anônimos já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'legacy_licenses' 
    AND policyname = 'anon_users_full_access_legacy_licenses'
  ) THEN
    CREATE POLICY "anon_users_full_access_legacy_licenses"
      ON legacy_licenses
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;