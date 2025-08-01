import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  console.warn('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Only create client if environment variables are present
const supabaseClient = supabaseUrl && supabaseAnonKey ? 
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) : null;

export const supabase = supabaseClient;

// Test connection only if client exists
if (supabase) {
  console.log('Supabase configuration:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  
  supabase.from('microsoft365_pools').select('count', { count: 'exact', head: true })
    .then(({ error, count }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful. Tables accessible.');
      }
    })
    .catch((error) => {
      console.error('Supabase connection test error:', error);
    });
} else {
  console.warn('Supabase client not initialized due to missing environment variables.');
}

// Database types
export interface DatabaseMicrosoft365Pool {
  id: string;
  license_type: string;
  total_licenses: number;
  assigned_licenses: number;
  available_licenses: number;
  cost?: number | null;
  expiration_date?: string | null;
  notes?: string | null;
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
  cost?: number | null;
  expiration_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLicenseAssignment {
  id: string;
  type: 'sophos' | 'server' | 'windows';
  pool_id: string;
  device_name?: string | null;
  server_name?: string | null;
  user_email?: string | null;
  serial_number?: string | null;
  license_key?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLegacyLicense {
  id: string;
  name: string;
  type: 'microsoft365' | 'sophos' | 'server' | 'windows';
  is_active: boolean;
  expiration_date?: string | null;
  cost?: number | null;
  notes?: string | null;
  plan_type?: string | null;
  assigned_user?: string | null;
  user_email?: string | null;
  product_type?: string | null;
  device_count?: number | null;
  serial_number?: string | null;
  product_name?: string | null;
  version?: string | null;
  server_name?: string | null;
  license_key?: string | null;
  windows_type?: string | null;
  device_name?: string | null;
  created_at: string;
  updated_at: string;
}