import React, { useState } from 'react';
import { Plus, Users, Package, Edit, Trash2, List, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLicense } from '@/contexts/LicenseContext';
import { Microsoft365PoolModal } from './Microsoft365PoolModal';
import { Microsoft365UserModal } from './Microsoft365UserModal';
import { Microsoft365LicensePool, Microsoft365User } from '@/types/license';
import { toast } from 'sonner';

type SortField = 'name' | 'email' | 'assignedLicenses' | 'isActive';
type SortDirection = 'asc' | 'desc';

export function Microsoft365Dashboard() {
  const { 
    state, 
    dispatch, 
    saveMicrosoft365Pool, 
    deleteMicrosoft365Pool,
    saveMicrosoft365User,
    deleteMicrosoft365User
  } = useLicense();
  
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Microsoft365LicensePool | null>(null);
  const [editingUser, setEditingUser] = useState<Microsoft365User | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleAddPool = () => {
    setEditingPool(null);
    setIsPoolModalOpen(true);
  };

  const handleEditPool = (pool: Microsoft365LicensePool) => {
    setEditingPool(pool);
    setIsPoolModalOpen(true);
  };

  const handleDeletePool = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato de licenças?')) {
      try {
        // Remove users assigned to this pool
        const usersWithThisLicense = state.microsoft365Users.filter(user => 
          user.assignedLicenses.includes(id)
        );
        
        for (const user of usersWithThisLicense) {
          const updatedUser = {
            ...user,
            assignedLicenses: user.assignedLicenses.filter(licenseId => licenseId !== id)
          };
          await saveMicrosoft365User(updatedUser);
        }

        await deleteMicrosoft365Pool(id);
        toast.success('Contrato de licenças excluído com sucesso!');
      } catch (error) {
        // Error is already handled in the service
      }
    }
  };

  const handleSavePool = async (poolData: Partial<Microsoft365LicensePool>) => {
    try {
      await saveMicrosoft365Pool(poolData);
      if (editingPool) {
        toast.success('Contrato de licenças atualizado com sucesso!');
      } else {
        toast.success('Contrato de licenças criado com sucesso!');
      }
      setIsPoolModalOpen(false);
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: Microsoft365User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteMicrosoft365User(id);
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        // Error is already handled in the service
      }
    }
  };

  const handleSaveUser = async (userData: Partial<Microsoft365User>) => {
    try {
      await saveMicrosoft365User(userData);
      if (editingUser) {
        toast.success('Usuário atualizado com sucesso!');
      } else {
        toast.success('Usuário criado com sucesso!');
      }
      setIsUserModalOpen(false);
    } catch (error) {
      // Error is already handled in the service
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular totais por tipo de licença baseado nos contratos e usuários
  const getLicenseTotals = () => {
    const totals: Record<string, { total: number; assigned: number; available: number; active: number; inactive: number; expired: number }> = {};
    
    // Agrupar pools por tipo de licença e somar totais
    const poolsByType: Record<string, Microsoft365LicensePool[]> = {};
    state.microsoft365Pools.forEach(pool => {
      if (!poolsByType[pool.licenseType]) {
        poolsByType[pool.licenseType] = [];
      }
      poolsByType[pool.licenseType].push(pool);
    });

    // Calcular totais para cada tipo
    Object.entries(poolsByType).forEach(([licenseType, pools]) => {
      const totalLicenses = pools.reduce((sum, pool) => sum + pool.totalLicenses, 0);
      
      // Contar usuários ativos e inativos com este tipo de licença
      const activeUsersWithLicense = state.microsoft365Users.filter(user => 
        user.isActive && user.assignedLicenses.some(licenseId => 
          pools.some(pool => pool.id === licenseId)
        )
      ).length;
      
      const inactiveUsersWithLicense = state.microsoft365Users.filter(user => 
        !user.isActive && user.assignedLicenses.some(licenseId => 
          pools.some(pool => pool.id === licenseId)
        )
      ).length;
      
      const totalAssigned = activeUsersWithLicense + inactiveUsersWithLicense;
      
      // Contar licenças expiradas
      const expiredLicenses = pools.reduce((sum, pool) => {
        return sum + (isExpired(pool.expirationDate) ? pool.totalLicenses : 0);
      }, 0);
      
      totals[licenseType] = {
        total: totalLicenses,
        assigned: totalAssigned,
        available: totalLicenses - totalAssigned,
        active: activeUsersWithLicense,
        inactive: inactiveUsersWithLicense,
        expired: expiredLicenses
      };
    });
    
    return totals;
  };

  const licenseTotals = getLicenseTotals();

  // Função para ordenar usuários
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedUsers = () => {
    return [...state.microsoft365Users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'assignedLicenses':
          aValue = a.assignedLicenses.length;
          bValue = b.assignedLicenses.length;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard de Totais - Quadrados Menores */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo de Licenças</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Object.entries(licenseTotals).map(([licenseType, stats]) => {
            const pools = state.microsoft365Pools.filter(p => p.licenseType === licenseType);
            const mainPool = pools[0]; // Para edição, usar o primeiro pool do tipo
            
            return (
              <Card key={licenseType} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-700 flex items-center">
                      <Package className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="truncate">{licenseType}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {mainPool && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPool(mainPool)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Ativas: {stats.active}</span>
                    <span className="text-orange-600">Usuários Inativos: {stats.inactive}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Disponíveis: {stats.available}</span>
                    <span className="text-red-600">Expiradas: {stats.expired}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {Object.keys(licenseTotals).length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma licença cadastrada</p>
                <Button onClick={handleAddPool} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Licença
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex gap-6">
        {/* Usuários - Esquerda */}
        <div className="flex-1 min-w-0">
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
                      <th 
                        className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Usuário
                          <SortIcon field="name" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          <SortIcon field="email" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('assignedLicenses')}
                      >
                        <div className="flex items-center">
                          Licenças Atribuídas
                          <SortIcon field="assignedLicenses" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="isActive" />
                        </div>
                      </th>
                      <th className="text-right p-4 font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedUsers().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum usuário cadastrado
                        </td>
                      </tr>
                    ) : (
                      getSortedUsers().map((user) => (
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
                              className={user.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}
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

        {/* Contratos de Licenças - Direita */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Contratos de Licenças
                </CardTitle>
                <Button onClick={handleAddPool} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {state.microsoft365Pools.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">Nenhum contrato cadastrado</p>
                  <Button onClick={handleAddPool} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contrato
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {state.microsoft365Pools.map((pool) => {
                    const expired = isExpired(pool.expirationDate);
                    const expiringSoon = isExpiringSoon(pool.expirationDate);
                    const assignedCount = state.microsoft365Users.filter(user => 
                      user.assignedLicenses.includes(pool.id)
                    ).length;
                    
                    return (
                      <div key={pool.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {pool.licenseType}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{pool.totalLicenses}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Usadas: <span className="font-semibold">{assignedCount}</span>
                              </span>
                              {(expired || expiringSoon) && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${expired ? 'text-red-600 border-red-300' : 'text-orange-600 border-orange-300'}`}
                                >
                                  {expired ? 'Expirada' : 'Expirando'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(pool.expirationDate)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPool(pool)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePool(pool.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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