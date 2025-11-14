/**
 * Operations Dashboard
 * 
 * Displays onboarding metrics, approval queues, and profile management stats.
 * Consumes: retailers, customers, distributors
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { DataTable } from '@/app/components/ui/DataTable';
import { LineSeries } from '@/app/components/charts/LineSeries';
import { BarMini } from '@/app/components/charts/BarMini';
import { fmtINR, fmtPercent, fmtDateIN } from '@/lib/format';
import { retailers, customers, distributors } from '@/lib/data';
import { getRange, filterByRange, count, groupByDay } from '@/lib/dashboard';
import type { ColumnDef } from '@/lib/types';
import { Briefcase, UserPlus, ShieldCheck, Users } from 'lucide-react';

export default function OperationsDashboardPage() {
  const [days, setDays] = useState<30 | 90>(30);
  const range = useMemo(() => getRange(days), [days]);

  // Filter data by range
  const rangeRetailers = useMemo(() => filterByRange(retailers, range), [range]);
  const rangeCustomers = useMemo(() => filterByRange(customers, range), [range]);
  const rangeDistributors = useMemo(() => filterByRange(distributors, range), [range]);

  // KPIs
  const pendingOnboardings = useMemo(() => {
    return (
      count(retailers, (r) => r.onboardingState === 'pending') +
      count(customers, (c) => c.onboardingState === 'pending')
    );
  }, []);

  const submittedAwaitingApproval = useMemo(() => {
    return (
      count(retailers, (r) => r.onboardingState === 'submitted' && r.kycStatus === 'pending') +
      count(customers, (c) => c.onboardingState === 'submitted' && c.kycStatus === 'pending')
    );
  }, []);

  const activeProfiles = useMemo(() => {
    return (
      count(distributors, (d) => d.kycStatus === 'verified') +
      count(retailers, (r) => r.kycStatus === 'verified') +
      count(customers, (c) => c.kycStatus === 'verified')
    );
  }, []);

  const approvalTurnaround = useMemo(() => {
    // For demo: compute average hours from created to now for verified profiles
    // In real app, would use reviewedAt timestamp
    const verifiedRetailers = retailers.filter((r) => r.kycStatus === 'verified');
    const verifiedCustomers = customers.filter((c) => c.kycStatus === 'verified');
    const allVerified = [...verifiedRetailers, ...verifiedCustomers];

    if (allVerified.length === 0) return null;

    const totalHours = allVerified.reduce((sum, item) => {
      const created = new Date(item.createdAt);
      const now = new Date();
      const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return totalHours / allVerified.length;
  }, []);

  // Charts data - Funnel
  const funnelData = useMemo(() => {
    const pending = pendingOnboardings;
    const submitted = submittedAwaitingApproval;
    const approved = activeProfiles;

    return [
      { stage: 'Pending', value: pending },
      { stage: 'Submitted', value: submitted },
      { stage: 'Approved', value: approved },
    ];
  }, [pendingOnboardings, submittedAwaitingApproval, activeProfiles]);

  // New profiles per day
  const newProfilesByDay = useMemo(() => {
    const distributorsByDay = groupByDay(rangeDistributors, () => 1);
    const retailersByDay = groupByDay(rangeRetailers, () => 1);
    const customersByDay = groupByDay(rangeCustomers, () => 1);

    // Merge by date
    const dateMap = new Map<
      string,
      { date: string; distributors: number; retailers: number; customers: number }
    >();

    distributorsByDay.forEach((item) => {
      dateMap.set(item.date, { date: item.date, distributors: item.value, retailers: 0, customers: 0 });
    });
    retailersByDay.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.retailers = item.value;
      } else {
        dateMap.set(item.date, { date: item.date, distributors: 0, retailers: item.value, customers: 0 });
      }
    });
    customersByDay.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.customers = item.value;
      } else {
        dateMap.set(item.date, { date: item.date, distributors: 0, retailers: 0, customers: item.value });
      }
    });

    return Array.from(dateMap.values())
      .filter((item) => {
        const date = new Date(item.date);
        return date >= range.from && date <= range.to;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rangeDistributors, rangeRetailers, rangeCustomers, range]);

  // Queue Snapshots
  const retailersAwaitingApproval = useMemo(() => {
    return retailers
      .filter((r) => r.onboardingState === 'submitted' && r.kycStatus === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((r) => {
        const distributor = distributors.find((d) => d.id === r.distributorId);
        return {
          name: r.name,
          distributor: distributor?.name || '—',
          submitted: r.createdAt,
        };
      });
  }, []);

  const customersAwaitingApproval = useMemo(() => {
    return customers
      .filter((c) => c.onboardingState === 'submitted' && c.kycStatus === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((c) => {
        const retailer = retailers.find((r) => r.id === c.retailerId);
        return {
          name: c.name,
          retailer: retailer?.name || '—',
          submitted: c.createdAt,
        };
      });
  }, []);

  const retailerColumns: ColumnDef<typeof retailersAwaitingApproval[0]>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'distributor', label: 'Distributor', sortable: true },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      render: (row) => fmtDateIN(row.submitted),
    },
  ];

  const customerColumns: ColumnDef<typeof customersAwaitingApproval[0]>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'retailer', label: 'Retailer', sortable: true },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      render: (row) => fmtDateIN(row.submitted),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[var(--foreground)]" />
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">Operations</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 30
                ? 'bg-[var(--foreground)] text-white'
                : 'bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80'
            }`}
            onClick={() => setDays(30)}
          >
            30d
          </button>
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 90
                ? 'bg-[var(--foreground)] text-white'
                : 'bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80'
            }`}
            onClick={() => setDays(90)}
          >
            90d
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">Updated just now</p>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          header="Pending Onboardings"
          value={pendingOnboardings}
          subtext="Incomplete profiles"
          variant="warning"
        />
        <Card
          header="Submitted Awaiting Approval"
          value={submittedAwaitingApproval}
          subtext="Ready for review"
          variant="info"
        />
        <Card
          header="Active Profiles"
          value={activeProfiles}
          subtext="Verified users"
          variant="success"
        />
        <Card
          header="Approval Turnaround"
          value={approvalTurnaround ? `${Math.round(approvalTurnaround)} hrs` : '—'}
          subtext="Average processing time"
          variant="info"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Onboarding Funnel
              </h3>
              <BarMini
                data={funnelData.map((item) => ({
                  name: item.stage,
                  value: item.value,
                  color: 'var(--foreground)',
                }))}
                height={300}
              />
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                New Profiles per Day
              </h3>
              <LineSeries
                data={newProfilesByDay}
                lines={[
                  { dataKey: 'distributors', name: 'Distributors', color: 'var(--foreground)' },
                  { dataKey: 'retailers', name: 'Retailers', color: 'var(--info-border)' },
                  { dataKey: 'customers', name: 'Customers', color: 'var(--success-border)' },
                ]}
                height={300}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Queue Snapshots */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)]">
                Retailers Awaiting Approval
              </h3>
              <Link href="/onboarding-approval?tab=retailers&state=submitted">
                <button className="text-xs text-[var(--foreground)] hover:underline">
                  View All →
                </button>
              </Link>
            </div>
            <DataTable
              columns={retailerColumns}
              rows={retailersAwaitingApproval}
              searchKeys={[]}
              defaultPageSize={8}
              enableExport={false}
            />
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)]">
                Customers Awaiting Approval
              </h3>
              <Link href="/onboarding-approval?tab=customers&state=submitted">
                <button className="text-xs text-[var(--foreground)] hover:underline">
                  View All →
                </button>
              </Link>
            </div>
            <DataTable
              columns={customerColumns}
              rows={customersAwaitingApproval}
              searchKeys={[]}
              defaultPageSize={8}
              enableExport={false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}


