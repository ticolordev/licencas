import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LicenseAssignment, LicensePool } from '@/types/license';

interface LicenseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Partial<LicenseAssignment>) => void;
  assignment: LicenseAssignment | null;
  availablePools: LicensePool[];
  licenseType: 'sophos' | 'server' | 'windows';
}

const typeLabels = {
  sophos: 'Sophos',
  server: 'Servidor',
  windows: 'Windows',
};

export function LicenseAssignmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  assignment, 
  availablePools, 
  licenseType 
}: LicenseAssignmentModalProps) {
  const [formData, setFormData] = useState<Partial<LicenseAssignment>>({
    poolId: '',
    deviceName: '',
    serverName: '',
    userEmail: '',
    serialNumber: '',
    licenseKey: '',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    if (assignment) {
      setFormData({ ...assignment });
    } else {
      setFormData({
        poolId: '',
        deviceName: '',
        serverName: '',
        userEmail: '',
        serialNumber: '',
        licenseKey: '',
        isActive: true,
        notes: '',
      });
    }
  }, [assignment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poolId) {
      alert('Por favor, selecione um pool de licenças.');
      return;
    }

    if (licenseType === 'server' && !formData.serverName) {
      alert('Por favor, informe o nome do servidor.');
      return;
    }

    if (licenseType !== 'server' && !formData.deviceName) {
      alert('Por favor, informe o nome do dispositivo.');
      return;
    }
    
    const now = new Date().toISOString();
    const assignmentData = {
      ...formData,
      id: assignment?.id || crypto.randomUUID(),
      type: licenseType,
      createdAt: assignment?.createdAt || now,
      updatedAt: now,
    };

    onSave(assignmentData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canAssignToPool = (pool: LicensePool) => {
    const isCurrentlyAssigned = formData.poolId === pool.id;
    return isCurrentlyAssigned || pool.availableLicenses > 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {assignment ? 'Editar Atribuição' : 'Nova Atribuição'} - {typeLabels[licenseType]}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-800 hover:text-black hover:bg-gray-200 border border-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="poolId">Pool de Licenças *</Label>
            <Select
              value={formData.poolId || ''}
              onValueChange={(value) => handleInputChange('poolId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pool de licenças" />
              </SelectTrigger>
              <SelectContent>
                {availablePools.length === 0 ? (
                  <SelectItem value="" disabled>Nenhum pool disponível</SelectItem>
                ) : (
                  availablePools.map((pool) => {
                    const canAssign = canAssignToPool(pool);
                    return (
                      <SelectItem 
                        key={pool.id} 
                        value={pool.id}
                        disabled={!canAssign}
                      >
                        {pool.name} ({pool.availableLicenses} disponível{pool.availableLicenses !== 1 ? 'is' : ''})
                        {!canAssign && ' - Sem licenças disponíveis'}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {licenseType === 'server' ? (
            <div>
              <Label htmlFor="serverName">Nome do Servidor *</Label>
              <Input
                id="serverName"
                value={formData.serverName || ''}
                onChange={(e) => handleInputChange('serverName', e.target.value)}
                placeholder="Ex: SRV-DB-01"
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="deviceName">Nome do Dispositivo *</Label>
              <Input
                id="deviceName"
                value={formData.deviceName || ''}
                onChange={(e) => handleInputChange('deviceName', e.target.value)}
                placeholder="Ex: WS-ADMIN-01"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="userEmail">Email do Usuário</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail || ''}
              onChange={(e) => handleInputChange('userEmail', e.target.value)}
              placeholder="usuario@empresa.com"
            />
          </div>

          {licenseType === 'sophos' && (
            <div>
              <Label htmlFor="serialNumber">Número de Série</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber || ''}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="Serial do dispositivo"
              />
            </div>
          )}

          <div>
            <Label htmlFor="licenseKey">Chave da Licença</Label>
            <Input
              id="licenseKey"
              value={formData.licenseKey || ''}
              onChange={(e) => handleInputChange('licenseKey', e.target.value)}
              placeholder="XXXXX-XXXXX-XXXXX"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Atribuição Ativa</Label>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações sobre esta atribuição"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {assignment ? 'Atualizar' : 'Criar'} Atribuição
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}