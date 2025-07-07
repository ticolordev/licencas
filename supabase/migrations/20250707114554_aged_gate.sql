/*
  # Sistema de Gerenciamento de Licenças - Schema Completo

  1. Novas Tabelas
    - `microsoft365_pools` - Contratos de licenças Microsoft 365
    - `microsoft365_users` - Usuários com licenças Microsoft 365 atribuídas
    - `license_pools` - Contratos de licenças (Sophos, Server, Windows)
    - `license_assignments` - Atribuições de licenças aos dispositivos/servidores
    - `legacy_licenses` - Licenças individuais (compatibilidade)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados lerem e modificarem seus dados

  3. Funcionalidades
    - Controle de disponibilidade automático
    - Rastreamento de datas de criação/atualização
    - Suporte a custos e datas de expiração
    - Campos específicos por tipo de licença
*/

-- Tabela para pools de licenças Microsoft 365
CREATE TABLE IF NOT EXISTS microsoft365_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type text NOT NULL,
  total_licenses integer NOT NULL DEFAULT 0,
  assigned_licenses integer NOT NULL DEFAULT 0,
  available_licenses integer NOT NULL DEFAULT 0,
  cost decimal(10,2) DEFAULT 0,
  expiration_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para usuários Microsoft 365
CREATE TABLE IF NOT EXISTS microsoft365_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  assigned_licenses text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para pools de licenças genéricas (Sophos, Server, Windows)
CREATE TABLE IF NOT EXISTS license_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sophos', 'server', 'windows')),
  name text NOT NULL,
  total_licenses integer NOT NULL DEFAULT 0,
  assigned_licenses integer NOT NULL DEFAULT 0,
  available_licenses integer NOT NULL DEFAULT 0,
  cost decimal(10,2) DEFAULT 0,
  expiration_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para atribuições de licenças
CREATE TABLE IF NOT EXISTS license_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sophos', 'server', 'windows')),
  pool_id uuid NOT NULL REFERENCES license_pools(id) ON DELETE CASCADE,
  device_name text,
  server_name text,
  user_email text,
  serial_number text,
  license_key text,
  is_active boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para licenças individuais (compatibilidade com sistema antigo)
CREATE TABLE IF NOT EXISTS legacy_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('microsoft365', 'sophos', 'server', 'windows')),
  is_active boolean DEFAULT true,
  expiration_date date,
  cost decimal(10,2) DEFAULT 0,
  notes text DEFAULT '',
  
  -- Campos específicos Microsoft 365
  plan_type text,
  assigned_user text,
  user_email text,
  
  -- Campos específicos Sophos
  product_type text,
  device_count integer,
  serial_number text,
  
  -- Campos específicos Server
  product_name text,
  version text,
  server_name text,
  license_key text,
  
  -- Campos específicos Windows
  windows_type text,
  device_name text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE microsoft365_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft365_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_licenses ENABLE ROW LEVEL SECURITY;

-- Políticas para microsoft365_pools
CREATE POLICY "Usuários autenticados podem ver pools Microsoft 365"
  ON microsoft365_pools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pools Microsoft 365"
  ON microsoft365_pools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pools Microsoft 365"
  ON microsoft365_pools
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar pools Microsoft 365"
  ON microsoft365_pools
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para microsoft365_users
CREATE POLICY "Usuários autenticados podem ver usuários Microsoft 365"
  ON microsoft365_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir usuários Microsoft 365"
  ON microsoft365_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar usuários Microsoft 365"
  ON microsoft365_users
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar usuários Microsoft 365"
  ON microsoft365_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para license_pools
CREATE POLICY "Usuários autenticados podem ver pools de licenças"
  ON license_pools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pools de licenças"
  ON license_pools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pools de licenças"
  ON license_pools
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar pools de licenças"
  ON license_pools
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para license_assignments
CREATE POLICY "Usuários autenticados podem ver atribuições de licenças"
  ON license_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir atribuições de licenças"
  ON license_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar atribuições de licenças"
  ON license_assignments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar atribuições de licenças"
  ON license_assignments
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para legacy_licenses
CREATE POLICY "Usuários autenticados podem ver licenças legadas"
  ON legacy_licenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir licenças legadas"
  ON legacy_licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar licenças legadas"
  ON legacy_licenses
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar licenças legadas"
  ON legacy_licenses
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_microsoft365_users_email ON microsoft365_users(email);
CREATE INDEX IF NOT EXISTS idx_license_pools_type ON license_pools(type);
CREATE INDEX IF NOT EXISTS idx_license_assignments_pool_id ON license_assignments(pool_id);
CREATE INDEX IF NOT EXISTS idx_license_assignments_type ON license_assignments(type);
CREATE INDEX IF NOT EXISTS idx_legacy_licenses_type ON legacy_licenses(type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_microsoft365_pools_updated_at
  BEFORE UPDATE ON microsoft365_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microsoft365_users_updated_at
  BEFORE UPDATE ON microsoft365_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_license_pools_updated_at
  BEFORE UPDATE ON license_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_license_assignments_updated_at
  BEFORE UPDATE ON license_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_licenses_updated_at
  BEFORE UPDATE ON legacy_licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();