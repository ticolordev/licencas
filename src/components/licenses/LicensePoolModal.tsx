import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LicensePool } from '@/types/license';

interface LicensePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pool: Partial<LicensePool>) => void;
  pool: LicensePool | null;
  licenseType: 'sophos' | 'server' | 'windows';
}

const typeLabels = {
  sophos: 'Sophos',
  server: 'Servidor',
  windows: 'Windows',
};

export function LicensePoolModal({ isOpen, onClose, onSave, pool, licenseType }: LicensePoolModalProps) {
  const [formData, setFormData] = useState<Partial<LicensePool>>({
    name: '',
    totalLicenses: 0,
    cost: 0,
    expirationDate: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pool) {
      setFormData({ ...pool });
    } else {
      setFormData({
        name: '',
        totalLicenses: 0,
        cost: 0,
        expirationDate: '',
        notes: '',
      });
    }
  }, [pool, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalLicenses) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const poolData = {
        ...formData,
        type: licenseType,
        totalLicenses: Number(formData.totalLicenses) || 0,
        cost: Number(formData.cost) || 0,
      };

      await onSave(poolData);
    } catch (error) {
      console.error('Error saving pool:', error);
    } finally {
      setIsSubmitting(false);
    }
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
            {pool ? 'Editar Contrato de Licenças' : 'Novo Contrato de Licenças'} - {typeLabels[licenseType]}
          </h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 bg-white border-2 border-gray-400 hover:border-red-500 hover:bg-red-50 shadow-sm"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 text-gray-800 hover:text-red-600 font-bold" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome do Contrato *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={`Ex: ${typeLabels[licenseType]} Empresarial 2024`}
              required
              disabled={isSubmitting}
            />
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="expirationDate">Data de Expiração</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate || ''}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (pool ? 'Atualizar' : 'Criar')} Contrato
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}