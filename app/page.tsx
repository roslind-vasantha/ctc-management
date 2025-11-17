'use client';

import { useMemo, useState } from 'react';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { BarMini } from './components/charts/BarMini';
import { LineSeries } from './components/charts/LineSeries';
import { DataTable } from './components/ui/DataTable';
import { useStore } from '@/lib/store';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format';
import type { ColumnDef } from '@/lib/types';
import { Users, Building2, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type KPICardProps = {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary';
};

function KPICard({ label, value, subtext, icon, variant = 'default' }: KPICardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]',
        variant === 'primary'
          ? 'bg-[var(--primary)] text-white shadow-lg'
          : 'bg-white border border-gray-200 text-gray-900'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'rounded-lg p-3',
            variant === 'primary'
              ? 'bg-white/20'
              : 'bg-blue-50'
          )}
        >
          <div className={variant === 'primary' ? 'text-white' : 'text-[var(--primary)]'}>
            {icon}
          </div>
        </div>

        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-1',
              variant === 'primary' ? 'text-white/80' : 'text-gray-500'
            )}
          >
            {label}
          </p>
          <div className="h-1 w-12 bg-current opacity-20 rounded mb-3" />
          <p
            className={cn(
              'text-2xl font-bold mb-1',
              variant === 'primary' ? 'text-white' : 'text-gray-900'
            )}
          >
            {value}
          </p>
          <p
            className={cn(
              'text-sm',
              variant === 'primary' ? 'text-white/70' : 'text-gray-500'
            )}
          >
            {subtext}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { distributors, retailers, customers, transactions } = useStore();
  const [dateRange, setDateRange] = useState<30 | 90>(30);
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const mtdTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= monthStart
    );
    
    const mtdGmv = mtdTransactions.reduce((sum, t) => sum + t.amount, 0);
    const mtdCommission = mtdTransactions.reduce((sum, t) => sum + t.commissionToMgmt, 0);
    
    return {
      totalDistributors: distributors.length,
      totalRetailers: retailers.length,
      totalCustomers: customers.length,
      mtdGmv,
      mtdTransactions: mtdTransactions.length,
      mtdCommission,
    };
  }, [distributors, retailers, customers, transactions]);
  
  // Overall Business Performance Metrics
  const businessMetrics = useMemo(() => {
    // Only count successful transactions
    const successfulTxns = transactions.filter((t) => t.status === 'success');

    // Total Transaction Volume
    const totalVolume = successfulTxns.length;

    // GMV by Card Network
    const gmvByNetwork = successfulTxns.reduce((acc, t) => {
      const network = t.cardBrand || 'UNKNOWN';
      if (!acc[network]) {
        acc[network] = { gmv: 0, count: 0 };
      }
      acc[network].gmv += t.amount;
      acc[network].count += 1;
      return acc;
    }, {} as Record<string, { gmv: number; count: number }>);

    // Convert to array for chart
    const networkData = Object.entries(gmvByNetwork).map(([name, data]) => ({
      name,
      value: data.gmv,
      count: data.count,
    }));

    // Net Revenue (commissionToMgmt is the revenue for management)
    const netRevenue = successfulTxns.reduce((sum, t) => sum + t.commissionToMgmt, 0);

    // Yield Average (average margin per transaction)
    const yieldAverage = totalVolume > 0 ? netRevenue / totalVolume : 0;

    return {
      totalVolume,
      networkData,
      netRevenue,
      yieldAverage,
    };
  }, [transactions]);
  
  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((t) => {
        const distributor = distributors.find((d) => d.id === t.distributorId);
        const retailer = retailers.find((r) => r.id === t.retailerId);
        return {
          ...t,
          distributorName: distributor?.name || '-',
          retailerName: retailer?.name || '-',
        };
      });
  }, [transactions, distributors, retailers]);
  
  // Time series data
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    const days = dateRange;
    const data: Array<{ date: string; gmv: number; commission: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTxns = transactions.filter((t) => {
        const txDate = new Date(t.createdAt).toISOString().split('T')[0];
        return txDate === dateStr;
      });

      const gmv = dayTxns.reduce((sum, t) => sum + t.amount, 0);
      const commission = dayTxns.reduce((sum, t) => sum + t.commissionToMgmt, 0);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gmv,
        commission,
      });
    }

    return data;
  }, [transactions, dateRange]);
  
  const columns: ColumnDef<typeof recentTransactions[0]>[] = [
    { key: 'id', label: 'Transaction ID', sortable: true },
    {
      key: 'createdAt',
      label: 'Time',
      sortable: true,
      render: (row) => fmtDate(row.createdAt, 'relative'),
    },
    { key: 'distributorName', label: 'Distributor' },
    { key: 'retailerName', label: 'Retailer' },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => fmtCurrency(row.amount),
    },
    {
      key: 'commissionToMgmt',
      label: 'Mgmt Commission',
      sortable: true,
      render: (row) => fmtCurrency(row.commissionToMgmt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variant =
          row.status === 'success'
            ? 'success'
            : row.status === 'failed'
            ? 'danger'
            : row.status === 'processing'
            ? 'warning'
            : 'default';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Overview of your Card-to-Cash management platform
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          label="Total Distributors"
          value={fmtNumber(kpis.totalDistributors)}
          subtext="Active distributors in network"
          icon={<Building2 size={20} aria-hidden="true" />}
        />
        <KPICard
          label="Total Retailers"
          value={fmtNumber(kpis.totalRetailers)}
          subtext="Active retailers in network"
          icon={<Users size={20} aria-hidden="true" />}
        />
        <KPICard
          label="Total Customers"
          value={fmtNumber(kpis.totalCustomers)}
          subtext="Registered customers"
          icon={<Users size={20} aria-hidden="true" />}
        />
        <KPICard
          label="MTD GMV"
          value={fmtCurrency(kpis.mtdGmv)}
          subtext="Month-to-date gross merchandise value"
          icon={<TrendingUp size={20} aria-hidden="true" />}
        />
        <KPICard
          label="MTD Transactions"
          value={fmtNumber(kpis.mtdTransactions)}
          subtext="Month-to-date transaction count"
          icon={<CreditCard size={20} aria-hidden="true" />}
        />
        <KPICard
          label="MTD Commission"
          value={fmtCurrency(kpis.mtdCommission)}
          subtext="Month-to-date management commission"
          icon={<TrendingUp size={20} aria-hidden="true" />}
          variant="primary"
        />
      </div>
      
      {/* Overall Business Performance */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">
          Overall Business Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Total Transaction Volume"
            value={fmtNumber(businessMetrics.totalVolume)}
            subtext="Successful transactions count"
            icon={<CreditCard size={20} aria-hidden="true" />}
          />
          <KPICard
            label="Net Revenue"
            value={fmtCurrency(businessMetrics.netRevenue)}
            subtext="Total management commission"
            icon={<TrendingUp size={20} aria-hidden="true" />}
            variant="primary"
          />
          <KPICard
            label="Yield Average"
            value={fmtCurrency(businessMetrics.yieldAverage)}
            subtext="Average margin per transaction"
            icon={<TrendingUp size={20} aria-hidden="true" />}
          />
          <KPICard
            label="Card Networks"
            value={fmtNumber(businessMetrics.networkData.length)}
            subtext="Active payment networks"
            icon={<CreditCard size={20} aria-hidden="true" />}
          />
        </div>
      </div>

      {/* GMV by Card Network */}
      <Card header="GMV by Card Network">
        <BarMini data={businessMetrics.networkData} height={200} />
      </Card>
      
      {/* Time Series */}
      <Card header="GMV vs Commission Trend">
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <Button
              variant={dateRange === 30 ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              30 Days
            </Button>
            <Button
              variant={dateRange === 90 ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setDateRange(90)}
            >
              90 Days
            </Button>
          </div>
        </div>
        <LineSeries
          data={timeSeriesData}
          lines={[
            { dataKey: 'gmv', name: 'GMV', color: '#3b82f6' },
            { dataKey: 'commission', name: 'Commission', color: '#10b981' },
          ]}
          height={300}
        />
      </Card>
      
      {/* Recent Transactions */}
      <Card header="Recent Commissions">
        <DataTable
          columns={columns}
          rows={recentTransactions}
          defaultPageSize={10}
          compact
        />
      </Card>
    </div>
  );
}
