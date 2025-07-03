import React from 'react';
import { Users, Shield, Server, Monitor } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { LicenseChart } from './LicenseChart';
import { LicenseCostChart } from './LicenseCostChart';
import { ExpiringLicenses } from './ExpiringLicenses';
import { useLicense } from '@/contexts/LicenseContext';

export function Dashboard() {
  const { getStats, state } = useLicense();
  const stats = getStats();

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

      {/* Chart and Expiring Licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LicenseChart stats={stats} />
        <ExpiringLicenses 
          licenses={state.licenses} 
          microsoft365Pools={state.microsoft365Pools}
          licensePools={state.licensePools}
        />
      </div>

      {/* Cost Chart - Half width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LicenseCostChart />
        <div></div> {/* Empty space to maintain half-width */}
      </div>
    </div>
  );
}