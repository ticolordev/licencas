import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LicenseStats } from '@/types/license';

interface LicenseChartProps {
  stats: Record<string, LicenseStats>;
}

const COLORS = {
  'Microsoft 365': '#3b82f6',
  'Sophos': '#10b981',
  'Servidores': '#f59e0b',
  'Windows': '#8b5cf6',
};

const CHART_LABELS = {
  microsoft365: 'Microsoft 365',
  sophos: 'Sophos',
  server: 'Servidores',
  windows: 'Windows',
};

export function LicenseChart({ stats }: LicenseChartProps) {
  const chartData = Object.entries(stats)
    .filter(([_, stat]) => stat.total > 0)
    .map(([key, stat]) => ({
      name: CHART_LABELS[key as keyof typeof CHART_LABELS],
      value: stat.total,
      active: stat.active,
      inactive: stat.inactive,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Total: {data.value}</p>
          <p className="text-sm text-green-600">Ativas: {data.active}</p>
          <p className="text-sm text-red-600">Inativas: {data.inactive}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribuição de Licenças</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma licença cadastrada
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}