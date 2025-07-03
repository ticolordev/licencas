import React, { useState } from 'react';
import { Users, Shield, Server, Monitor, Maximize2, Minimize2 } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { LicenseChart } from './LicenseChart';
import { LicenseCostChart } from './LicenseCostChart';
import { ExpiringLicenses } from './ExpiringLicenses';
import { useLicense } from '@/contexts/LicenseContext';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { getStats, state } = useLicense();
  const stats = getStats();
  
  // Estados para controlar o tamanho das seções
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Microsoft 365"
          icon={Users}
          stats={stats.microsoft365}
          color="blue"
        />
        <StatsCard
          title="Sophos"
          icon={Shield}
          stats={stats.sophos}
          color="green"
        />
        <StatsCard
          title="Servidores"
          icon={Server}
          stats={stats.server}
          color="orange"
        />
        <StatsCard
          title="Windows"
          icon={Monitor}
          stats={stats.windows}
          color="purple"
        />
      </div>

      {/* Layout Principal: 2 colunas independentes */}
      <div className={`grid gap-6 ${leftExpanded || rightExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Coluna Esquerda: Distribuição + Custos */}
        <div className={`space-y-6 ${leftExpanded ? 'lg:col-span-2' : ''}`}>
          {/* Distribuição de Licenças */}
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftExpanded(!leftExpanded)}
                className="h-8 w-8 p-0"
              >
                {leftExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
            <LicenseChart stats={stats} />
          </div>

          {/* Custos de Licenças */}
          <div className="relative">
            <LicenseCostChart />
          </div>
        </div>

        {/* Coluna Direita: Licenças Expirando */}
        {!leftExpanded && (
          <div className={`${rightExpanded ? 'lg:col-span-2' : ''}`}>
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightExpanded(!rightExpanded)}
                  className="h-8 w-8 p-0"
                >
                  {rightExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              <ExpiringLicenses 
                licenses={state.licenses} 
                microsoft365Pools={state.microsoft365Pools}
                licensePools={state.licensePools}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}