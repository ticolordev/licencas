import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Server, 
  Monitor,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'microsoft365',
    label: 'Microsoft 365',
    icon: Users,
  },
  {
    id: 'sophos',
    label: 'Sophos',
    icon: Shield,
  },
  {
    id: 'server',
    label: 'Servidores',
    icon: Server,
  },
  {
    id: 'windows',
    label: 'Windows',
    icon: Monitor,
  },
];

export function Sidebar({ selectedCategory, onCategoryChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div
      className={cn(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-800">Licenças</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onCategoryChange(item.id)}
                  className={cn(
                    'w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sistema de Gerenciamento de Licenças v1.0
          </p>
        </div>
      )}
    </div>
  );
}