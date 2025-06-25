import React from 'react';
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { License } from '@/types/license';

interface LicenseTableProps {
  licenses: License[];
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
  title: string;
}

export function LicenseTable({ licenses, onEdit, onDelete, title }: LicenseTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderLicenseSpecificFields = (license: License) => {
    switch (license.type) {
      case 'microsoft365':
        return (
          <div className="text-sm text-gray-500">
            <div>Plano: {license.planType}</div>
            <div>Usuário: {license.assignedUser}</div>
            <div>Email: {license.userEmail}</div>
          </div>
        );
      case 'sophos':
        return (
          <div className="text-sm text-gray-500">
            <div>Produto: {license.productType}</div>
            <div>Dispositivos: {license.deviceCount}</div>
            {license.serialNumber && <div>Serial: {license.serialNumber}</div>}
          </div>
        );
      case 'server':
        return (
          <div className="text-sm text-gray-500">
            <div>Produto: {license.productName}</div>
            <div>Versão: {license.version}</div>
            <div>Servidor: {license.serverName}</div>
          </div>
        );
      case 'windows':
        return (
          <div className="text-sm text-gray-500">
            <div>Tipo: Windows {license.windowsType}</div>
            <div>Versão: {license.version}</div>
            <div>Dispositivo: {license.deviceName}</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-gray-500">
          {licenses.length} licença{licenses.length !== 1 ? 's' : ''} encontrada{licenses.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        {licenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma licença encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {licenses.map((license) => (
              <div
                key={license.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{license.name}</h3>
                      <Badge variant={license.isActive ? 'default' : 'secondary'}>
                        {license.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    {renderLicenseSpecificFields(license)}
                    
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      {license.expirationDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expira: {formatDate(license.expirationDate)}
                        </div>
                      )}
                      {license.cost && (
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(license.cost)}
                        </div>
                      )}
                    </div>
                    
                    {license.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {license.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(license)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(license.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}