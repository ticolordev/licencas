import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { License } from '@/types/license';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (license: Partial<License>) => void;
  license: License | null;
  licenseType: string;
}

export function LicenseModal({ isOpen, onClose, onSave, license, licenseType }: LicenseModalProps) {
  const [formData, setFormData] = useState<Partial<License>>({
    name: '',
    isActive: true,
    expirationDate: '',
    cost: 0,
    notes: '',
  });

  useEffect(() => {
    if (license) {
      setFormData({ ...license });
    } else {
      setFormData({
        name: '',
        isActive: true,
        expirationDate: '',
        cost: 0,
        notes: '',
        type: licenseType as any,
      });
    }
  }, [license, licenseType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const licenseData = {
      ...formData,
      id: license?.id || crypto.randomUUID(),
      createdAt: license?.createdAt || now,
      updatedAt: now,
    };

    onSave(licenseData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderTypeSpecificFields = () => {
    switch (licenseType) {
      case 'microsoft365':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planType">Tipo de Plano</Label>
                <Select
                  value={(formData as any).planType || ''}
                  onValueChange={(value) => handleInputChange('planType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business Basic">Business Basic</SelectItem>
                    <SelectItem value="Business Standard">Business Standard</SelectItem>
                    <SelectItem value="Business Premium">Business Premium</SelectItem>
                    <SelectItem value="Enterprise E1">Enterprise E1</SelectItem>
                    <SelectItem value="Enterprise E3">Enterprise E3</SelectItem>
                    <SelectItem value="Enterprise E5">Enterprise E5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedUser">Usuário Atribuído</Label>
                <Input
                  id="assignedUser"
                  value={(formData as any).assignedUser || ''}
                  onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email do Usuário</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={(formData as any).userEmail || ''}
                  onChange={(e) => handleInputChange('userEmail', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
          </>
        );

      case 'sophos':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productType">Tipo de Produto</Label>
                <Select
                  value={(formData as any).productType || ''}
                  onValueChange={(value) => handleInputChange('productType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Firewall">Firewall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deviceCount">Quantidade de Dispositivos</Label>
                <Input
                  id="deviceCount"
                  type="number"
                  value={(formData as any).deviceCount || ''}
                  onChange={(e) => handleInputChange('deviceCount', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="serialNumber">Número de Série (Opcional)</Label>
              <Input
                id="serialNumber"
                value={(formData as any).serialNumber || ''}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="Serial do dispositivo"
              />
            </div>
          </>
        );

      case 'server':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Nome do Produto</Label>
                <Input
                  id="productName"
                  value={(formData as any).productName || ''}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="Ex: SQL Server"
                />
              </div>
              <div>
                <Label htmlFor="version">Versão</Label>
                <Input
                  id="version"
                  value={(formData as any).version || ''}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="Ex: 2022 Standard"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serverName">Nome do Servidor</Label>
                <Input
                  id="serverName"
                  value={(formData as any).serverName || ''}
                  onChange={(e) => handleInputChange('serverName', e.target.value)}
                  placeholder="Nome do servidor"
                />
              </div>
              <div>
                <Label htmlFor="licenseKey">Chave da Licença (Opcional)</Label>
                <Input
                  id="licenseKey"
                  value={(formData as any).licenseKey || ''}
                  onChange={(e) => handleInputChange('licenseKey', e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX"
                />
              </div>
            </div>
          </>
        );

      case 'windows':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="windowsType">Tipo do Windows</Label>
                <Select
                  value={(formData as any).windowsType || ''}
                  onValueChange={(value) => handleInputChange('windowsType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="version">Versão</Label>
                <Input
                  id="version"
                  value={(formData as any).version || ''}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="Ex: 2022 Standard"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deviceName">Nome do Dispositivo</Label>
                <Input
                  id="deviceName"
                  value={(formData as any).deviceName || ''}
                  onChange={(e) => handleInputChange('deviceName', e.target.value)}
                  placeholder="Nome do dispositivo"
                />
              </div>
              <div>
                <Label htmlFor="licenseKey">Chave da Licença</Label>
                <Input
                  id="licenseKey"
                  value={(formData as any).licenseKey || ''}
                  onChange={(e) => handleInputChange('licenseKey', e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX"
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {license ? 'Editar Licença' : 'Nova Licença'}
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
            <Label htmlFor="name">Nome da Licença</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome descritivo da licença"
              required
            />
          </div>

          {renderTypeSpecificFields()}

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Licença Ativa</Label>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações adicionais sobre a licença"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {license ? 'Atualizar' : 'Criar'} Licença
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}