import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, DollarSign } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';

type ViewMode = 'date' | 'value';

export function LicenseCostChart() {
  const { state } = useLicense();
  const [viewMode, setViewMode] = useState<ViewMode>('value');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getCostData = () => {
    const allCostData: Array<{
      name: string;
      type: string;
      cost: number;
      expirationDate?: string;
      totalLicenses: number;
    }> = [];

    // Microsoft 365 pools
    state.microsoft365Pools.forEach(pool => {
      if (pool.cost && pool.cost > 0) {
        allCostData.push({
          name: pool.licenseType,
          type: 'Microsoft 365',
          cost: pool.cost * pool.totalLicenses,
          expirationDate: pool.expirationDate,
          totalLicenses: pool.totalLicenses
        });
      }
    });

    // License pools (Sophos, Server, Windows)
    state.licensePools.forEach(pool => {
      if (pool.cost && pool.cost > 0) {
        const typeNames = {
          sophos: 'Sophos',
          server: 'Servidor',
          windows: 'Windows'
        };
        
        allCostData.push({
          name: pool.name,
          type: typeNames[pool.type],
          cost: pool.cost * pool.totalLicenses,
          expirationDate: pool.expirationDate,
          totalLicenses: pool.totalLicenses
        });
      }
    });

    // Legacy licenses
    state.licenses.forEach(license => {
      if (license.cost && license.cost > 0) {
        const typeNames = {
          microsoft365: 'Microsoft 365',
          sophos: 'Sophos',
          server: 'Servidor',
          windows: 'Windows'
        };
        
        allCostData.push({
          name: license.name,
          type: typeNames[license.type],
          cost: license.cost,
          expirationDate: license.expirationDate,
          totalLicenses: 1
        });
      }
    });

    if (viewMode === 'date') {
      // Group by expiration date
      const dateGroups: Record<string, { name: string; cost: number; count: number }> = {};
      
      allCostData.forEach(item => {
        if (item.expirationDate) {
          const dateKey = formatDate(item.expirationDate);
          if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = { name: dateKey, cost: 0, count: 0 };
          }
          dateGroups[dateKey].cost += item.cost;
          dateGroups[dateKey].count += 1;
        }
      });

      return Object.values(dateGroups)
        .sort((a, b) => {
          // Sort by date
          const dateA = new Date(a.name.split('/').reverse().join('-'));
          const dateB = new Date(b.name.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 10); // Show top 10 dates
    } else {
      // Sort by cost value
      return allCostData
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10) // Show top 10 most expensive
        .map(item => ({
          name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
          cost: item.cost,
          type: item.type
        }));
    }
  };

  const chartData = getCostData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {viewMode === 'date' ? (
            <>
              <p className="text-sm text-blue-600">Custo Total: {formatCurrency(data.cost)}</p>
              <p className="text-sm text-gray-600">Contratos: {data.count}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-blue-600">Custo: {formatCurrency(data.cost)}</p>
              <p className="text-sm text-gray-600">Tipo: {data.type}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (entry: any) => {
    if (viewMode === 'date') {
      return '#3b82f6'; // Blue for date view
    }
    
    // Different colors for different types in value view
    const colors: Record<string, string> = {
      'Microsoft 365': '#3b82f6',
      'Sophos': '#10b981',
      'Servidor': '#f59e0b',
      'Windows': '#8b5cf6',
    };
    return colors[entry.type] || '#6b7280';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Custos de Licenças</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('value')}
              className="flex items-center space-x-1"
            >
              <DollarSign className="h-4 w-4" />
              <span>Por Valor</span>
            </Button>
            <Button
              variant={viewMode === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('date')}
              className="flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Por Data</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado de custo disponível
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                {viewMode === 'value' && <Legend />}
                <Bar 
                  dataKey="cost" 
                  fill="#3b82f6"
                  name="Custo"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500 text-center">
          {viewMode === 'date' 
            ? 'Custos agrupados por data de expiração' 
            : 'Top 10 licenças mais caras'
          }
        </div>
      </CardContent>
    </Card>
  );
}