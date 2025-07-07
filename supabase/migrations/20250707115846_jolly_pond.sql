/*
  # Create missing database tables

  1. New Tables
    - `license_pools` - Stores license pool information with type constraints
    - `license_assignments` - Stores individual license assignments linked to pools
    - `microsoft365_pools` - Stores Microsoft 365 license pools
    - `microsoft365_users` - Stores Microsoft 365 user assignments
    - `legacy_licenses` - Stores legacy license information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations

  3. Indexes and Constraints
    - Add appropriate indexes for performance
    - Add check constraints for license types
    - Add foreign key relationships
    - Add triggers for updated_at timestamps
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create license_pools table
CREATE TABLE IF NOT EXISTS license_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  total_licenses integer NOT NULL DEFAULT 0,
  assigned_licenses integer NOT NULL DEFAULT 0,
  available_licenses integer NOT NULL DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  expiration_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT license_pools_type_check CHECK (type = ANY (ARRAY['sophos'::text, 'server'::text, 'windows'::text]))
);

-- Create license_assignments table
CREATE TABLE IF NOT EXISTS license_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  pool_id uuid NOT NULL,
  device_name text,
  server_name text,
  user_email text,
  serial_number text,
  license_key text,
  is_active boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT license_assignments_type_check CHECK (type = ANY (ARRAY['sophos'::text, 'server'::text, 'windows'::text])),
  CONSTRAINT license_assignments_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES license_pools(id) ON DELETE CASCADE
);

-- Create microsoft365_pools table
CREATE TABLE IF NOT EXISTS microsoft365_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type text NOT NULL,
  total_licenses integer NOT NULL DEFAULT 0,
  assigned_licenses integer NOT NULL DEFAULT 0,
  available_licenses integer NOT NULL DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  expiration_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create microsoft365_users table
CREATE TABLE IF NOT EXISTS microsoft365_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  assigned_licenses text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legacy_licenses table
CREATE TABLE IF NOT EXISTS legacy_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  is_active boolean DEFAULT true,
  expiration_date date,
  cost numeric(10,2) DEFAULT 0,
  notes text DEFAULT '',
  plan_type text,
  assigned_user text,
  user_email text,
  product_type text,
  device_count integer,
  serial_number text,
  product_name text,
  version text,
  server_name text,
  license_key text,
  windows_type text,
  device_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT legacy_licenses_type_check CHECK (type = ANY (ARRAY['microsoft365'::text, 'sophos'::text, 'server'::text, 'windows'::text]))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_license_pools_type ON license_pools USING btree (type);
CREATE INDEX IF NOT EXISTS idx_license_assignments_pool_id ON license_assignments USING btree (pool_id);
CREATE INDEX IF NOT EXISTS idx_license_assignments_type ON license_assignments USING btree (type);
CREATE INDEX IF NOT EXISTS idx_microsoft365_users_email ON microsoft365_users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_legacy_licenses_type ON legacy_licenses USING btree (type);

-- Enable RLS on all tables
ALTER TABLE license_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft365_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft365_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_licenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for license_pools
CREATE POLICY "Usuários autenticados podem ver pools de licenças"
  ON license_pools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pools de licenças"
  ON license_pools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pools de licenças"
  ON license_pools FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar pools de licenças"
  ON license_pools FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for license_assignments
CREATE POLICY "Usuários autenticados podem ver atribuições de licenças"
  ON license_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir atribuições de licenças"
  ON license_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar atribuições de licenç"
  ON license_assignments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar atribuições de licenças"
  ON license_assignments FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for microsoft365_pools
CREATE POLICY "Usuários autenticados podem ver pools Microsoft 365"
  ON microsoft365_pools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pools Microsoft 365"
  ON microsoft365_pools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pools Microsoft 365"
  ON microsoft365_pools FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar pools Microsoft 365"
  ON microsoft365_pools FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for microsoft365_users
CREATE POLICY "Usuários autenticados podem ver usuários Microsoft 365"
  ON microsoft365_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir usuários Microsoft 365"
  ON microsoft365_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar usuários Microsoft 365"
  ON microsoft365_users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar usuários Microsoft 365"
  ON microsoft365_users FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for legacy_licenses
CREATE POLICY "Usuários autenticados podem ver licenças legadas"
  ON legacy_licenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir licenças legadas"
  ON legacy_licenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar licenças legadas"
  ON legacy_licenses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar licenças legadas"
  ON legacy_licenses FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_license_pools_updated_at
  BEFORE UPDATE ON license_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_license_assignments_updated_at
  BEFORE UPDATE ON license_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microsoft365_pools_updated_at
  BEFORE UPDATE ON microsoft365_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microsoft365_users_updated_at
  BEFORE UPDATE ON microsoft365_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_licenses_updated_at
  BEFORE UPDATE ON legacy_licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();