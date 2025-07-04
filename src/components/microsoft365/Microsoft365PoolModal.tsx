import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Microsoft365LicensePool } from '@/types/license';

interface Microsoft365PoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pool: Partial<Microsoft365LicensePool>) => void;
  pool: Microsoft365LicensePool | null;
}

const licenseTypes = [
  'Exchange Online (Plan 1)',
  'Exchange Online (Plan 2)',
  'Exchange Online Kiosk',
  'Microsoft 365 Business Standard',
  'Microsoft Teams',
  'Power BI Pro'
];

export function Microsoft365PoolModal({ isOpen, onClose, onSave, pool }: Microsoft365PoolModalProps) {
  const [formData, setFormData] = useState<Partial<Microsoft365LicensePool>>({
    licenseType: 'Microsoft 365 Business Standard',
    totalLicenses: 0,
    assignedLicenses: 0,
    availableLicenses: 0,
    cost: 0,
    expirationDate: '',
    notes: '',
  });

  useEffect(() => {
    if (pool) {
      setFormData({ ...pool });
    } else {
      setFormData({
        licenseType: 'Microsoft 365 Business Standard',
        totalLicenses: 0,
        assignedLicenses: 0,
        availableLicenses: 0,
        cost: 0,
        expirationDate: '',
        notes: '',
      });
    }
  }, [pool, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.licenseType || !formData.totalLicenses) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const now = new Date().toISOString();
    const poolData = {
      ...formData,
      id: pool?.id || crypto.randomUUID(),
      assignedLicenses: pool?.assignedLicenses || 0,
      availableLicenses: (formData.totalLicenses || 0) - (pool?.assignedLicenses || 0),
      createdAt: pool?.createdAt || now,
      updatedAt: now,
    };

    onSave(poolData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {pool ? 'Editar Contrato de Licenças' : 'Novo Contrato de Licenças'}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-800 hover:text-black hover:bg-gray-200 border border-gray-300"
          >
            <X className="h-4 w-4 text-black" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="licenseType">Tipo de Licença *</Label>
            <Select
              value={formData.licenseType || ''}
              onValueChange={(value) => handleInputChange('licenseType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de licença" />
              </SelectTrigger>
              <SelectContent>
                {licenseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="totalLicenses">Quantidade Total de Licenças *</Label>
            <Input
              id="totalLicenses"
              type="number"
              min="0"
              value={formData.totalLicenses || ''}
              onChange={(e) => handleInputChange('totalLicenses', parseInt(e.target.value) || 0)}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="cost">Custo por Licença (R$)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost || ''}
              onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="expirationDate">Data de Expiração</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate || ''}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações sobre este contrato de licenças"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {pool ? 'Atualizar' : 'Criar'} Contrato
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}