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
    notes: dbPool.notes || '',
    createdAt: dbPool.created_at,
    updatedAt: dbPool.updated_at,
  };
}

function convertMicrosoft365PoolToDb(pool: Partial<Microsoft365LicensePool>): Partial<DatabaseMicrosoft365Pool> {
  const dbPool: Partial<DatabaseMicrosoft365Pool> = {};
  
  if (pool.id) dbPool.id = pool.id;
  if (pool.licenseType) dbPool.license_type = pool.licenseType;
  if (pool.totalLicenses !== undefined) dbPool.total_licenses = pool.totalLicenses;
  if (pool.assignedLicenses !== undefined) dbPool.assigned_licenses = pool.assignedLicenses;
  if (pool.availableLicenses !== undefined) dbPool.available_licenses = pool.availableLicenses;
  if (pool.cost !== undefined) dbPool.cost = pool.cost;
  if (pool.expirationDate !== undefined) dbPool.expiration_date = pool.expirationDate;
  if (pool.notes !== undefined) dbPool.notes = pool.notes;
  
  return dbPool;
}

function convertDbToMicrosoft365User(dbUser: DatabaseMicrosoft365User): Microsoft365User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    assignedLicenses: dbUser.assigned_licenses || [],
    isActive: dbUser.is_active,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

function convertMicrosoft365UserToDb(user: Partial<Microsoft365User>): Partial<DatabaseMicrosoft365User> {
  const dbUser: Partial<DatabaseMicrosoft365User> = {};
  
  if (user.id) dbUser.id = user.id;
  if (user.name) dbUser.name = user.name;
  if (user.email) dbUser.email = user.email;
  if (user.assignedLicenses !== undefined) dbUser.assigned_licenses = user.assignedLicenses;
  if (user.isActive !== undefined) dbUser.is_active = user.isActive;
  
  return dbUser;
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
    notes: dbPool.notes || '',
    createdAt: dbPool.created_at,
    updatedAt: dbPool.updated_at,
  };
}

function convertLicensePoolToDb(pool: Partial<LicensePool>): Partial<DatabaseLicensePool> {
  const dbPool: Partial<DatabaseLicensePool> = {};
  
  if (pool.id) dbPool.id = pool.id;
  if (pool.type) dbPool.type = pool.type;
  if (pool.name) dbPool.name = pool.name;
  if (pool.totalLicenses !== undefined) dbPool.total_licenses = pool.totalLicenses;
  if (pool.assignedLicenses !== undefined) dbPool.assigned_licenses = pool.assignedLicenses;
  if (pool.availableLicenses !== undefined) dbPool.available_licenses = pool.availableLicenses;
  if (pool.cost !== undefined) dbPool.cost = pool.cost;
  if (pool.expirationDate !== undefined) dbPool.expiration_date = pool.expirationDate;
  if (pool.notes !== undefined) dbPool.notes = pool.notes;
  
  return dbPool;
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
    notes: dbAssignment.notes || '',
    createdAt: dbAssignment.created_at,
    updatedAt: dbAssignment.updated_at,
  };
}

function convertLicenseAssignmentToDb(assignment: Partial<LicenseAssignment>): Partial<DatabaseLicenseAssignment> {
  const dbAssignment: Partial<DatabaseLicenseAssignment> = {};
  
  if (assignment.id) dbAssignment.id = assignment.id;
  if (assignment.type) dbAssignment.type = assignment.type;
  if (assignment.poolId) dbAssignment.pool_id = assignment.poolId;
  if (assignment.deviceName !== undefined) dbAssignment.device_name = assignment.deviceName;
  if (assignment.serverName !== undefined) dbAssignment.server_name = assignment.serverName;
  if (assignment.userEmail !== undefined) dbAssignment.user_email = assignment.userEmail;
  if (assignment.serialNumber !== undefined) dbAssignment.serial_number = assignment.serialNumber;
  if (assignment.licenseKey !== undefined) dbAssignment.license_key = assignment.licenseKey;
  if (assignment.isActive !== undefined) dbAssignment.is_active = assignment.isActive;
  if (assignment.notes !== undefined) dbAssignment.notes = assignment.notes;
  
  return dbAssignment;
}

// Microsoft 365 Pools
export const microsoft365PoolsService = {
  async getAll(): Promise<Microsoft365LicensePool[]> {
    try {
      const { data, error } = await supabase
        .from('microsoft365_pools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching Microsoft 365 pools:', error);
        throw new Error(`Erro ao buscar pools Microsoft 365: ${error.message}`);
      }
      
      return (data || []).map(convertDbToMicrosoft365Pool);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async create(pool: Partial<Microsoft365LicensePool>): Promise<Microsoft365LicensePool> {
    try {
      // Ensure required fields and defaults
      const poolData = {
        ...pool,
        totalLicenses: pool.totalLicenses || 0,
        assignedLicenses: 0,
        availableLicenses: pool.totalLicenses || 0,
        cost: pool.cost || 0,
        notes: pool.notes || ''
      };
      
      const dbPool = convertMicrosoft365PoolToDb(poolData);
      
      const { data, error } = await supabase
        .from('microsoft365_pools')
        .insert(dbPool)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating Microsoft 365 pool:', error);
        throw new Error(`Erro ao criar pool Microsoft 365: ${error.message}`);
      }
      
      return convertDbToMicrosoft365Pool(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async update(id: string, pool: Partial<Microsoft365LicensePool>): Promise<Microsoft365LicensePool> {
    try {
      const dbPool = convertMicrosoft365PoolToDb(pool);
      
      const { data, error } = await supabase
        .from('microsoft365_pools')
        .update(dbPool)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating Microsoft 365 pool:', error);
        throw new Error(`Erro ao atualizar pool Microsoft 365: ${error.message}`);
      }
      
      return convertDbToMicrosoft365Pool(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('microsoft365_pools')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting Microsoft 365 pool:', error);
        throw new Error(`Erro ao excluir pool Microsoft 365: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },
};

// Microsoft 365 Users
export const microsoft365UsersService = {
  async getAll(): Promise<Microsoft365User[]> {
    try {
      const { data, error } = await supabase
        .from('microsoft365_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching Microsoft 365 users:', error);
        throw new Error(`Erro ao buscar usuários Microsoft 365: ${error.message}`);
      }
      
      return (data || []).map(convertDbToMicrosoft365User);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async create(user: Partial<Microsoft365User>): Promise<Microsoft365User> {
    try {
      // Ensure required fields and defaults
      const userData = {
        ...user,
        assignedLicenses: user.assignedLicenses || [],
        isActive: user.isActive !== undefined ? user.isActive : true
      };
      
      const dbUser = convertMicrosoft365UserToDb(userData);
      
      const { data, error } = await supabase
        .from('microsoft365_users')
        .insert(dbUser)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating Microsoft 365 user:', error);
        throw new Error(`Erro ao criar usuário Microsoft 365: ${error.message}`);
      }
      
      return convertDbToMicrosoft365User(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async update(id: string, user: Partial<Microsoft365User>): Promise<Microsoft365User> {
    try {
      const dbUser = convertMicrosoft365UserToDb(user);
      
      const { data, error } = await supabase
        .from('microsoft365_users')
        .update(dbUser)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating Microsoft 365 user:', error);
        throw new Error(`Erro ao atualizar usuário Microsoft 365: ${error.message}`);
      }
      
      return convertDbToMicrosoft365User(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('microsoft365_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting Microsoft 365 user:', error);
        throw new Error(`Erro ao excluir usuário Microsoft 365: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },
};

// License Pools
export const licensePoolsService = {
  async getAll(): Promise<LicensePool[]> {
    try {
      const { data, error } = await supabase
        .from('license_pools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching license pools:', error);
        throw new Error(`Erro ao buscar pools de licenças: ${error.message}`);
      }
      
      return (data || []).map(convertDbToLicensePool);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async create(pool: Partial<LicensePool>): Promise<LicensePool> {
    try {
      // Ensure required fields and defaults
      const poolData = {
        ...pool,
        totalLicenses: pool.totalLicenses || 0,
        assignedLicenses: 0,
        availableLicenses: pool.totalLicenses || 0,
        cost: pool.cost || 0,
        notes: pool.notes || ''
      };
      
      const dbPool = convertLicensePoolToDb(poolData);
      
      const { data, error } = await supabase
        .from('license_pools')
        .insert(dbPool)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating license pool:', error);
        throw new Error(`Erro ao criar pool de licenças: ${error.message}`);
      }
      
      return convertDbToLicensePool(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async update(id: string, pool: Partial<LicensePool>): Promise<LicensePool> {
    try {
      const dbPool = convertLicensePoolToDb(pool);
      
      const { data, error } = await supabase
        .from('license_pools')
        .update(dbPool)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating license pool:', error);
        throw new Error(`Erro ao atualizar pool de licenças: ${error.message}`);
      }
      
      return convertDbToLicensePool(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('license_pools')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting license pool:', error);
        throw new Error(`Erro ao excluir pool de licenças: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },
};

// License Assignments
export const licenseAssignmentsService = {
  async getAll(): Promise<LicenseAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('license_assignments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching license assignments:', error);
        throw new Error(`Erro ao buscar atribuições de licenças: ${error.message}`);
      }
      
      return (data || []).map(convertDbToLicenseAssignment);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async create(assignment: Partial<LicenseAssignment>): Promise<LicenseAssignment> {
    try {
      // Ensure required fields and defaults
      const assignmentData = {
        ...assignment,
        isActive: assignment.isActive !== undefined ? assignment.isActive : true,
        notes: assignment.notes || ''
      };
      
      const dbAssignment = convertLicenseAssignmentToDb(assignmentData);
      
      const { data, error } = await supabase
        .from('license_assignments')
        .insert(dbAssignment)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating license assignment:', error);
        throw new Error(`Erro ao criar atribuição de licença: ${error.message}`);
      }
      
      return convertDbToLicenseAssignment(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async update(id: string, assignment: Partial<LicenseAssignment>): Promise<LicenseAssignment> {
    try {
      const dbAssignment = convertLicenseAssignmentToDb(assignment);
      
      const { data, error } = await supabase
        .from('license_assignments')
        .update(dbAssignment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating license assignment:', error);
        throw new Error(`Erro ao atualizar atribuição de licença: ${error.message}`);
      }
      
      return convertDbToLicenseAssignment(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('license_assignments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting license assignment:', error);
        throw new Error(`Erro ao excluir atribuição de licença: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },
};

// Legacy Licenses (for compatibility)
export const legacyLicensesService = {
  async getAll(): Promise<License[]> {
    try {
      const { data, error } = await supabase
        .from('legacy_licenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching legacy licenses:', error);
        throw new Error(`Erro ao buscar licenças legadas: ${error.message}`);
      }
      
      return (data || []).map((dbLicense: DatabaseLegacyLicense) => this.convertDbToLicense(dbLicense));
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async create(license: Partial<License>): Promise<License> {
    try {
      // Ensure required fields and defaults
      const licenseData = {
        ...license,
        isActive: license.isActive !== undefined ? license.isActive : true,
        cost: license.cost || 0,
        notes: license.notes || ''
      };
      
      const dbLicense: Partial<DatabaseLegacyLicense> = {
        name: licenseData.name,
        type: licenseData.type,
        is_active: licenseData.isActive,
        expiration_date: licenseData.expirationDate,
        cost: licenseData.cost,
        notes: licenseData.notes,
        // Type-specific fields
        ...(licenseData.type === 'microsoft365' && {
          plan_type: (licenseData as any).planType,
          assigned_user: (licenseData as any).assignedUser,
          user_email: (licenseData as any).userEmail,
        }),
        ...(licenseData.type === 'sophos' && {
          product_type: (licenseData as any).productType,
          device_count: (licenseData as any).deviceCount,
          serial_number: (licenseData as any).serialNumber,
        }),
        ...(licenseData.type === 'server' && {
          product_name: (licenseData as any).productName,
          version: (licenseData as any).version,
          server_name: (licenseData as any).serverName,
          license_key: (licenseData as any).licenseKey,
        }),
        ...(licenseData.type === 'windows' && {
          windows_type: (licenseData as any).windowsType,
          version: (licenseData as any).version,
          device_name: (licenseData as any).deviceName,
          license_key: (licenseData as any).licenseKey,
        }),
      };

      const { data, error } = await supabase
        .from('legacy_licenses')
        .insert(dbLicense)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating legacy license:', error);
        throw new Error(`Erro ao criar licença legada: ${error.message}`);
      }
      
      return this.convertDbToLicense(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async update(id: string, license: Partial<License>): Promise<License> {
    try {
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
      
      if (error) {
        console.error('Error updating legacy license:', error);
        throw new Error(`Erro ao atualizar licença legada: ${error.message}`);
      }
      
      return this.convertDbToLicense(data);
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('legacy_licenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting legacy license:', error);
        throw new Error(`Erro ao excluir licença legada: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  },

  convertDbToLicense(dbLicense: DatabaseLegacyLicense): License {
    return {
      id: dbLicense.id,
      name: dbLicense.name,
      type: dbLicense.type as any,
      isActive: dbLicense.is_active,
      expirationDate: dbLicense.expiration_date,
      cost: dbLicense.cost,
      notes: dbLicense.notes || '',
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