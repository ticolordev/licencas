import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { License, LicenseStats, Microsoft365LicensePool, Microsoft365User, LicensePool, LicenseAssignment } from '@/types/license';
import { supabase } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import {
  microsoft365PoolsService,
  microsoft365UsersService,
  licensePoolsService,
  licenseAssignmentsService,
  legacyLicensesService
} from '@/services/supabaseService';
import { toast } from 'sonner';

interface LicenseState {
  licenses: License[];
  microsoft365Pools: Microsoft365LicensePool[];
  microsoft365Users: Microsoft365User[];
  licensePools: LicensePool[];
  licenseAssignments: LicenseAssignment[];
  selectedCategory: string;
  searchTerm: string;
  loading: boolean;
  error: string | null;
}

type LicenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_LICENSE'; payload: License }
  | { type: 'UPDATE_LICENSE'; payload: License }
  | { type: 'DELETE_LICENSE'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'LOAD_LICENSES'; payload: License[] }
  | { type: 'ADD_M365_POOL'; payload: Microsoft365LicensePool }
  | { type: 'UPDATE_M365_POOL'; payload: Microsoft365LicensePool }
  | { type: 'DELETE_M365_POOL'; payload: string }
  | { type: 'LOAD_M365_POOLS'; payload: Microsoft365LicensePool[] }
  | { type: 'ADD_M365_USER'; payload: Microsoft365User }
  | { type: 'UPDATE_M365_USER'; payload: Microsoft365User }
  | { type: 'DELETE_M365_USER'; payload: string }
  | { type: 'LOAD_M365_USERS'; payload: Microsoft365User[] }
  | { type: 'ADD_LICENSE_POOL'; payload: LicensePool }
  | { type: 'UPDATE_LICENSE_POOL'; payload: LicensePool }
  | { type: 'DELETE_LICENSE_POOL'; payload: string }
  | { type: 'LOAD_LICENSE_POOLS'; payload: LicensePool[] }
  | { type: 'ADD_LICENSE_ASSIGNMENT'; payload: LicenseAssignment }
  | { type: 'UPDATE_LICENSE_ASSIGNMENT'; payload: LicenseAssignment }
  | { type: 'DELETE_LICENSE_ASSIGNMENT'; payload: string }
  | { type: 'LOAD_LICENSE_ASSIGNMENTS'; payload: LicenseAssignment[] };

const initialState: LicenseState = {
  licenses: [],
  microsoft365Pools: [],
  microsoft365Users: [],
  licensePools: [],
  licenseAssignments: [],
  selectedCategory: 'dashboard',
  searchTerm: '',
  loading: false,
  error: null,
};

const LicenseContext = createContext<{
  state: LicenseState;
  dispatch: React.Dispatch<LicenseAction>;
  getStats: () => Record<string, LicenseStats>;
  getFilteredLicenses: () => License[];
  updatePoolAvailability: () => void;
  // Database operations
  loadAllData: () => Promise<void>;
  saveMicrosoft365Pool: (pool: Partial<Microsoft365LicensePool>) => Promise<void>;
  deleteMicrosoft365Pool: (id: string) => Promise<void>;
  saveMicrosoft365User: (user: Partial<Microsoft365User>) => Promise<void>;
  deleteMicrosoft365User: (id: string) => Promise<void>;
  saveLicensePool: (pool: Partial<LicensePool>) => Promise<void>;
  deleteLicensePool: (id: string) => Promise<void>;
  saveLicenseAssignment: (assignment: Partial<LicenseAssignment>) => Promise<void>;
  deleteLicenseAssignment: (id: string) => Promise<void>;
  saveLicense: (license: Partial<License>) => Promise<void>;
  deleteLicense: (id: string) => Promise<void>;
} | null>(null);

function licenseReducer(state: LicenseState, action: LicenseAction): LicenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_LICENSE':
      return { ...state, licenses: [...state.licenses, action.payload] };
    case 'UPDATE_LICENSE':
      return {
        ...state,
        licenses: state.licenses.map((license) =>
          license.id === action.payload.id ? action.payload : license
        ),
      };
    case 'DELETE_LICENSE':
      return {
        ...state,
        licenses: state.licenses.filter((license) => license.id !== action.payload),
      };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'LOAD_LICENSES':
      return { ...state, licenses: action.payload };
    case 'ADD_M365_POOL':
      return { ...state, microsoft365Pools: [...state.microsoft365Pools, action.payload] };
    case 'UPDATE_M365_POOL':
      return {
        ...state,
        microsoft365Pools: state.microsoft365Pools.map((pool) =>
          pool.id === action.payload.id ? action.payload : pool
        ),
      };
    case 'DELETE_M365_POOL':
      return {
        ...state,
        microsoft365Pools: state.microsoft365Pools.filter((pool) => pool.id !== action.payload),
      };
    case 'LOAD_M365_POOLS':
      return { ...state, microsoft365Pools: action.payload };
    case 'ADD_M365_USER':
      return { ...state, microsoft365Users: [...state.microsoft365Users, action.payload] };
    case 'UPDATE_M365_USER':
      return {
        ...state,
        microsoft365Users: state.microsoft365Users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_M365_USER':
      return {
        ...state,
        microsoft365Users: state.microsoft365Users.filter((user) => user.id !== action.payload),
      };
    case 'LOAD_M365_USERS':
      return { ...state, microsoft365Users: action.payload };
    case 'ADD_LICENSE_POOL':
      return { ...state, licensePools: [...state.licensePools, action.payload] };
    case 'UPDATE_LICENSE_POOL':
      return {
        ...state,
        licensePools: state.licensePools.map((pool) =>
          pool.id === action.payload.id ? action.payload : pool
        ),
      };
    case 'DELETE_LICENSE_POOL':
      return {
        ...state,
        licensePools: state.licensePools.filter((pool) => pool.id !== action.payload),
      };
    case 'LOAD_LICENSE_POOLS':
      return { ...state, licensePools: action.payload };
    case 'ADD_LICENSE_ASSIGNMENT':
      return { ...state, licenseAssignments: [...state.licenseAssignments, action.payload] };
    case 'UPDATE_LICENSE_ASSIGNMENT':
      return {
        ...state,
        licenseAssignments: state.licenseAssignments.map((assignment) =>
          assignment.id === action.payload.id ? action.payload : assignment
        ),
      };
    case 'DELETE_LICENSE_ASSIGNMENT':
      return {
        ...state,
        licenseAssignments: state.licenseAssignments.filter((assignment) => assignment.id !== action.payload),
      };
    case 'LOAD_LICENSE_ASSIGNMENTS':
      return { ...state, licenseAssignments: action.payload };
    default:
      return state;
  }
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(licenseReducer, initialState);

  // Load all data from database
  const loadAllData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Check if Supabase is configured
      if (!supabase) {
        dispatch({ type: 'SET_ERROR', payload: 'Sistema não configurado. Configure as variáveis de ambiente do Supabase no arquivo .env' });
        return;
      }

      const [
        licenses,
        microsoft365Pools,
        microsoft365Users,
        licensePools,
        licenseAssignments
      ] = await Promise.all([
        legacyLicensesService.getAll(),
        microsoft365PoolsService.getAll(),
        microsoft365UsersService.getAll(),
        licensePoolsService.getAll(),
        licenseAssignmentsService.getAll()
      ]);

      dispatch({ type: 'LOAD_LICENSES', payload: licenses });
      dispatch({ type: 'LOAD_M365_POOLS', payload: microsoft365Pools });
      dispatch({ type: 'LOAD_M365_USERS', payload: microsoft365Users });
      dispatch({ type: 'LOAD_LICENSE_POOLS', payload: licensePools });
      dispatch({ type: 'LOAD_LICENSE_ASSIGNMENTS', payload: licenseAssignments });
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      if (errorMessage.includes('Supabase não está configurado')) {
        toast.error('Configure o Supabase no arquivo .env para usar o sistema');
      } else {
        toast.error('Erro ao carregar dados do banco');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Microsoft 365 Pool operations
  const saveMicrosoft365Pool = useCallback(async (pool: Partial<Microsoft365LicensePool>) => {
    try {
      if (pool.id && state.microsoft365Pools.find(p => p.id === pool.id)) {
        const updated = await microsoft365PoolsService.update(pool.id, pool);
        dispatch({ type: 'UPDATE_M365_POOL', payload: updated });
      } else {
        const created = await microsoft365PoolsService.create(pool);
        dispatch({ type: 'ADD_M365_POOL', payload: created });
      }
    } catch (error) {
      console.error('Error saving Microsoft 365 pool:', error);
      toast.error('Erro ao salvar contrato de licenças');
      throw error;
    }
  }, [state.microsoft365Pools]);

  const deleteMicrosoft365Pool = useCallback(async (id: string) => {
    try {
      await microsoft365PoolsService.delete(id);
      dispatch({ type: 'DELETE_M365_POOL', payload: id });
    } catch (error) {
      console.error('Error deleting Microsoft 365 pool:', error);
      toast.error('Erro ao excluir contrato de licenças');
      throw error;
    }
  }, []);

  // Microsoft 365 User operations
  const saveMicrosoft365User = useCallback(async (user: Partial<Microsoft365User>) => {
    try {
      if (user.id && state.microsoft365Users.find(u => u.id === user.id)) {
        const updated = await microsoft365UsersService.update(user.id, user);
        dispatch({ type: 'UPDATE_M365_USER', payload: updated });
      } else {
        const created = await microsoft365UsersService.create(user);
        dispatch({ type: 'ADD_M365_USER', payload: created });
      }
    } catch (error) {
      console.error('Error saving Microsoft 365 user:', error);
      toast.error('Erro ao salvar usuário');
      throw error;
    }
  }, [state.microsoft365Users]);

  const deleteMicrosoft365User = useCallback(async (id: string) => {
    try {
      await microsoft365UsersService.delete(id);
      dispatch({ type: 'DELETE_M365_USER', payload: id });
    } catch (error) {
      console.error('Error deleting Microsoft 365 user:', error);
      toast.error('Erro ao excluir usuário');
      throw error;
    }
  }, []);

  // License Pool operations
  const saveLicensePool = useCallback(async (pool: Partial<LicensePool>) => {
    try {
      if (pool.id && state.licensePools.find(p => p.id === pool.id)) {
        const updated = await licensePoolsService.update(pool.id, pool);
        dispatch({ type: 'UPDATE_LICENSE_POOL', payload: updated });
      } else {
        const created = await licensePoolsService.create(pool);
        dispatch({ type: 'ADD_LICENSE_POOL', payload: created });
      }
    } catch (error) {
      console.error('Error saving license pool:', error);
      toast.error('Erro ao salvar contrato de licenças');
      throw error;
    }
  }, [state.licensePools]);

  const deleteLicensePool = useCallback(async (id: string) => {
    try {
      await licensePoolsService.delete(id);
      dispatch({ type: 'DELETE_LICENSE_POOL', payload: id });
    } catch (error) {
      console.error('Error deleting license pool:', error);
      toast.error('Erro ao excluir contrato de licenças');
      throw error;
    }
  }, []);

  // License Assignment operations
  const saveLicenseAssignment = useCallback(async (assignment: Partial<LicenseAssignment>) => {
    try {
      if (assignment.id && state.licenseAssignments.find(a => a.id === assignment.id)) {
        const updated = await licenseAssignmentsService.update(assignment.id, assignment);
        dispatch({ type: 'UPDATE_LICENSE_ASSIGNMENT', payload: updated });
      } else {
        const created = await licenseAssignmentsService.create(assignment);
        dispatch({ type: 'ADD_LICENSE_ASSIGNMENT', payload: created });
      }
    } catch (error) {
      console.error('Error saving license assignment:', error);
      toast.error('Erro ao salvar atribuição');
      throw error;
    }
  }, [state.licenseAssignments]);

  const deleteLicenseAssignment = useCallback(async (id: string) => {
    try {
      await licenseAssignmentsService.delete(id);
      dispatch({ type: 'DELETE_LICENSE_ASSIGNMENT', payload: id });
    } catch (error) {
      console.error('Error deleting license assignment:', error);
      toast.error('Erro ao excluir atribuição');
      throw error;
    }
  }, []);

  // Legacy License operations
  const saveLicense = useCallback(async (license: Partial<License>) => {
    try {
      if (license.id && state.licenses.find(l => l.id === license.id)) {
        const updated = await legacyLicensesService.update(license.id, license);
        dispatch({ type: 'UPDATE_LICENSE', payload: updated });
      } else {
        const created = await legacyLicensesService.create(license);
        dispatch({ type: 'ADD_LICENSE', payload: created });
      }
    } catch (error) {
      console.error('Error saving license:', error);
      toast.error('Erro ao salvar licença');
      throw error;
    }
  }, [state.licenses]);

  const deleteLicense = useCallback(async (id: string) => {
    try {
      await legacyLicensesService.delete(id);
      dispatch({ type: 'DELETE_LICENSE', payload: id });
    } catch (error) {
      console.error('Error deleting license:', error);
      toast.error('Erro ao excluir licença');
      throw error;
    }
  }, []);

  const updatePoolAvailability = useCallback(() => {
    // This is now handled automatically by the database
    // We can trigger a reload if needed
  }, []);

  const getStats = useCallback((): Record<string, LicenseStats> => {
    const stats: Record<string, LicenseStats> = {};
    const types = ['microsoft365', 'sophos', 'server', 'windows'];

    types.forEach((type) => {
      if (type === 'microsoft365') {
        const totalLicenses = state.microsoft365Pools.reduce((sum, pool) => sum + pool.totalLicenses, 0);
        const activeUsers = state.microsoft365Users.filter(user => user.isActive && user.assignedLicenses.length > 0);
        const activeLicensesCount = activeUsers.reduce((sum, user) => sum + user.assignedLicenses.length, 0);
        
        const now = new Date();
        const expiredPools = state.microsoft365Pools.filter((pool) => {
          if (!pool.expirationDate) return false;
          return new Date(pool.expirationDate) < now;
        });
        const expiredLicensesCount = expiredPools.reduce((sum, pool) => sum + pool.totalLicenses, 0);

        stats[type] = {
          total: totalLicenses,
          active: activeLicensesCount,
          inactive: 0,
          expired: expiredLicensesCount,
          expiringSoon: 0,
        };
      } else {
        const poolsOfType = state.licensePools.filter(pool => pool.type === type);
        const licensesOfType = state.licenses.filter((license) => license.type === type);
        const assignmentsOfType = state.licenseAssignments.filter(assignment => assignment.type === type);
        
        const totalFromPools = poolsOfType.reduce((sum, pool) => sum + pool.totalLicenses, 0);
        const totalFromLicenses = licensesOfType.length;
        const total = totalFromPools + totalFromLicenses;
        
        const activeFromAssignments = assignmentsOfType.filter(assignment => assignment.isActive).length;
        const activeFromLicenses = licensesOfType.filter(license => license.isActive).length;
        const active = activeFromAssignments + activeFromLicenses;
        
        const now = new Date();
        const expiredPools = poolsOfType.filter((pool) => {
          if (!pool.expirationDate) return false;
          return new Date(pool.expirationDate) < now;
        });
        const expiredLicenses = licensesOfType.filter((license) => {
          if (!license.expirationDate) return false;
          return new Date(license.expirationDate) < now;
        });
        
        const expiredFromPools = expiredPools.reduce((sum, pool) => sum + pool.totalLicenses, 0);
        const expiredFromLicenses = expiredLicenses.length;
        const expired = expiredFromPools + expiredFromLicenses;

        stats[type] = {
          total,
          active,
          inactive: 0,
          expired,
          expiringSoon: 0,
        };
      }
    });

    return stats;
  }, [state.licenses, state.microsoft365Pools, state.microsoft365Users, state.licensePools, state.licenseAssignments]);

  const getFilteredLicenses = useCallback((): License[] => {
    let filtered = state.licenses;

    if (state.selectedCategory !== 'dashboard' && state.selectedCategory !== 'microsoft365') {
      filtered = filtered.filter((license) => license.type === state.selectedCategory);
    }

    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (license) =>
          license.name.toLowerCase().includes(term) ||
          (license.notes && license.notes.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [state.licenses, state.selectedCategory, state.searchTerm]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <LicenseContext.Provider value={{ 
      state, 
      dispatch, 
      getStats, 
      getFilteredLicenses, 
      updatePoolAvailability,
      loadAllData,
      saveMicrosoft365Pool,
      deleteMicrosoft365Pool,
      saveMicrosoft365User,
      deleteMicrosoft365User,
      saveLicensePool,
      deleteLicensePool,
      saveLicenseAssignment,
      deleteLicenseAssignment,
      saveLicense,
      deleteLicense
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}