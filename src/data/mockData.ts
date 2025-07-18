import { License, Microsoft365LicensePool, Microsoft365User, LicensePool, LicenseAssignment } from '@/types/license';

export const mockLicenses: License[] = [];

export const mockMicrosoft365Pools: Microsoft365LicensePool[] = [
  {
    id: 'pool-1',
    licenseType: 'Microsoft 365 Business Standard',
    totalLicenses: 25,
    assignedLicenses: 18,
    availableLicenses: 7,
    cost: 12.50,
    expirationDate: '2024-12-31',
    notes: 'Licenças principais da empresa',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pool-2',
    licenseType: 'Exchange Online (Plan 1)',
    totalLicenses: 10,
    assignedLicenses: 8,
    availableLicenses: 2,
    cost: 4.00,
    expirationDate: '2024-12-31',
    notes: 'Email básico para usuários externos',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pool-3',
    licenseType: 'Power BI Pro',
    totalLicenses: 5,
    assignedLicenses: 3,
    availableLicenses: 2,
    cost: 10.00,
    expirationDate: '2024-12-31',
    notes: 'Para análise de dados',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pool-4',
    licenseType: 'Microsoft Teams',
    totalLicenses: 50,
    assignedLicenses: 35,
    availableLicenses: 15,
    cost: 0.00,
    notes: 'Licenças gratuitas do Teams',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

export const mockMicrosoft365Users: Microsoft365User[] = [
  {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    assignedLicenses: ['pool-1', 'pool-3'],
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    assignedLicenses: ['pool-1', 'pool-4'],
    isActive: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'user-3',
    name: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    assignedLicenses: ['pool-2', 'pool-4'],
    isActive: true,
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
  },
  {
    id: 'user-4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    assignedLicenses: ['pool-1', 'pool-3', 'pool-4'],
    isActive: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: 'user-5',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@empresa.com',
    assignedLicenses: ['pool-2'],
    isActive: false,
    createdAt: '2024-02-05',
    updatedAt: '2024-02-10',
  },
];

export const mockLicensePools: LicensePool[] = [
  {
    id: 'sophos-pool-1',
    type: 'sophos',
    name: 'Sophos Central Endpoint 2024',
    totalLicenses: 100,
    assignedLicenses: 75,
    availableLicenses: 25,
    cost: 35.00,
    expirationDate: '2024-12-31',
    notes: 'Contrato principal de antivírus',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'sophos-pool-2',
    type: 'sophos',
    name: 'Sophos Firewall XGS',
    totalLicenses: 5,
    assignedLicenses: 3,
    availableLicenses: 2,
    cost: 500.00,
    expirationDate: '2025-06-30',
    notes: 'Licenças para firewalls',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'server-pool-1',
    type: 'server',
    name: 'Windows Server 2022 Standard',
    totalLicenses: 10,
    assignedLicenses: 6,
    availableLicenses: 4,
    cost: 1200.00,
    expirationDate: '2025-12-31',
    notes: 'Licenças de servidor Windows',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'server-pool-3',
    type: 'server',
    name: 'Veeam Backup & Replication',
    totalLicenses: 3,
    assignedLicenses: 2,
    availableLicenses: 1,
    cost: 1200.00,
    expirationDate: '2024-08-15',
    notes: 'Sistema de backup corporativo',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'windows-pool-1',
    type: 'windows',
    name: 'Windows 11 Pro',
    totalLicenses: 50,
    assignedLicenses: 35,
    availableLicenses: 15,
    cost: 200.00,
    expirationDate: '2025-12-31',
    notes: 'Licenças para estações de trabalho',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

export const mockLicenseAssignments: LicenseAssignment[] = [
  // Sophos assignments
  {
    id: 'assign-1',
    type: 'sophos',
    poolId: 'sophos-pool-1',
    deviceName: 'WS-ADMIN-01',
    userEmail: 'admin@empresa.com',
    serialNumber: 'SN001',
    isActive: true,
    notes: 'Estação do administrador',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'assign-2',
    type: 'sophos',
    poolId: 'sophos-pool-1',
    deviceName: 'WS-USER-01',
    userEmail: 'user1@empresa.com',
    isActive: true,
    notes: 'Estação do usuário 1',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
  {
    id: 'assign-3',
    type: 'sophos',
    poolId: 'sophos-pool-2',
    deviceName: 'FW-MAIN-01',
    serialNumber: 'XG4100-001',
    isActive: true,
    notes: 'Firewall principal',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17',
  },
  
  // Server assignments
  {
    id: 'assign-4',
    type: 'server',
    poolId: 'server-pool-1',
    serverName: 'SRV-AD-01',
    licenseKey: 'WIN22-XXXXX-XXXXX-XXXXX',
    isActive: true,
    notes: 'Servidor de domínio',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: 'assign-6',
    type: 'server',
    poolId: 'server-pool-3',
    serverName: 'SRV-BACKUP-01',
    licenseKey: 'VEEAM-XXXXX-XXXXX-XXXXX',
    isActive: true,
    notes: 'Servidor de backup',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  
  // Windows assignments
  {
    id: 'assign-7',
    type: 'windows',
    poolId: 'windows-pool-1',
    deviceName: 'WS-DEV-01',
    userEmail: 'dev1@empresa.com',
    licenseKey: 'WIN11-XXXXX-XXXXX-XXXXX',
    isActive: true,
    notes: 'Estação de desenvolvimento',
    createdAt: '2024-01-21',
    updatedAt: '2024-01-21',
  },
  {
    id: 'assign-8',
    type: 'windows',
    poolId: 'windows-pool-1',
    deviceName: 'WS-DESIGN-01',
    userEmail: 'design@empresa.com',
    licenseKey: 'WIN11-YYYYY-YYYYY-YYYYY',
    isActive: false,
    notes: 'Estação de design (inativa)',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
  },
];