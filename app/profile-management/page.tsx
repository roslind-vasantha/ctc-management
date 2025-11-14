'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileTable } from './components/ProfileTable';
import { useStore } from '@/lib/store';
import { useToast } from '../components/ui/Toast';
import { fmtDate } from '@/lib/format';
import type { UnifiedProfile } from '@/lib/types';

// Helper function to convert store data to UnifiedProfile
const convertToUnifiedProfiles = (
  distributors: any[],
  retailers: any[],
  customers: any[],
  transactions: any[]
): UnifiedProfile[] => {
  const profiles: UnifiedProfile[] = [];

  // Convert Distributors
  distributors.forEach((dist) => {
    const distTxns = transactions.filter((t) => t.distributorId === dist.id);
    const successTxns = distTxns.filter((t) => t.status === 'success');
    const gmv = successTxns.reduce((sum, t) => sum + t.amount, 0);

    profiles.push({
      id: dist.id,
      name: dist.name,
      email: dist.email,
      phone: dist.phone,
      userType: 'Distributor',
      status: dist.active ? 'Active' : 'Suspended',
      kycStatus: dist.kycStatus === 'verified' ? 'Verified' : dist.kycStatus === 'pending' ? 'Pending' : null,
      onboardedBy: 'Admin',
      created: dist.createdAt,
      totalTransactions: distTxns.length,
      gmv,
    });
  });

  // Convert Retailers
  retailers.forEach((ret) => {
    const retTxns = transactions.filter((t) => t.retailerId === ret.id);
    const successTxns = retTxns.filter((t) => t.status === 'success');
    const gmv = successTxns.reduce((sum, t) => sum + t.amount, 0);
    const parent = distributors.find((d) => d.id === ret.distributorId);

    profiles.push({
      id: ret.id,
      name: ret.name,
      email: ret.email,
      phone: ret.phone,
      userType: 'Retailer',
      status: ret.active ? 'Active' : 'Suspended',
      kycStatus: ret.kycStatus === 'verified' ? 'Verified' : ret.kycStatus === 'pending' ? 'Pending' : null,
      onboardedBy: parent
        ? { id: parent.id, name: parent.name, type: 'Distributor' }
        : 'Admin',
      created: ret.createdAt,
      totalTransactions: retTxns.length,
      gmv,
    });
  });

  // Convert Customers
  customers.forEach((cust) => {
    const custTxns = transactions.filter((t) => t.customerId === cust.id);
    const successTxns = custTxns.filter((t) => t.status === 'success');
    const gmv = successTxns.reduce((sum, t) => sum + t.amount, 0);
    const parent = retailers.find((r) => r.id === cust.retailerId);

    profiles.push({
      id: cust.id,
      name: cust.name,
      email: cust.email || '',
      phone: cust.phone,
      userType: 'Customer',
      status: cust.active ? 'Active' : 'Suspended',
      kycStatus: cust.kycStatus === 'verified' ? 'Verified' : cust.kycStatus === 'pending' ? 'Pending' : null,
      onboardedBy: parent ? { id: parent.id, name: parent.name, type: 'Retailer' } : 'Admin',
      created: cust.createdAt,
      totalTransactions: custTxns.length,
      gmv,
    });
  });

  return profiles;
};

export default function ProfileManagementPage() {
  const router = useRouter();
  const { distributors, retailers, customers, transactions, updateDistributor, updateRetailer, updateCustomer } = useStore();
  const { showToast } = useToast();

  // Convert store data to unified profiles
  const profiles = useMemo(
    () => convertToUnifiedProfiles(distributors, retailers, customers, transactions),
    [distributors, retailers, customers, transactions]
  );

  // Handlers
  const handleRowClick = (profile: UnifiedProfile) => {
    router.push(`/profiles/${profile.id}`);
  };

  const handleParentClick = (parentId: string) => {
    router.push(`/profiles/${parentId}`);
  };

  const handleBulkSuspend = (ids: string[]) => {
    ids.forEach((id) => {
      const profile = profiles.find((p) => p.id === id);
      if (!profile) return;

      if (profile.userType === 'Distributor') {
        updateDistributor(id, { active: false });
      } else if (profile.userType === 'Retailer') {
        updateRetailer(id, { active: false });
      } else if (profile.userType === 'Customer') {
        updateCustomer(id, { active: false });
      }
    });

    showToast(`${ids.length} profiles suspended`, 'success');
  };

  const handleBulkActivate = (ids: string[]) => {
    ids.forEach((id) => {
      const profile = profiles.find((p) => p.id === id);
      if (!profile) return;

      if (profile.userType === 'Distributor') {
        updateDistributor(id, { active: true });
      } else if (profile.userType === 'Retailer') {
        updateRetailer(id, { active: true });
      } else if (profile.userType === 'Customer') {
        updateCustomer(id, { active: true });
      }
    });

    showToast(`${ids.length} profiles activated`, 'success');
  };

  const handleExportCSV = (profilesToExport: UnifiedProfile[]) => {
    const headers = ['Name', 'Email', 'Phone', 'User Type', 'Onboarded By', 'Status', 'Created', 'KYC', 'Total Txns', 'GMV'];
    const rows = profilesToExport.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.userType,
      p.onboardedBy === 'Admin' ? 'Admin' : p.onboardedBy.name,
      p.status,
      fmtDate(p.created, 'short'),
      p.kycStatus || 'None',
      p.totalTransactions,
      p.gmv,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profiles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('CSV exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Profile Management</h1>
        <p className="text-[var(--muted-foreground)]">
          Search, filter, inspect, and edit profiles across all user types
        </p>
      </div>

      {/* Profile Table */}
      <ProfileTable
        profiles={profiles}
        onRowClick={handleRowClick}
        onParentClick={handleParentClick}
        onBulkSuspend={handleBulkSuspend}
        onBulkActivate={handleBulkActivate}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
}
