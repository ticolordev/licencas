import React, { useState } from 'react';
import { Plus, Edit, Trash2, List, Calendar, ChevronUp, ChevronDown, Package, Monitor, Server, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLicense } from '@/contexts/LicenseContext';
import { LicensePool, LicenseAssignment } from '@/types/license';
import { toast } from 'sonner';
import { LicensePoolModal } from './LicensePoolModal';
import { LicenseAssignmentModal } from './LicenseAssignmentModal';

type SortField = 'deviceName' | 'serverName' | 'userEmail' | 'isActive';
type SortDirection = 'asc' | 'desc';

interface GenericLicenseDashboardProps {
  licenseType: 'sophos' | 'server' | 'windows';
  title: string;
}

const typeIcons = {
  sophos: Shield,
  server: Server,
  windows: Monitor,
};

const typeColors = {
  sophos: 'green',
  server: 'orange',
  windows: 'purple',
};

export function GenericLicenseDashboard({ licenseType, title }: GenericLicenseDashboardProps) {
  const { 
    state, 
    saveLicensePool, 
    deleteLicensePool,
    saveLicenseAssignment,
    deleteLicenseAssignment
  } = useLicense();
  
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<LicensePool | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<LicenseAssignment | null>(null);
  const [sortField, setSortField] = useState<SortField>('deviceName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const Icon = typeIcons[licenseType];

  const poolsOfType = state.licensePools.filter(pool => pool.type === licenseType);
  const assignmentsOfType = state.licenseAssignments.filter(assignment => assignment.type === licenseType);

  const handleAddPool = () => {
    setEditingPool(null);
    setIsPoolModalOpen(true);
  };

  const handleEditPool = (pool: LicensePool) => {
    setEditingPool(pool);
    setIsPoolModalOpen(true);
  };

  const handleDeletePool = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato de licenças?')) {
      try {
        // Remove assignments for this pool
        const assignmentsWithThisPool = state.licenseAssignments.filter(assignment => 
          assignment.poolId === id
        );
        
        for (const assignment of assignmentsWithThisPool) {
          await deleteLicenseAssignment(assignment.id);
        }

        await deleteLicensePool(id);
        toast.success('Contrato de licenças excluído com sucesso!');
      } catch (error) {
        // Error is already handled in the service
      }
    }
  };

  const handleSavePool = async (poolData: Partial<LicensePool>) => {
    try {
      await saveLicensePool(poolData);
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

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = (assignment: LicenseAssignment) => {
    setEditingAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atribuição?')) {
      try {
        await deleteLicenseAssignment(id);
        toast.success('Atribuição excluída com sucesso!');
      } catch (error) {
        // Error is already handled in the service
      }
    }
  };

  const handleSaveAssignment = async (assignmentData: Partial<LicenseAssignment>) => {
    try {
      await saveLicenseAssignment(assignmentData);
      if (editingAssignment) {
        toast.success('Atribuição atualizada com sucesso!');
      } else {
        toast.success('Atribuição criada com sucesso!');
      }
      setIsAssignmentModalOpen(false);
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const getPoolName = (poolId: string) => {
    const pool = poolsOfType.find(p => p.id === poolId);
    return pool?.name || 'Pool não encontrado';
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

  // Calcular totais por pool
  const getPoolTotals = () => {
    const totals: Record<string, { total: number; assigned: number; available: number; active: number; inactive: number; expired: number }> = {};
    
    poolsOfType.forEach(pool => {
      const assignmentsForPool = assignmentsOfType.filter(assignment => assignment.poolId === pool.id);
      const activeAssignments = assignmentsForPool.filter(assignment => assignment.isActive);
      const inactiveAssignments = assignmentsForPool.filter(assignment => !assignment.isActive);
      const expiredLicenses = isExpired(pool.expirationDate) ? pool.totalLicenses : 0;
      
      totals[pool.id] = {
        total: pool.totalLicenses,
        assigned: assignmentsForPool.length,
        available: pool.totalLicenses - assignmentsForPool.length,
        active: activeAssignments.length,
        inactive: inactiveAssignments.length,
        expired: expiredLicenses
      };
    });
    
    return totals;
  };

  const poolTotals = getPoolTotals();

  // Função para ordenar atribuições
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAssignments = () => {
    return [...assignmentsOfType].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'deviceName':
          aValue = (a.deviceName || a.serverName || '').toLowerCase();
          bValue = (b.deviceName || b.serverName || '').toLowerCase();
          break;
        case 'serverName':
          aValue = (a.serverName || '').toLowerCase();
          bValue = (b.serverName || '').toLowerCase();
          break;
        case 'userEmail':
          aValue = (a.userEmail || '').toLowerCase();
          bValue = (b.userEmail || '').toLowerCase();
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
      {/* Dashboard de Totais */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo de Licenças</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {poolsOfType.map((pool) => {
            const stats = poolTotals[pool.id];
            
            return (
              <Card key={pool.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-700 flex items-center">
                      <Icon className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="truncate">{pool.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPool(pool)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Ativas: {stats.active}</span>
                    <span className="text-orange-600">Inativas: {stats.inactive}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Disponíveis: {stats.available}</span>
                    <span className="text-red-600">Expiradas: {stats.expired}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {poolsOfType.length === 0 && (
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
        {/* Atribuições - Esquerda */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Atribuições</h2>
              <p className="text-sm text-gray-500">Gerencie as atribuições de licenças</p>
            </div>
            <Button onClick={handleAddAssignment} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Atribuição
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
                        onClick={() => handleSort('deviceName')}
                      >
                        <div className="flex items-center">
                          {licenseType === 'server' ? 'Servidor' : 'Dispositivo'}
                          <SortIcon field="deviceName" />
                        </div>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-700">Pool de Licenças</th>
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
                    {getSortedAssignments().length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhuma atribuição cadastrada
                        </td>
                      </tr>
                    ) : (
                      getSortedAssignments().map((assignment) => (
                        <tr key={assignment.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {assignment.deviceName || assignment.serverName || 'N/A'}
                              </span>
                            </div>
                            {assignment.licenseKey && (
                              <div className="text-xs text-gray-500 mt-1">
                                Chave: {assignment.licenseKey}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="text-xs">
                              {getPoolName(assignment.poolId)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={assignment.isActive ? 'default' : 'secondary'}
                              className={assignment.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}
                            >
                              {assignment.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAssignment(assignment.id)}
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
              {poolsOfType.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">Nenhum contrato cadastrado</p>
                  <Button onClick={handleAddPool} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contrato
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {poolsOfType.map((pool) => {
                    const expired = isExpired(pool.expirationDate);
                    const expiringSoon = isExpiringSoon(pool.expirationDate);
                    const stats = poolTotals[pool.id];
                    
                    return (
                      <div key={pool.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {pool.name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{pool.totalLicenses}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Usadas: <span className="font-semibold">{stats.assigned}</span>
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
      <LicensePoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        onSave={handleSavePool}
        pool={editingPool}
        licenseType={licenseType}
      />

      <LicenseAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSave={handleSaveAssignment}
        assignment={editingAssignment}
        availablePools={poolsOfType}
        licenseType={licenseType}
      />
    </div>
  );
}