export interface BaseLicense {
  id: string;
  name: string;
  isActive: boolean;
  expirationDate?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Microsoft365License extends BaseLicense {
  type: 'microsoft365';
  planType: 'Business Basic' | 'Business Standard' | 'Business Premium' | 'Enterprise E1' | 'Enterprise E3' | 'Enterprise E5';
  assignedUser: string;
  userEmail: string;
}

export interface Microsoft365LicensePool {
  id: string;
  licenseType: 'Exchange Online (Plan 1)' | 'Exchange Online (Plan 2)' | 'Exchange Online Kiosk' | 'Microsoft 365 Business Standard' | 'Microsoft Teams' | 'Power BI Pro';
  totalLicenses: number;
  assignedLicenses: number;
  availableLicenses: number;
  cost?: number;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Microsoft365User {
  id: string;
  name: string;
  email: string;
  assignedLicenses: string[]; // Array of license pool IDs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SophosLicense extends BaseLicense {
  type: 'sophos';
  productType: 'Central' | 'Firewall';
  deviceCount: number;
  serialNumber?: string;
}

export interface ServerLicense extends BaseLicense {
  type: 'server';
  productName: string;
  version: string;
  serverName: string;
  licenseKey?: string;
}

export interface WindowsLicense extends BaseLicense {
  type: 'windows';
  windowsType: 'Server' | 'Client';
  version: string;
  licenseKey: string;
  deviceName: string;
}

export type License = Microsoft365License | SophosLicense | ServerLicense | WindowsLicense;

export interface LicenseStats {
  total: number;
  active: number;
  inactive: number;
  expiringSoon: number;
}