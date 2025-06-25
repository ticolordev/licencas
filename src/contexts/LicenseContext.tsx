import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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
  switch (action.type) {
    case 'ADD_LICENSE':
      return {
        ...state,
        licenses: [...state.licenses, action.payload],
      };
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
      return {
        ...state,
        selectedCategory: action.payload,
      };
    case 'SET_SEARCH':
      return {
        ...state,
        searchTerm: action.payload,
      };
    case 'LOAD_LICENSES':
      return {
        ...state,
        licenses: action.payload,
      };
    case 'ADD_M365_POOL':
      return {
        ...state,
        microsoft365Pools: [...state.microsoft365Pools, action.payload],
      };
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
      return {
        ...state,
        microsoft365Pools: action.payload,
      };
    case 'ADD_M365_USER':
      return {
        ...state,
        microsoft365Users: [...state.microsoft365Users, action.payload],
      };
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
      return {
        ...state,
        microsoft365Users: action.payload,
      };
    default:
      return state;
  }
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(licenseReducer, initialState);

  const updatePoolAvailability = () => {
    const updatedPools = state.microsoft365Pools.map(pool => {
      const assignedCount = state.microsoft365Users.filter(user => 
        user.assignedLicenses.includes(pool.id) && user.isActive
      ).length;
      
      return {
        ...pool,
        assignedLicenses: assignedCount,
        availableLicenses: pool.totalLicenses - assignedCount
      };
    });

    updatedPools.forEach(pool => {
      dispatch({ type: 'UPDATE_M365_POOL', payload: pool });
    });
  };

  const getStats = (): Record<string, LicenseStats> => {
    const stats: Record<string, LicenseStats> = {};
    const types = ['microsoft365', 'sophos', 'server', 'windows'];

    types.forEach((type) => {
      if (type === 'microsoft365') {
        const totalUsers = state.microsoft365Users.length;
        const activeUsers = state.microsoft365Users.filter(user => user.isActive).length;
        const inactiveUsers = totalUsers - activeUsers;
        
        // Check for pools expiring in the next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoon = state.microsoft365Pools.filter((pool) => {
          if (!pool.expirationDate) return false;
          const expirationDate = new Date(pool.expirationDate);
          return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
        }).length;

        stats[type] = {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
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
  };

  const getFilteredLicenses = (): License[] => {
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
  };

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