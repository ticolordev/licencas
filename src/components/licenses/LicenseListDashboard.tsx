import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLicense } from '@/contexts/LicenseContext';
import { LicenseListModal } from './LicenseListModal';
import { Microsoft365LicensePool } from '@/types/license';
import { toast } from 'sonner';

export function LicenseListDashboard() {
  const { state, dispatch, updatePoolAvailability } = useLicense();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Microsoft365LicensePool | null>(null);

  const handleAddPool = () => {
    setEditingPool(null);
    setIsModalOpen(true);
  };

  const handleEditPool = (pool: Microsoft365LicensePool) => {
    setEditingPool(pool);
    setIsModalOpen(true);
  };

  const handleDeletePool = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença?')) {
      // Remove users assigned to this pool
      const usersWithThisLicense = state.microsoft365Users.filter(user => 
        user.assignedLicenses.includes(id)
      );
      
      usersWithThisLicense.forEach(user => {
        const updatedUser = {
          ...user,
          assignedLicenses: user.assignedLicenses.filter(licenseId => licenseId !== id)
        };
        dispatch({ type: 'UPDATE_M365_USER', payload: updatedUser });
      });

      dispatch({ type: 'DELETE_M365_POOL', payload: id });
      toast.success('Licença excluída com sucesso!');
      updatePoolAvailability();
    }
  };

  const handleSavePool = (poolData: Partial<Microsoft365LicensePool>) => {
    if (editingPool) {
      dispatch({ type: 'UPDATE_M365_POOL', payload: poolData as Microsoft365LicensePool });
      toast.success('Licença atualizada com sucesso!');
    } else {
      dispatch({ type: 'ADD_M365_POOL', payload: poolData as Microsoft365LicensePool });
      toast.success('Licença criada com sucesso!');
    }
    updatePoolAvailability();
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expiration = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiration <= thirtyDaysFromNow && expiration >= new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lista de Licenças</h2>
          <p className="text-sm text-gray-500">Gerencie todas as licenças disponíveis</p>
        </div>
        <Button onClick={handleAddPool} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Licença
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.microsoft365Pools.map((pool) => {
          const expired = isExpired(pool.expirationDate);
          const expiringSoon = isExpiringSoon(pool.expirationDate);
          const expiredLicenses = expired ? pool.totalLicenses : 0;
          
          return (
            <Card key={pool.id} className={`hover:shadow-md transition-shadow ${
              expired ? 'border-red-300 bg-red-50' : 
              expiringSoon ? 'border-orange-300 bg-orange-50' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {pool.licenseType}
                    </CardTitle>
                    {(expired || expiringSoon) && (
                      <div className="flex items-center space-x-1 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${expired ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className={`text-sm font-medium ${expired ? 'text-red-700' : 'text-orange-700'}`}>
                          {expired ? 'Expirada' : 'Expirando em breve'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPool(pool)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePool(pool.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{pool.totalLicenses}</div>
                    <div className="text-sm text-gray-500">Total de Licenças</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-lg font-semibold text-blue-600">{pool.assignedLicenses}</div>
                      <div className="text-xs text-blue-700">Atribuídas</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-lg font-semibold text-green-600">{pool.availableLicenses}</div>
                      <div className="text-xs text-green-700">Disponíveis</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <div className="text-lg font-semibold text-red-600">{expiredLicenses}</div>
                      <div className="text-xs text-red-700">Expiradas</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        expired ? 'bg-red-500' : 
                        expiringSoon ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${pool.totalLicenses > 0 ? (pool.assignedLicenses / pool.totalLicenses) * 100 : 0}%`
                      }}
                    />
                  </div>

                  {pool.expirationDate && (
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Validade: {formatDate(pool.expirationDate)}
                    </div>
                  )}

                  {pool.notes && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      {pool.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.microsoft365Pools.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma licença cadastrada</p>
            <Button onClick={handleAddPool} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Licença
            </Button>
          </CardContent>
        </Card>
      )}

      <LicenseListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePool}
        pool={editingPool}
      />
    </div>
  );
}