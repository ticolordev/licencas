import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseMicrosoft365Pool {
  id: string;
  license_type: string;
  total_licenses: number;
  assigned_licenses: number;
  available_licenses: number;
  cost?: number;
  expiration_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMicrosoft365User {
  id: string;
  name: string;
  email: string;
  assigned_licenses: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLicensePool {
  id: string;
  type: 'sophos' | 'server' | 'windows';
  name: string;
  total_licenses: number;
  assigned_licenses: number;
  available_licenses: number;
  cost?: number;
  expiration_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLicenseAssignment {
  id: string;
  type: 'sophos' | 'server' | 'windows';
  pool_id: string;
  device_name?: string;
  server_name?: string;
  user_email?: string;
  serial_number?: string;
  license_key?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLegacyLicense {
  id: string;
  name: string;
  type: 'microsoft365' | 'sophos' | 'server' | 'windows';
  is_active: boolean;
  expiration_date?: string;
  cost?: number;
  notes?: string;
  plan_type?: string;
  assigned_user?: string;
  user_email?: string;
  product_type?: string;
  device_count?: number;
  serial_number?: string;
  product_name?: string;
  version?: string;
  server_name?: string;
  license_key?: string;
  windows_type?: string;
  device_name?: string;
  created_at: string;
  updated_at: string;
}