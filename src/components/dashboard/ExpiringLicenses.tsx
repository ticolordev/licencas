import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { License, Microsoft365LicensePool } from '@/types/license';
import { AlertTriangle, Calendar } from 'lucide-react';

interface ExpiringLicensesProps {
  licenses: License[];
  microsoft365Pools: Microsoft365LicensePool[];
}

export function ExpiringLicenses({ licenses, microsoft365Pools }: ExpiringLicensesProps) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Combinar licenças regulares e pools do Microsoft 365
  const allExpiringItems = [
    // Licenças regulares
    ...licenses
      .filter((license) => {
        if (!license.expirationDate || !license.isActive) return false;
        const expirationDate = new Date(license.expirationDate);
        return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
      })
      .map(license => ({
        id: license.id,
        name: license.name,
        type: license.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        expirationDate: license.expirationDate!,
        isPool: false
      })),
    
    // Pools do Microsoft 365
    ...microsoft365Pools
      .filter((pool) => {
        if (!pool.expirationDate) return false;
        const expirationDate = new Date(pool.expirationDate);
        return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
      })
      .map(pool => ({
        id: pool.id,
        name: pool.licenseType,
        type: 'Microsoft 365',
        expirationDate: pool.expirationDate!,
        isPool: true,
        totalLicenses: pool.totalLicenses
      }))
  ]
  .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
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
          {allExpiringItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma licença expirando em breve</p>
          ) : (
            allExpiringItems.map((item) => {
              const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
              const isUrgent = daysUntilExpiration <= 7;
              
              return (
                <div key={item.id} className={`p-3 rounded-lg border-l-4 ${
                  isUrgent ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.isPool && (
                          <Badge variant="outline" className="text-xs">
                            {(item as any).totalLicenses} licenças
                          </Badge>
                        )}
                        <Badge 
                          variant={isUrgent ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {daysUntilExpiration} dia{daysUntilExpiration !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expira em {new Date(item.expirationDate).toLocaleDateString('pt-BR')}
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