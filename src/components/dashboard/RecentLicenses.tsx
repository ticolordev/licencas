import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { License } from '@/types/license';
import { Calendar, DollarSign } from 'lucide-react';

interface RecentLicensesProps {
  licenses: License[];
}

export function RecentLicenses({ licenses }: RecentLicensesProps) {
  const recentLicenses = licenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Licenças Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLicenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma licença cadastrada</p>
          ) : (
            recentLicenses.map((license) => (
              <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{license.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {license.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                    <Badge variant={license.isActive ? 'default' : 'secondary'} className="text-xs">
                      {license.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(license.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {license.cost && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        R$ {license.cost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}