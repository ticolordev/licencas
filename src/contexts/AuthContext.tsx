import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: { email: string; password: string; name: string }) => Promise<void>;
  updateUser: (id: string, userData: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  getAllUsers: () => Promise<AdminUser[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple password hashing (in production, use proper bcrypt)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt123'); // Simple salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('auth_user');
        if (userData) {
          const user = JSON.parse(userData);
          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!supabase) {
        toast.error('Sistema não configurado corretamente');
        return false;
      }

      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Email ou senha incorretos');
        return false;
      }

      // For demo purposes, accept any password for existing users
      // In production, use proper password verification
      const isValidPassword = password === 'admin123' || await verifyPassword(password, data.password_hash);
      
      if (!isValidPassword) {
        toast.error('Email ou senha incorretos');
        return false;
      }

      const user: AdminUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      localStorage.setItem('auth_user', JSON.stringify(user));
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    toast.success('Logout realizado com sucesso!');
  };

  const createUser = async (userData: { email: string; password: string; name: string }) => {
    try {
      if (!supabase) {
        throw new Error('Sistema não configurado');
      }

      const passwordHash = await hashPassword(userData.password);

      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          name: userData.name,
          is_active: true,
        });

      if (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }

      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<AdminUser>) => {
    try {
      if (!supabase) {
        throw new Error('Sistema não configurado');
      }

      const { error } = await supabase
        .from('admin_users')
        .update({
          email: userData.email,
          name: userData.name,
          is_active: userData.is_active,
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (!supabase) {
        throw new Error('Sistema não configurado');
      }

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao excluir usuário: ${error.message}`);
      }

      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir usuário');
      throw error;
    }
  };

  const changePassword = async (id: string, newPassword: string) => {
    try {
      if (!supabase) {
        throw new Error('Sistema não configurado');
      }

      const passwordHash = await hashPassword(newPassword);

      const { error } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao alterar senha: ${error.message}`);
      }

      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha');
      throw error;
    }
  };

  const getAllUsers = async (): Promise<AdminUser[]> => {
    try {
      if (!supabase) {
        throw new Error('Sistema não configurado');
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao buscar usuários');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      changePassword,
      getAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}