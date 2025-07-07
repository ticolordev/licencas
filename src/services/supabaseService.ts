import { supabase } from '@/lib/supabase';
import type {
  DatabaseMicrosoft365Pool,
  DatabaseMicrosoft365User,
  DatabaseLicensePool,
  DatabaseLicenseAssignment,
  DatabaseLegacyLicense
} from '@/lib/supabase';
import type {
  Microsoft365LicensePool,
  Microsoft365User,
  LicensePool,
  LicenseAssignment,
  License
} from '@/types/license';

// Conversion functions
function convertDbToMicrosoft365Pool(dbPool: DatabaseMicrosoft365Pool): Microsoft365LicensePool {
  return {
    id: dbPool.id,
    licenseType: dbPool.license_type as any,
    totalLicenses: dbPool.total_licenses,
    assignedLicenses: dbPool.assigned_licenses,
    availableLicenses: dbPool.available_licenses,
    cost: dbPool.cost,
    expirationDate: dbPool.expiration_date,
    notes: dbPool.notes,
    createdAt: dbPool.created_at,
    updatedAt: dbPool.updated_at,
  };
}

function convertMicrosoft365PoolToDb(pool: Partial<Microsoft365LicensePool>): Partial<DatabaseMicrosoft365Pool> {
  return {
    id: pool.id,
    license_type: pool.licenseType,
    total_licenses: pool.totalLicenses,
    assigned_licenses: pool.assignedLicenses,
    available_licenses: pool.availableLicenses,
    cost: pool.cost,
    expiration_date: pool.expirationDate,
    notes: pool.notes,
  };
}

function convertDbToMicrosoft365User(dbUser: DatabaseMicrosoft365User): Microsoft365User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    assignedLicenses: dbUser.assigned_licenses,
    isActive: dbUser.is_active,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

function convertMicrosoft365UserToDb(user: Partial<Microsoft365User>): Partial<DatabaseMicrosoft365User> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    assigned_licenses: user.assignedLicenses,
    is_active: user.isActive,
  };
}

function convertDbToLicensePool(dbPool: DatabaseLicensePool): LicensePool {
  return {
    id: dbPool.id,
    type: dbPool.type,
    name: dbPool.name,
    totalLicenses: dbPool.total_licenses,
    assignedLicenses: dbPool.assigned_licenses,
    availableLicenses: dbPool.available_licenses,
    cost: dbPool.cost,
    expirationDate: dbPool.expiration_date,
    notes: dbPool.notes,
    createdAt: dbPool.created_at,
    updatedAt: dbPool.updated_at,
  };
}

function convertLicensePoolToDb(pool: Partial<LicensePool>): Partial<DatabaseLicensePool> {
  return {
    id: pool.id,
    type: pool.type,
    name: pool.name,
    total_licenses: pool.totalLicenses,
    assigned_licenses: pool.assignedLicenses,
    available_licenses: pool.availableLicenses,
    cost: pool.cost,
    expiration_date: pool.expirationDate,
    notes: pool.notes,
  };
}

function convertDbToLicenseAssignment(dbAssignment: DatabaseLicenseAssignment): LicenseAssignment {
  return {
    id: dbAssignment.id,
    type: dbAssignment.type,
    poolId: dbAssignment.pool_id,
    deviceName: dbAssignment.device_name,
    serverName: dbAssignment.server_name,
    userEmail: dbAssignment.user_email,
    serialNumber: dbAssignment.serial_number,
    licenseKey: dbAssignment.license_key,
    isActive: dbAssignment.is_active,
    notes: dbAssignment.notes,
    createdAt: dbAssignment.created_at,
    updatedAt: dbAssignment.updated_at,
  };
}

function convertLicenseAssignmentToDb(assignment: Partial<LicenseAssignment>): Partial<DatabaseLicenseAssignment> {
  return {
    id: assignment.id,
    type: assignment.type,
    pool_id: assignment.poolId,
    device_name: assignment.deviceName,
    server_name: assignment.serverName,
    user_email: assignment.userEmail,
    serial_number: assignment.serialNumber,
    license_key: assignment.licenseKey,
    is_active: assignment.isActive,
    notes: assignment.notes,
  };
}

// Microsoft 365 Pools
export const microsoft365PoolsService = {
  async getAll(): Promise<Microsoft365LicensePool[]> {
    const { data, error } = await supabase
      .from('microsoft365_pools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbToMicrosoft365Pool);
  },

  async create(pool: Partial<Microsoft365LicensePool>): Promise<Microsoft365LicensePool> {
    const dbPool = convertMicrosoft365PoolToDb(pool);
    const { data, error } = await supabase
      .from('microsoft365_pools')
      .insert(dbPool)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToMicrosoft365Pool(data);
  },

  async update(id: string, pool: Partial<Microsoft365LicensePool>): Promise<Microsoft365LicensePool> {
    const dbPool = convertMicrosoft365PoolToDb(pool);
    const { data, error } = await supabase
      .from('microsoft365_pools')
      .update(dbPool)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToMicrosoft365Pool(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('microsoft365_pools')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Microsoft 365 Users
export const microsoft365UsersService = {
  async getAll(): Promise<Microsoft365User[]> {
    const { data, error } = await supabase
      .from('microsoft365_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbToMicrosoft365User);
  },

  async create(user: Partial<Microsoft365User>): Promise<Microsoft365User> {
    const dbUser = convertMicrosoft365UserToDb(user);
    const { data, error } = await supabase
      .from('microsoft365_users')
      .insert(dbUser)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToMicrosoft365User(data);
  },

  async update(id: string, user: Partial<Microsoft365User>): Promise<Microsoft365User> {
    const dbUser = convertMicrosoft365UserToDb(user);
    const { data, error } = await supabase
      .from('microsoft365_users')
      .update(dbUser)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToMicrosoft365User(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('microsoft365_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// License Pools
export const licensePoolsService = {
  async getAll(): Promise<LicensePool[]> {
    const { data, error } = await supabase
      .from('license_pools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbToLicensePool);
  },

  async create(pool: Partial<LicensePool>): Promise<LicensePool> {
    const dbPool = convertLicensePoolToDb(pool);
    const { data, error } = await supabase
      .from('license_pools')
      .insert(dbPool)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToLicensePool(data);
  },

  async update(id: string, pool: Partial<LicensePool>): Promise<LicensePool> {
    const dbPool = convertLicensePoolToDb(pool);
    const { data, error } = await supabase
      .from('license_pools')
      .update(dbPool)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToLicensePool(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('license_pools')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// License Assignments
export const licenseAssignmentsService = {
  async getAll(): Promise<LicenseAssignment[]> {
    const { data, error } = await supabase
      .from('license_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbToLicenseAssignment);
  },

  async create(assignment: Partial<LicenseAssignment>): Promise<LicenseAssignment> {
    const dbAssignment = convertLicenseAssignmentToDb(assignment);
    const { data, error } = await supabase
      .from('license_assignments')
      .insert(dbAssignment)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToLicenseAssignment(data);
  },

  async update(id: string, assignment: Partial<LicenseAssignment>): Promise<LicenseAssignment> {
    const dbAssignment = convertLicenseAssignmentToDb(assignment);
    const { data, error } = await supabase
      .from('license_assignments')
      .update(dbAssignment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbToLicenseAssignment(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('license_assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Legacy Licenses (for compatibility)
export const legacyLicensesService = {
  async getAll(): Promise<License[]> {
    const { data, error } = await supabase
      .from('legacy_licenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map((dbLicense: DatabaseLegacyLicense) => ({
      id: dbLicense.id,
      name: dbLicense.name,
      type: dbLicense.type as any,
      isActive: dbLicense.is_active,
      expirationDate: dbLicense.expiration_date,
      cost: dbLicense.cost,
      notes: dbLicense.notes,
      createdAt: dbLicense.created_at,
      updatedAt: dbLicense.updated_at,
      // Type-specific fields
      ...(dbLicense.plan_type && { planType: dbLicense.plan_type }),
      ...(dbLicense.assigned_user && { assignedUser: dbLicense.assigned_user }),
      ...(dbLicense.user_email && { userEmail: dbLicense.user_email }),
      ...(dbLicense.product_type && { productType: dbLicense.product_type }),
      ...(dbLicense.device_count && { deviceCount: dbLicense.device_count }),
      ...(dbLicense.serial_number && { serialNumber: dbLicense.serial_number }),
      ...(dbLicense.product_name && { productName: dbLicense.product_name }),
      ...(dbLicense.version && { version: dbLicense.version }),
      ...(dbLicense.server_name && { serverName: dbLicense.server_name }),
      ...(dbLicense.license_key && { licenseKey: dbLicense.license_key }),
      ...(dbLicense.windows_type && { windowsType: dbLicense.windows_type }),
      ...(dbLicense.device_name && { deviceName: dbLicense.device_name }),
    })) as License[];
  },

  async create(license: Partial<License>): Promise<License> {
    const dbLicense: Partial<DatabaseLegacyLicense> = {
      id: license.id,
      name: license.name,
      type: license.type,
      is_active: license.isActive,
      expiration_date: license.expirationDate,
      cost: license.cost,
      notes: license.notes,
      // Type-specific fields
      ...(license.type === 'microsoft365' && {
        plan_type: (license as any).planType,
        assigned_user: (license as any).assignedUser,
        user_email: (license as any).userEmail,
      }),
      ...(license.type === 'sophos' && {
        product_type: (license as any).productType,
        device_count: (license as any).deviceCount,
        serial_number: (license as any).serialNumber,
      }),
      ...(license.type === 'server' && {
        product_name: (license as any).productName,
        version: (license as any).version,
        server_name: (license as any).serverName,
        license_key: (license as any).licenseKey,
      }),
      ...(license.type === 'windows' && {
        windows_type: (license as any).windowsType,
        version: (license as any).version,
        device_name: (license as any).deviceName,
        license_key: (license as any).licenseKey,
      }),
    };

    const { data, error } = await supabase
      .from('legacy_licenses')
      .insert(dbLicense)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDbToLicense(data);
  },

  async update(id: string, license: Partial<License>): Promise<License> {
    const dbLicense: Partial<DatabaseLegacyLicense> = {
      name: license.name,
      type: license.type,
      is_active: license.isActive,
      expiration_date: license.expirationDate,
      cost: license.cost,
      notes: license.notes,
      // Type-specific fields
      ...(license.type === 'microsoft365' && {
        plan_type: (license as any).planType,
        assigned_user: (license as any).assignedUser,
        user_email: (license as any).userEmail,
      }),
      ...(license.type === 'sophos' && {
        product_type: (license as any).productType,
        device_count: (license as any).deviceCount,
        serial_number: (license as any).serialNumber,
      }),
      ...(license.type === 'server' && {
        product_name: (license as any).productName,
        version: (license as any).version,
        server_name: (license as any).serverName,
        license_key: (license as any).licenseKey,
      }),
      ...(license.type === 'windows' && {
        windows_type: (license as any).windowsType,
        version: (license as any).version,
        device_name: (license as any).deviceName,
        license_key: (license as any).licenseKey,
      }),
    };

    const { data, error } = await supabase
      .from('legacy_licenses')
      .update(dbLicense)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDbToLicense(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('legacy_licenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  convertDbToLicense(dbLicense: DatabaseLegacyLicense): License {
    return {
      id: dbLicense.id,
      name: dbLicense.name,
      type: dbLicense.type as any,
      isActive: dbLicense.is_active,
      expirationDate: dbLicense.expiration_date,
      cost: dbLicense.cost,
      notes: dbLicense.notes,
      createdAt: dbLicense.created_at,
      updatedAt: dbLicense.updated_at,
      // Type-specific fields
      ...(dbLicense.plan_type && { planType: dbLicense.plan_type }),
      ...(dbLicense.assigned_user && { assignedUser: dbLicense.assigned_user }),
      ...(dbLicense.user_email && { userEmail: dbLicense.user_email }),
      ...(dbLicense.product_type && { productType: dbLicense.product_type }),
      ...(dbLicense.device_count && { deviceCount: dbLicense.device_count }),
      ...(dbLicense.serial_number && { serialNumber: dbLicense.serial_number }),
      ...(dbLicense.product_name && { productName: dbLicense.product_name }),
      ...(dbLicense.version && { version: dbLicense.version }),
      ...(dbLicense.server_name && { serverName: dbLicense.server_name }),
      ...(dbLicense.license_key && { licenseKey: dbLicense.license_key }),
      ...(dbLicense.windows_type && { windowsType: dbLicense.windows_type }),
      ...(dbLicense.device_name && { deviceName: dbLicense.device_name }),
    } as License;
  },
};