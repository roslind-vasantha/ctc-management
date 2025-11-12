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
  
  // Top 3 distributors by commission
  const top3Distributors = useMemo(() => {
    const distCommissions = distributors.map((dist) => {
      const distTxns = transactions.filter((t) => t.distributorId === dist.id);
      const totalCommission = distTxns.reduce((sum, t) => sum + t.commissionToMgmt, 0);
      return { name: dist.name, value: totalCommission };
    });
    
    return distCommissions
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((d) => ({ ...d, name: d.name.slice(0, 25) }));
  }, [distributors, transactions]);
  
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
  
  // Suggestions
  const suggestions = useMemo(() => {
    const items: string[] = [];
    
    // High performer
    if (top3Distributors.length > 0) {
      items.push(`${top3Distributors[0].name} is your top distributor with ${fmtCurrency(top3Distributors[0].value)} in management commissions`);
    }
    
    // Pending KYC
    const pendingKyc = [...distributors, ...retailers, ...customers].filter(
      (e) => e.kycStatus === 'pending'
    );
    if (pendingKyc.length > 0) {
      items.push(`${pendingKyc.length} entities have pending KYC verification`);
    }
    
    // Growth rate
    const last30Days = transactions.filter(
      (t) => new Date(t.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const prev30Days = transactions.filter((t) => {
      const date = new Date(t.createdAt);
      return (
        date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
        date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
    });
    
    if (prev30Days.length > 0) {
      const growth = ((last30Days.length - prev30Days.length) / prev30Days.length) * 100;
      if (Math.abs(growth) > 5) {
        items.push(
          `Transaction volume ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared to previous 30 days`
        );
      }
    }
    
    return items;
  }, [distributors, retailers, customers, transactions, top3Distributors]);
  
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
        <Card
          header="Total Distributors"
          value={fmtNumber(kpis.totalDistributors)}
          subtext="Active distributors in network"
          icon={<Building2 size={20} />}
        />
        <Card
          header="Total Retailers"
          value={fmtNumber(kpis.totalRetailers)}
          subtext="Active retailers in network"
          icon={<Users size={20} />}
        />
        <Card
          header="Total Customers"
          value={fmtNumber(kpis.totalCustomers)}
          subtext="Registered customers"
          icon={<Users size={20} />}
        />
        <Card
          header="MTD GMV"
          value={fmtCurrency(kpis.mtdGmv)}
          subtext="Month-to-date gross merchandise value"
          icon={<TrendingUp size={20} />}
        />
        <Card
          header="MTD Transactions"
          value={fmtNumber(kpis.mtdTransactions)}
          subtext="Month-to-date transaction count"
          icon={<CreditCard size={20} />}
        />
        <Card
          header="MTD Commission"
          value={fmtCurrency(kpis.mtdCommission)}
          subtext="Month-to-date management commission"
          icon={<TrendingUp size={20} />}
          variant="success"
        />
      </div>
      
      {/* Top 3 Distributors */}
      <Card header="Top 3 Distributors by Commission">
        <BarMini data={top3Distributors} height={180} />
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
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card header="Insights & Suggestions">
          <ul className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-[var(--text-color)]"
              >
                <span className="text-[var(--foreground)] font-bold">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
