import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { License, LicenseStats, Microsoft365LicensePool, Microsoft365User } from '@/types/license';

interface LicenseState {
  licenses: License[];
  microsoft365Pools: Microsoft365LicensePool[];
  microsoft365Users: Microsoft365User[];
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
  | { type: 'LOAD_M365_USERS'; payload: Microsoft365User[] };

const initialState: LicenseState = {
  licenses: [],
  microsoft365Pools: [],
  microsoft365Users: [],
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
        const inactiveUsers = state.microsoft365Users.filter(user => !user.isActive && user.assignedLicenses.length > 0);
        
        // Contar licenças atribuídas (considerando que um usuário pode ter múltiplas licenças)
        const activeLicensesCount = activeUsers.reduce((sum, user) => sum + user.assignedLicenses.length, 0);
        const inactiveLicensesCount = inactiveUsers.reduce((sum, user) => sum + user.assignedLicenses.length, 0);
        
        // Check for pools expiring in the next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoon = state.microsoft365Pools.filter((pool) => {
          if (!pool.expirationDate) return false;
          const expirationDate = new Date(pool.expirationDate);
          return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
        }).length;

        stats[type] = {
          total: totalLicenses,
          active: activeLicensesCount,
          inactive: inactiveLicensesCount,
          expiringSoon: expiringSoon,
        };
      } else {
        const licensesOfType = state.licenses.filter((license) => license.type === type);
        const active = licensesOfType.filter((license) => license.isActive);
        const inactive = licensesOfType.filter((license) => !license.isActive);
        
        // Check for licenses expiring in the next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoon = licensesOfType.filter((license) => {
          if (!license.expirationDate) return false;
          const expirationDate = new Date(license.expirationDate);
          return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
        });

        stats[type] = {
          total: licensesOfType.length,
          active: active.length,
          inactive: inactive.length,
          expiringSoon: expiringSoon.length,
        };
      }
    });

    return stats;
  }, [state.licenses, state.microsoft365Pools, state.microsoft365Users]);

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