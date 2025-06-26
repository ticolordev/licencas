import React, { useState } from 'react';
import { Plus, Users, Package, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLicense } from '@/contexts/LicenseContext';
import { Microsoft365PoolModal } from './Microsoft365PoolModal';
import { Microsoft365UserModal } from './Microsoft365UserModal';
import { Microsoft365LicensePool, Microsoft365User } from '@/types/license';
import { toast } from 'sonner';

export function Microsoft365Dashboard() {
  const { state, dispatch, updatePoolAvailability } = useLicense();
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Microsoft365LicensePool | null>(null);
  const [editingUser, setEditingUser] = useState<Microsoft365User | null>(null);

  const handleAddPool = () => {
    setEditingPool(null);
    setIsPoolModalOpen(true);
  };

  const handleEditPool = (pool: Microsoft365LicensePool) => {
    setEditingPool(pool);
    setIsPoolModalOpen(true);
  };

  const handleDeletePool = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pool de licenças?')) {
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
      toast.success('Pool de licenças excluído com sucesso!');
      updatePoolAvailability();
    }
  };

  const handleSavePool = (poolData: Partial<Microsoft365LicensePool>) => {
    if (editingPool) {
      dispatch({ type: 'UPDATE_M365_POOL', payload: poolData as Microsoft365LicensePool });
      toast.success('Pool de licenças atualizado com sucesso!');
    } else {
      dispatch({ type: 'ADD_M365_POOL', payload: poolData as Microsoft365LicensePool });
      toast.success('Pool de licenças criado com sucesso!');
    }
    updatePoolAvailability();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: Microsoft365User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      dispatch({ type: 'DELETE_M365_USER', payload: id });
      toast.success('Usuário excluído com sucesso!');
      updatePoolAvailability();
    }
  };

  const handleSaveUser = (userData: Partial<Microsoft365User>) => {
    if (editingUser) {
      dispatch({ type: 'UPDATE_M365_USER', payload: userData as Microsoft365User });
      toast.success('Usuário atualizado com sucesso!');
    } else {
      dispatch({ type: 'ADD_M365_USER', payload: userData as Microsoft365User });
      toast.success('Usuário criado com sucesso!');
    }
    updatePoolAvailability();
  };

  const getLicenseTypeName = (poolId: string) => {
    const pool = state.microsoft365Pools.find(p => p.id === poolId);
    return pool?.licenseType || 'Licença não encontrada';
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

  return (
    <div className="space-y-6">
      {/* Pools de Licenças */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pools de Licenças</h2>
            <p className="text-sm text-gray-500">Gerencie os pools de licenças disponíveis</p>
          </div>
          <Button onClick={handleAddPool} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pool
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {pool.licenseType}
                    </CardTitle>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{pool.totalLicenses}</span>
                      <Badge variant="outline" className="text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        Total
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-sm font-semibold text-blue-600">{pool.assignedLicenses}</div>
                        <div className="text-xs text-blue-700">Atribuídas</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-sm font-semibold text-green-600">{pool.availableLicenses}</div>
                        <div className="text-xs text-green-700">Disponíveis</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-sm font-semibold text-red-600">{expiredLicenses}</div>
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Usuários */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Usuários</h2>
            <p className="text-sm text-gray-500">Gerencie os usuários e suas licenças atribuídas</p>
          </div>
          <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Usuário</th>
                    <th className="text-left p-4 font-medium text-gray-700">Email</th>
                    <th className="text-left p-4 font-medium text-gray-700">Licenças Atribuídas</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-right p-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {state.microsoft365Users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        Nenhum usuário cadastrado
                      </td>
                    </tr>
                  ) : (
                    state.microsoft365Users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.assignedLicenses.map((licenseId) => (
                              <Badge key={licenseId} variant="secondary" className="text-xs">
                                {getLicenseTypeName(licenseId)}
                              </Badge>
                            ))}
                            {user.assignedLicenses.length === 0 && (
                              <span className="text-gray-400 text-sm">Nenhuma licença</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={user.isActive ? 'default' : 'secondary'}
                            className={user.isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}
                          >
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Microsoft365PoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        onSave={handleSavePool}
        pool={editingPool}
      />

      <Microsoft365UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        availablePools={state.microsoft365Pools}
      />
    </div>
  );
}