import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Microsoft365User, Microsoft365LicensePool } from '@/types/license';

interface Microsoft365UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<Microsoft365User>) => void;
  user: Microsoft365User | null;
  availablePools: Microsoft365LicensePool[];
}

export function Microsoft365UserModal({ isOpen, onClose, onSave, user, availablePools }: Microsoft365UserModalProps) {
  const [formData, setFormData] = useState<Partial<Microsoft365User>>({
    name: '',
    email: '',
    assignedLicenses: [],
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    } else {
      setFormData({
        name: '',
        email: '',
        assignedLicenses: [],
        isActive: true,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const now = new Date().toISOString();
    const userData = {
      ...formData,
      id: user?.id || crypto.randomUUID(),
      createdAt: user?.createdAt || now,
      updatedAt: now,
    };

    onSave(userData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLicenseToggle = (poolId: string, checked: boolean) => {
    const currentLicenses = formData.assignedLicenses || [];
    if (checked) {
      handleInputChange('assignedLicenses', [...currentLicenses, poolId]);
    } else {
      handleInputChange('assignedLicenses', currentLicenses.filter(id => id !== poolId));
    }
  };

  const canAssignLicense = (pool: Microsoft365LicensePool) => {
    const isCurrentlyAssigned = (formData.assignedLicenses || []).includes(pool.id);
    return isCurrentlyAssigned || pool.availableLicenses > 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 bg-white border-2 border-gray-400 hover:border-red-500 hover:bg-red-50 shadow-sm"
          >
            <X className="h-4 w-4 text-gray-800 hover:text-red-600 font-bold" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome do Usuário *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@empresa.com"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Usuário Ativo</Label>
          </div>

          <div>
            <Label className="text-base font-medium">Licenças Atribuídas</Label>
            <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
              {availablePools.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum contrato de licenças disponível</p>
              ) : (
                availablePools.map((pool) => {
                  const isAssigned = (formData.assignedLicenses || []).includes(pool.id);
                  const canAssign = canAssignLicense(pool);
                  
                  return (
                    <div key={pool.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`license-${pool.id}`}
                        checked={isAssigned}
                        onCheckedChange={(checked) => handleLicenseToggle(pool.id, checked as boolean)}
                        disabled={!canAssign && !isAssigned}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={`license-${pool.id}`}
                          className={`text-sm font-medium ${!canAssign && !isAssigned ? 'text-gray-400' : 'text-gray-900'}`}
                        >
                          {pool.licenseType}
                        </Label>
                        <div className="text-xs text-gray-500 mt-1">
                          {pool.availableLicenses} disponível{pool.availableLicenses !== 1 ? 'is' : ''} de {pool.totalLicenses}
                        </div>
                        {!canAssign && !isAssigned && (
                          <div className="text-xs text-red-500 mt-1">
                            Sem licenças disponíveis
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {user ? 'Atualizar' : 'Criar'} Usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}