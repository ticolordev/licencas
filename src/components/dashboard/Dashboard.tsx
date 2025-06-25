import React from 'react';
import { Users, Shield, Server, Monitor } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RecentLicenses } from './RecentLicenses';
import { ExpiringLicenses } from './ExpiringLicenses';
import { useLicense } from '@/contexts/LicenseContext';

export function Dashboard() {
  const { getStats, state } = useLicense();
  const stats = getStats();

  const totalLicenses = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
  const totalActive = Object.values(stats).reduce((sum, stat) => sum + stat.active, 0);
  const totalExpiring = Object.values(stats).reduce((sum, stat) => sum + stat.expiringSoon, 0);

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

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalLicenses}</div>
            <div className="text-sm opacity-90">Total de Licenças</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalActive}</div>
            <div className="text-sm opacity-90">Licenças Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-200">{totalExpiring}</div>
            <div className="text-sm opacity-90">Expirando em Breve</div>
          </div>
        </div>
      </div>

      {/* Recent and Expiring Licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLicenses licenses={state.licenses} />
        <ExpiringLicenses licenses={state.licenses} />
      </div>
    </div>
  );
}