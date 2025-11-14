'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/app/components/ui/Toast';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { Tabs } from '@/app/components/ui/Tabs';
import { ProfileHeader } from '../components/ProfileHeader';
import { OverviewTab } from '@/app/profile-management/components/OverviewTab';
import { IdentityTab } from '@/app/profile-management/components/IdentityTab';
import { RelationshipsTab } from '@/app/profile-management/components/RelationshipsTab';
import { TransactionsTab } from '@/app/profile-management/components/TransactionsTab';
import { CommissionTab } from '@/app/profile-management/components/CommissionTab';
import { SettingsTab } from '@/app/profile-management/components/SettingsTab';
import type { UnifiedProfile, Transaction, SummaryMetrics, Document, ProfileRelationship, ProfileStatus } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = params.id as string;
  const activeTab = searchParams.get('tab') || 'overview';

  const { distributors, retailers, customers, transactions, updateDistributor, updateRetailer, updateCustomer } = useStore();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);

  useEffect(() => {
    // Find profile from store
    let foundProfile: UnifiedProfile | null = null;

    // Check distributors
    const distributor = distributors.find((d) => d.id === profileId);
    if (distributor) {
      const distTransactions = transactions.filter((t) => t.distributorId === profileId);
      const gmv = distTransactions.reduce((sum, t) => (t.status === 'success' ? sum + t.amount : sum), 0);

      foundProfile = {
        id: distributor.id,
        name: distributor.name,
        email: distributor.email,
        phone: distributor.phone,
        userType: 'Distributor',
        status: distributor.active ? 'Active' : 'Suspended',
        kycStatus: distributor.kycStatus === 'verified' ? 'Verified' : distributor.kycStatus === 'pending' ? 'Pending' : null,
        onboardedBy: 'Admin',
        created: distributor.createdAt,
        totalTransactions: distTransactions.length,
        gmv,
      };
    }

    // Check retailers
    if (!foundProfile) {
      const retailer = retailers.find((r) => r.id === profileId);
      if (retailer) {
        const retailerTransactions = transactions.filter((t) => t.retailerId === profileId);
        const gmv = retailerTransactions.reduce((sum, t) => (t.status === 'success' ? sum + t.amount : sum), 0);
        const parentDist = distributors.find((d) => d.id === retailer.distributorId);

        foundProfile = {
          id: retailer.id,
          name: retailer.name,
          email: retailer.email,
          phone: retailer.phone,
          userType: 'Retailer',
          status: retailer.active ? 'Active' : 'Suspended',
          kycStatus: retailer.kycStatus === 'verified' ? 'Verified' : retailer.kycStatus === 'pending' ? 'Pending' : null,
          onboardedBy: parentDist
            ? { id: parentDist.id, name: parentDist.name, type: 'Distributor' }
            : 'Admin',
          created: retailer.createdAt,
          totalTransactions: retailerTransactions.length,
          gmv,
        };
      }
    }

    // Check customers
    if (!foundProfile) {
      const customer = customers.find((c) => c.id === profileId);
      if (customer) {
        const customerTransactions = transactions.filter((t) => t.customerId === profileId);
        const gmv = customerTransactions.reduce((sum, t) => (t.status === 'success' ? sum + t.amount : sum), 0);
        const parentRetailer = retailers.find((r) => r.id === customer.retailerId);

        foundProfile = {
          id: customer.id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          userType: 'Customer',
          status: customer.active ? 'Active' : 'Suspended',
          kycStatus: customer.kycStatus === 'verified' ? 'Verified' : customer.kycStatus === 'pending' ? 'Pending' : null,
          onboardedBy: parentRetailer
            ? { id: parentRetailer.id, name: parentRetailer.name, type: 'Retailer' }
            : 'Admin',
          created: customer.createdAt,
          totalTransactions: customerTransactions.length,
          gmv,
        };
      }
    }

    setProfile(foundProfile);
  }, [profileId, distributors, retailers, customers, transactions]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="border border-[var(--border)] rounded-xl p-12 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
            <div className="text-xl font-semibold text-[var(--text-color)] mb-2">
              Profile Not Found
            </div>
            <div className="text-[var(--muted-foreground)] mb-4">
              The profile you're looking for doesn't exist or has been deleted.
            </div>
            <button
              onClick={() => router.push('/profile-management')}
              className="text-[#3B82F6] hover:underline"
            >
              Back to Profile Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get profile-specific data
  const profileTransactions: Transaction[] = transactions.filter((t) => {
    if (profile.userType === 'Distributor') return t.distributorId === profileId;
    if (profile.userType === 'Retailer') return t.retailerId === profileId;
    if (profile.userType === 'Customer') return t.customerId === profileId;
    return false;
  });

  const successfulTxns = profileTransactions.filter((t) => t.status === 'success');
  const metrics: SummaryMetrics = {
    totalTxns: profileTransactions.length,
    successfulTxns: successfulTxns.length,
    gmv: successfulTxns.reduce((sum, t) => sum + t.amount, 0),
    avgTicket: successfulTxns.length > 0 ? successfulTxns.reduce((sum, t) => sum + t.amount, 0) / successfulTxns.length : 0,
    successRate: profileTransactions.length > 0 ? successfulTxns.length / profileTransactions.length : 0,
  };

  // Mock documents (in real app, fetch from API)
  const documents: Document[] = [
    { id: '1', type: 'Aadhaar', number: '****-****-1234', status: profile.kycStatus === 'Verified' ? 'Verified' : 'Pending', uploadedAt: profile.created },
    { id: '2', type: 'PAN', number: 'ABCDE1234F', status: profile.kycStatus === 'Verified' ? 'Verified' : 'Pending', uploadedAt: profile.created },
  ];

  if (profile.userType === 'Distributor') {
    documents.push(
      { id: '3', type: 'GST', number: '22ABCDE1234F1Z5', status: profile.kycStatus === 'Verified' ? 'Verified' : 'Pending', uploadedAt: profile.created },
      { id: '4', type: 'Business License', number: 'BL-2024-001', status: profile.kycStatus === 'Verified' ? 'Verified' : 'Pending', uploadedAt: profile.created }
    );
  }

  // Get commission data from store
  const getCommissionData = () => {
    if (profile.userType === 'Distributor') {
      const dist = distributors.find((d) => d.id === profileId);
      return {
        type: dist?.commissionType || null,
        value: dist?.commissionValue || 0,
        legacyFixed: dist?.commissionRateFixed,
        legacyPercent: dist?.commissionRatePercent,
      };
    } else if (profile.userType === 'Retailer') {
      const ret = retailers.find((r) => r.id === profileId);
      return {
        type: ret?.commissionType || null,
        value: ret?.commissionValue || 0,
        legacyFixed: undefined,
        legacyPercent: undefined,
      };
    }
    return { type: null, value: 0 };
  };

  const commissionData = getCommissionData();

  // Mock relationships
  const relationships: ProfileRelationship[] = [];
  if (profile.userType === 'Distributor') {
    const distRetailers = retailers.filter((r) => r.distributorId === profileId);
    distRetailers.forEach((r) => {
      const rTxns = transactions.filter((t) => t.retailerId === r.id);
      relationships.push({
        id: r.id,
        name: r.name,
        type: 'Retailer',
        status: r.active ? 'Active' : 'Suspended',
        onboarded: r.createdAt,
        txns: rTxns.length,
        gmv: rTxns.filter((t) => t.status === 'success').reduce((sum, t) => sum + t.amount, 0),
      });
    });

    // Also add customers under this distributor's retailers
    const distCustomers = customers.filter((c) =>
      retailers.some((r) => r.id === c.retailerId && r.distributorId === profileId)
    );
    distCustomers.forEach((c) => {
      const cTxns = transactions.filter((t) => t.customerId === c.id);
      relationships.push({
        id: c.id,
        name: c.name,
        type: 'Customer',
        status: c.active ? 'Active' : 'Suspended',
        onboarded: c.createdAt,
        txns: cTxns.length,
        gmv: cTxns.filter((t) => t.status === 'success').reduce((sum, t) => sum + t.amount, 0),
      });
    });
  } else if (profile.userType === 'Retailer') {
    const retailerCustomers = customers.filter((c) => c.retailerId === profileId);
    retailerCustomers.forEach((c) => {
      const cTxns = transactions.filter((t) => t.customerId === c.id);
      relationships.push({
        id: c.id,
        name: c.name,
        type: 'Customer',
        status: c.active ? 'Active' : 'Suspended',
        onboarded: c.createdAt,
        txns: cTxns.length,
        gmv: cTxns.filter((t) => t.status === 'success').reduce((sum, t) => sum + t.amount, 0),
      });
    });
  }

  // Get available parents for reassignment
  const availableParents =
    profile.userType === 'Retailer'
      ? distributors
          .filter((d) => d.id !== (typeof profile.onboardedBy !== 'string' ? profile.onboardedBy.id : '') && d.active)
          .map((d) => ({ id: d.id, name: d.name, type: 'Distributor' as const, active: d.active }))
      : profile.userType === 'Customer'
      ? retailers
          .filter((r) => r.id !== (typeof profile.onboardedBy !== 'string' ? profile.onboardedBy.id : '') && r.active)
          .map((r) => ({ id: r.id, name: r.name, type: 'Retailer' as const, active: r.active }))
      : [];

  const handleTabChange = (tabId: string) => {
    router.push(`/profiles/${profileId}?tab=${tabId}`, { scroll: false });
  };

  const handleParentClick = (parentId: string) => {
    router.push(`/profiles/${parentId}`);
  };

  const handleSaveChanges = (updates: { name: string; email: string; phone: string; status: ProfileStatus }) => {
    if (!profile) return;

    const active = updates.status === 'Active';

    // Update the appropriate store based on user type
    if (profile.userType === 'Distributor') {
      updateDistributor(profileId, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        active,
      });
    } else if (profile.userType === 'Retailer') {
      updateRetailer(profileId, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        active,
      });
    } else if (profile.userType === 'Customer') {
      updateCustomer(profileId, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        active,
      });
    }

    // Update local profile state
    setProfile({
      ...profile,
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      status: updates.status,
    });

    showToast('Profile updated successfully', 'success');
  };

  const handleUpdateCommission = (type: 'fixed' | 'percentage', value: number) => {
    if (!profile) return;

    // Update the appropriate store based on user type
    if (profile.userType === 'Distributor') {
      updateDistributor(profileId, {
        commissionType: type,
        commissionValue: value,
      });
    } else if (profile.userType === 'Retailer') {
      updateRetailer(profileId, {
        commissionType: type,
        commissionValue: value,
      });
    }

    showToast('Commission updated successfully', 'success');
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <OverviewTab
          profile={profile}
          metrics={metrics}
          recentTransactions={profileTransactions.slice(0, 5)}
        />
      ),
    },
    {
      id: 'identity',
      label: 'Identity & Docs',
      content: (
        <IdentityTab
          kycStatus={profile.kycStatus}
          documents={documents}
          onRequestReUpload={(docId) => console.log('Re-upload requested', docId)}
          onRequestReUploadAll={() => console.log('Re-upload all requested')}
        />
      ),
    },
    {
      id: 'relationships',
      label: 'Relationships',
      content: (
        <RelationshipsTab
          userType={profile.userType}
          retailers={relationships.filter((r) => r.type === 'Retailer')}
          customers={relationships.filter((r) => r.type === 'Customer')}
          onOpenProfile={handleParentClick}
        />
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: (
        <TransactionsTab
          profileId={profileId}
          transactions={profileTransactions}
          metrics={metrics}
          onExportCSV={() => console.log('Export transactions CSV')}
        />
      ),
    },
    {
      id: 'commission',
      label: 'Commission',
      content: (
        <CommissionTab
          profile={profile}
          currentCommission={commissionData}
          onUpdateCommission={handleUpdateCommission}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <SettingsTab
          profile={profile}
          availableParents={availableParents}
          onReassignParent={(newParentId, reason) =>
            console.log('Reassign to', newParentId, reason)
          }
          onSuspend={(reason) => console.log('Suspend', reason)}
          onActivate={() => console.log('Activate')}
          onDelete={() => console.log('Delete')}
        />
      ),
    },
  ];

  const breadcrumbItems = [
    { label: 'Profile Management', href: '/profile-management' },
    { label: profile.userType },
    { label: profile.name },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <ProfileHeader profile={profile} onSaveChanges={handleSaveChanges} />

        {/* Sticky Tabs */}
        <div className="sticky top-0 bg-[#fafafa] z-10 pt-2 -mx-6 px-6">
          <Tabs tabs={tabs} defaultTab={activeTab} onChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
}
