import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LicenseStats } from '@/types/license';

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  stats: LicenseStats;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
  },
};

export function StatsCard({ title, icon: Icon, stats, color }: StatsCardProps) {
  const classes = colorClasses[color];
  
  return (
    <Card className={`${classes.bg} ${classes.border} border-2 hover:shadow-lg transition-shadow duration-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${classes.icon}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              {stats.active} Ativas
            </Badge>
            {stats.expired > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                {stats.expired} Expiradas
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {stats.total > 0 ? (
              `${Math.round((stats.active / stats.total) * 100)}% ativas`
            ) : (
              'Nenhuma licença cadastrada'
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}