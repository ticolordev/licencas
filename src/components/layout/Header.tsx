import React from 'react';
import { Search, Plus, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddLicense: () => void;
  onToggleSidebar: () => void;
  selectedCategory: string;
}

const categoryLabels = {
  dashboard: 'Dashboard',
  microsoft365: 'Licenças Microsoft 365',
  sophos: 'Licenças Sophos',
  server: 'Licenças de Servidores',
  windows: 'Licenças Windows',
  admin: 'Painel Administrativo',
};

export function Header({ 
  searchTerm, 
  onSearchChange, 
  onAddLicense, 
  onToggleSidebar,
  selectedCategory,
}: HeaderProps) {
  const { logout, state } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie suas licenças de software
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Sair</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {state.user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {state.user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{state.user?.name}</p>
                <p className="text-xs text-gray-500">{state.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!['dashboard', 'microsoft365', 'sophos', 'server', 'windows'].includes(selectedCategory) && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar licenças..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          
          {!['dashboard', 'microsoft365', 'sophos', 'server', 'windows', 'admin'].includes(selectedCategory) && (
            <Button onClick={onAddLicense} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Licença
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}