import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { License } from '@/types/license';
import { AlertTriangle, Calendar } from 'lucide-react';

interface ExpiringLicensesProps {
  licenses: License[];
}

export function ExpiringLicenses({ licenses }: ExpiringLicensesProps) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringLicenses = licenses
    .filter((license) => {
      if (!license.expirationDate || !license.isActive) return false;
      const expirationDate = new Date(license.expirationDate);
      return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
    })
    .sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime())
    .slice(0, 5);

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          Licenças Expirando
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringLicenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma licença expirando em breve</p>
          ) : (
            expiringLicenses.map((license) => {
              const daysUntilExpiration = getDaysUntilExpiration(license.expirationDate!);
              const isUrgent = daysUntilExpiration <= 7;
              
              return (
                <div key={license.id} className={`p-3 rounded-lg border-l-4 ${
                  isUrgent ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{license.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {license.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Badge>
                        <Badge 
                          variant={isUrgent ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {daysUntilExpiration} dia{daysUntilExpiration !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expira em {new Date(license.expirationDate!).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}