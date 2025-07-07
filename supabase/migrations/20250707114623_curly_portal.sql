/*
  # Dados de Exemplo para o Sistema de Licenças

  1. Dados de Exemplo
    - Pools de licenças Microsoft 365
    - Usuários Microsoft 365
    - Pools de licenças genéricas
    - Atribuições de licenças

  2. Dados Realistas
    - Contratos com datas de expiração variadas
    - Usuários com diferentes combinações de licenças
    - Atribuições ativas e inativas
*/

-- Inserir pools de licenças Microsoft 365
INSERT INTO microsoft365_pools (id, license_type, total_licenses, assigned_licenses, available_licenses, cost, expiration_date, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Microsoft 365 Business Standard', 25, 18, 7, 12.50, '2024-12-31', 'Licenças principais da empresa'),
('550e8400-e29b-41d4-a716-446655440002', 'Exchange Online (Plan 1)', 10, 8, 2, 4.00, '2024-12-31', 'Email básico para usuários externos'),
('550e8400-e29b-41d4-a716-446655440003', 'Power BI Pro', 5, 3, 2, 10.00, '2024-12-31', 'Para análise de dados'),
('550e8400-e29b-41d4-a716-446655440004', 'Microsoft Teams', 50, 35, 15, 0.00, NULL, 'Licenças gratuitas do Teams');

-- Inserir usuários Microsoft 365
INSERT INTO microsoft365_users (id, name, email, assigned_licenses, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@empresa.com', '{"550e8400-e29b-41d4-a716-446655440001","550e8400-e29b-41d4-a716-446655440003"}', true),
('660e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@empresa.com', '{"550e8400-e29b-41d4-a716-446655440001","550e8400-e29b-41d4-a716-446655440004"}', true),
('660e8400-e29b-41d4-a716-446655440003', 'Pedro Costa', 'pedro.costa@empresa.com', '{"550e8400-e29b-41d4-a716-446655440002","550e8400-e29b-41d4-a716-446655440004"}', true),
('660e8400-e29b-41d4-a716-446655440004', 'Ana Oliveira', 'ana.oliveira@empresa.com', '{"550e8400-e29b-41d4-a716-446655440001","550e8400-e29b-41d4-a716-446655440003","550e8400-e29b-41d4-a716-446655440004"}', true),
('660e8400-e29b-41d4-a716-446655440005', 'Carlos Ferreira', 'carlos.ferreira@empresa.com', '{"550e8400-e29b-41d4-a716-446655440002"}', false);

-- Inserir pools de licenças genéricas
INSERT INTO license_pools (id, type, name, total_licenses, assigned_licenses, available_licenses, cost, expiration_date, notes) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'sophos', 'Sophos Central Endpoint 2024', 100, 75, 25, 35.00, '2024-12-31', 'Contrato principal de antivírus'),
('770e8400-e29b-41d4-a716-446655440002', 'sophos', 'Sophos Firewall XGS', 5, 3, 2, 500.00, '2025-06-30', 'Licenças para firewalls'),
('770e8400-e29b-41d4-a716-446655440003', 'server', 'Windows Server 2022 Standard', 10, 6, 4, 1200.00, '2025-12-31', 'Licenças de servidor Windows'),
('770e8400-e29b-41d4-a716-446655440004', 'server', 'Veeam Backup & Replication', 3, 2, 1, 1200.00, '2024-08-15', 'Sistema de backup corporativo'),
('770e8400-e29b-41d4-a716-446655440005', 'windows', 'Windows 11 Pro', 50, 35, 15, 200.00, '2025-12-31', 'Licenças para estações de trabalho');

-- Inserir atribuições de licenças
INSERT INTO license_assignments (id, type, pool_id, device_name, server_name, user_email, serial_number, license_key, is_active, notes) VALUES
-- Sophos assignments
('880e8400-e29b-41d4-a716-446655440001', 'sophos', '770e8400-e29b-41d4-a716-446655440001', 'WS-ADMIN-01', NULL, 'admin@empresa.com', 'SN001', NULL, true, 'Estação do administrador'),
('880e8400-e29b-41d4-a716-446655440002', 'sophos', '770e8400-e29b-41d4-a716-446655440001', 'WS-USER-01', NULL, 'user1@empresa.com', NULL, NULL, true, 'Estação do usuário 1'),
('880e8400-e29b-41d4-a716-446655440003', 'sophos', '770e8400-e29b-41d4-a716-446655440002', 'FW-MAIN-01', NULL, NULL, 'XG4100-001', NULL, true, 'Firewall principal'),

-- Server assignments
('880e8400-e29b-41d4-a716-446655440004', 'server', '770e8400-e29b-41d4-a716-446655440003', NULL, 'SRV-AD-01', NULL, NULL, 'WIN22-XXXXX-XXXXX-XXXXX', true, 'Servidor de domínio'),
('880e8400-e29b-41d4-a716-446655440005', 'server', '770e8400-e29b-41d4-a716-446655440004', NULL, 'SRV-BACKUP-01', NULL, NULL, 'VEEAM-XXXXX-XXXXX-XXXXX', true, 'Servidor de backup'),

-- Windows assignments
('880e8400-e29b-41d4-a716-446655440006', 'windows', '770e8400-e29b-41d4-a716-446655440005', 'WS-DEV-01', NULL, 'dev1@empresa.com', NULL, 'WIN11-XXXXX-XXXXX-XXXXX', true, 'Estação de desenvolvimento'),
('880e8400-e29b-41d4-a716-446655440007', 'windows', '770e8400-e29b-41d4-a716-446655440005', 'WS-DESIGN-01', NULL, 'design@empresa.com', NULL, 'WIN11-YYYYY-YYYYY-YYYYY', false, 'Estação de design (inativa)');