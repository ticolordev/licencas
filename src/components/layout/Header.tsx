import React from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  licenseList: 'Lista de Licenças',
  sophos: 'Licenças Sophos',
  server: 'Licenças de Servidores',
  windows: 'Licenças Windows',
};

export function Header({ 
  searchTerm, 
  onSearchChange, 
  onAddLicense, 
  onToggleSidebar,
  selectedCategory 
}: HeaderProps) {
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
          {!['dashboard', 'microsoft365', 'licenseList'].includes(selectedCategory) && (
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
          
          {!['dashboard', 'microsoft365', 'licenseList'].includes(selectedCategory) && (
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