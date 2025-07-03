import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { License, LicenseStats, Microsoft365LicensePool, Microsoft365User, LicensePool, LicenseAssignment } from '@/types/license';

interface LicenseState {
  licenses: License[];
  microsoft365Pools: Microsoft365LicensePool[];
  microsoft365Users: Microsoft365User[];
  licensePools: LicensePool[];
  licenseAssignments: LicenseAssignment[];
  selectedCategory: string;
  searchTerm: string;
}

type LicenseAction =
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
};

const LicenseContext = createContext<{
  state: LicenseState;
  dispatch: React.Dispatch<LicenseAction>;
  getStats: () => Record<string, LicenseStats>;
  getFilteredLicenses: () => License[];
  updatePoolAvailability: () => void;
} | null>(null);

function licenseReducer(state: LicenseState, action: LicenseAction): LicenseState {
  let newState: LicenseState;
  
  switch (action.type) {
    case 'ADD_LICENSE':
      newState = {
        ...state,
        licenses: [...state.licenses, action.payload],
      };
      break;
    case 'UPDATE_LICENSE':
      newState = {
        ...state,
        licenses: state.licenses.map((license) =>
          license.id === action.payload.id ? action.payload : license
        ),
      };
      break;
    case 'DELETE_LICENSE':
      newState = {
        ...state,
        licenses: state.licenses.filter((license) => license.id !== action.payload),
      };
      break;
    case 'SET_CATEGORY':
      newState = {
        ...state,
        selectedCategory: action.payload,
      };
      break;
    case 'SET_SEARCH':
      newState = {
        ...state,
        searchTerm: action.payload,
      };
      break;
    case 'LOAD_LICENSES':
      newState = {
        ...state,
        licenses: action.payload,
      };
      break;
    case 'ADD_M365_POOL':
      newState = {
        ...state,
        microsoft365Pools: [...state.microsoft365Pools, action.payload],
      };
      break;
    case 'UPDATE_M365_POOL':
      newState = {
        ...state,
        microsoft365Pools: state.microsoft365Pools.map((pool) =>
          pool.id === action.payload.id ? action.payload : pool
        ),
      };
      break;
    case 'DELETE_M365_POOL':
      newState = {
        ...state,
        microsoft365Pools: state.microsoft365Pools.filter((pool) => pool.id !== action.payload),
      };
      break;
    case 'LOAD_M365_POOLS':
      newState = {
        ...state,
        microsoft365Pools: action.payload,
      };
      break;
    case 'ADD_M365_USER':
      newState = {
        ...state,
        microsoft365Users: [...state.microsoft365Users, action.payload],
      };
      break;
    case 'UPDATE_M365_USER':
      newState = {
        ...state,
        microsoft365Users: state.microsoft365Users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
      break;
    case 'DELETE_M365_USER':
      newState = {
        ...state,
        microsoft365Users: state.microsoft365Users.filter((user) => user.id !== action.payload),
      };
      break;
    case 'LOAD_M365_USERS':
      newState = {
        ...state,
        microsoft365Users: action.payload,
      };
      break;
    case 'ADD_LICENSE_POOL':
      newState = {
        ...state,
        licensePools: [...state.licensePools, action.payload],
      };
      break;
    case 'UPDATE_LICENSE_POOL':
      newState = {
        ...state,
        licensePools: state.licensePools.map((pool) =>
          pool.id === action.payload.id ? action.payload : pool
        ),
      };
      break;
    case 'DELETE_LICENSE_POOL':
      newState = {
        ...state,
        licensePools: state.licensePools.filter((pool) => pool.id !== action.payload),
      };
      break;
    case 'LOAD_LICENSE_POOLS':
      newState = {
        ...state,
        licensePools: action.payload,
      };
      break;
    case 'ADD_LICENSE_ASSIGNMENT':
      newState = {
        ...state,
        licenseAssignments: [...state.licenseAssignments, action.payload],
      };
      break;
    case 'UPDATE_LICENSE_ASSIGNMENT':
      newState = {
        ...state,
        licenseAssignments: state.licenseAssignments.map((assignment) =>
          assignment.id === action.payload.id ? action.payload : assignment
        ),
      };
      break;
    case 'DELETE_LICENSE_ASSIGNMENT':
      newState = {
        ...state,
        licenseAssignments: state.licenseAssignments.filter((assignment) => assignment.id !== action.payload),
      };
      break;
    case 'LOAD_LICENSE_ASSIGNMENTS':
      newState = {
        ...state,
        licenseAssignments: action.payload,
      };
      break;
    default:
      return state;
  }

  // Automatically update pool availability after any Microsoft 365 change
  if (action.type.includes('M365')) {
    const updatedPools = newState.microsoft365Pools.map(pool => {
      const assignedCount = newState.microsoft365Users.filter(user => 
        user.assignedLicenses.includes(pool.id)
      ).length;
      
      return {
        ...pool,
        assignedLicenses: assignedCount,
        availableLicenses: pool.totalLicenses - assignedCount
      };
    });
    
    newState = {
      ...newState,
      microsoft365Pools: updatedPools,
    };
  }

  // Automatically update license pool availability
  if (action.type.includes('LICENSE_POOL') || action.type.includes('LICENSE_ASSIGNMENT')) {
    const updatedLicensePools = newState.licensePools.map(pool => {
      const assignedCount = newState.licenseAssignments.filter(assignment => 
        assignment.poolId === pool.id && assignment.isActive
      ).length;
      
      return {
        ...pool,
        assignedLicenses: assignedCount,
        availableLicenses: pool.totalLicenses - assignedCount
      };
    });
    
    newState = {
      ...newState,
      licensePools: updatedLicensePools,
    };
  }

  return newState;
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(licenseReducer, initialState);

  const updatePoolAvailability = useCallback(() => {
    const updatedPools = state.microsoft365Pools.map(pool => {
      const assignedCount = state.microsoft365Users.filter(user => 
        user.assignedLicenses.includes(pool.id)
      ).length;
      
      return {
        ...pool,
        assignedLicenses: assignedCount,
        availableLicenses: pool.totalLicenses - assignedCount
      };
    });
    
    // Only update if there are actual changes
    const hasChanges = updatedPools.some((pool, index) => {
      const currentPool = state.microsoft365Pools[index];
      return currentPool && (
        currentPool.assignedLicenses !== pool.assignedLicenses ||
        currentPool.availableLicenses !== pool.availableLicenses
      );
    });

    if (hasChanges) {
      dispatch({ type: 'LOAD_M365_POOLS', payload: updatedPools });
    }
  }, [state.microsoft365Pools, state.microsoft365Users]);

  const getStats = useCallback((): Record<string, LicenseStats> => {
    const stats: Record<string, LicenseStats> = {};
    const types = ['microsoft365', 'sophos', 'server', 'windows'];

    types.forEach((type) => {
      if (type === 'microsoft365') {
        // Calcular totais consolidados
        const totalLicenses = state.microsoft365Pools.reduce((sum, pool) => sum + pool.totalLicenses, 0);
        
        // Contar usuários ativos e inativos
        const activeUsers = state.microsoft365Users.filter(user => user.isActive && user.assignedLicenses.length > 0);
        
        // Contar licenças atribuídas (considerando que um usuário pode ter múltiplas licenças)
        const activeLicensesCount = activeUsers.reduce((sum, user) => sum + user.assignedLicenses.length, 0);
        
        // Contar licenças expiradas (pools expirados)
        const now = new Date();
        const expiredPools = state.microsoft365Pools.filter((pool) => {
          if (!pool.expirationDate) return false;
          return new Date(pool.expirationDate) < now;
        });
        const expiredLicensesCount = expiredPools.reduce((sum, pool) => sum + pool.totalLicenses, 0);

        stats[type] = {
          total: totalLicenses,
          active: activeLicensesCount,
          inactive: 0, // Não usado mais
          expired: expiredLicensesCount,
          expiringSoon: 0, // Calculado separadamente em ExpiringLicenses
        };
      } else {
        // Para outros tipos, usar pools + licenças antigas
        const poolsOfType = state.licensePools.filter(pool => pool.type === type);
        const licensesOfType = state.licenses.filter((license) => license.type === type);
        const assignmentsOfType = state.licenseAssignments.filter(assignment => assignment.type === type);
        
        // Total de licenças (pools + licenças antigas)
        const totalFromPools = poolsOfType.reduce((sum, pool) => sum + pool.totalLicenses, 0);
        const totalFromLicenses = licensesOfType.length;
        const total = totalFromPools + totalFromLicenses;
        
        // Ativas (assignments ativos + licenças antigas ativas)
        const activeFromAssignments = assignmentsOfType.filter(assignment => assignment.isActive).length;
        const activeFromLicenses = licensesOfType.filter(license => license.isActive).length;
        const active = activeFromAssignments + activeFromLicenses;
        
        // Expiradas (pools expirados + licenças antigas expiradas)
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
          inactive: 0, // Não usado mais
          expired,
          expiringSoon: 0, // Calculado separadamente em ExpiringLicenses
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

  return (
    <LicenseContext.Provider value={{ state, dispatch, getStats, getFilteredLicenses, updatePoolAvailability }}>
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