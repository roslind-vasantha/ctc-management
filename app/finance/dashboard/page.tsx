/**
 * Finance Dashboard
 *
 * Displays financial metrics: Gross Merchandise Value, revenue, success rates, and network breakdown.
 * Consumes: transactions, disputes, distributors
 */

"use client";

import { useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { DataTable } from "@/app/components/ui/DataTable";
import { LineSeries } from "@/app/components/charts/LineSeries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { fmtINR, fmtPercent, fmtDateIN, fmtNumber } from "@/lib/format";
import { transactions, disputes, distributors } from "@/lib/data";
import {
  getRange,
  filterByRange,
  sum,
  count,
  percent,
  groupByDay,
  groupBy,
} from "@/lib/dashboard";
import type { ColumnDef } from "@/lib/types";
import { Banknote } from "lucide-react";

export default function FinanceDashboardPage() {
  const [days, setDays] = useState<30 | 90>(30);
  const range = useMemo(() => getRange(days), [days]);

  // Filter data by range
  const rangeTransactions = useMemo(
    () => filterByRange(transactions, range),
    [range]
  );
  const successfulTxns = useMemo(
    () => rangeTransactions.filter((t) => t.status === "success"),
    [rangeTransactions]
  );

  // KPIs
  const gmv = useMemo(
    () => sum(successfulTxns, (t) => t.amount),
    [successfulTxns]
  );
  const successRate = useMemo(
    () => percent(count(successfulTxns), count(rangeTransactions)),
    [successfulTxns, rangeTransactions]
  );

  const netRevenue = useMemo(() => {
    const fees = sum(
      successfulTxns,
      (t) => t.feeFixed + (t.amount * t.feePercent) / 100
    );
    const mgmtCommission = sum(successfulTxns, (t) => t.commissionToMgmt);
    // Estimate chargebacks from disputes on successful transactions
    const chargebacks = sum(
      disputes.filter((d) => {
        const txn = successfulTxns.find((t) => t.id === d.transactionId);
        return txn && (d.status === "pending" || d.status === "processing");
      }),
      (d) => {
        const txn = successfulTxns.find((t) => t.id === d.transactionId);
        return txn?.amount || 0;
      }
    );
    return fees + mgmtCommission - chargebacks;
  }, [successfulTxns]);

  const avgFeePerTxn = useMemo(() => {
    const totalFees = sum(
      rangeTransactions,
      (t) => t.feeFixed + (t.amount * t.feePercent) / 100
    );
    return totalFees / count(rangeTransactions) || 0;
  }, [rangeTransactions]);

  // Charts data
  const gmvByDay = useMemo(() => {
    const gmvData = groupByDay(successfulTxns, (t) => t.amount);
    const revenueData = groupByDay(successfulTxns, (t) => {
      const fees = t.feeFixed + (t.amount * t.feePercent) / 100;
      return fees + t.commissionToMgmt;
    });

    // Merge by date
    const dateMap = new Map<
      string,
      { date: string; gmv: number; revenue: number }
    >();
    gmvData.forEach((item) => {
      dateMap.set(item.date, { date: item.date, gmv: item.value, revenue: 0 });
    });
    revenueData.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.revenue = item.value;
      } else {
        dateMap.set(item.date, {
          date: item.date,
          gmv: 0,
          revenue: item.value,
        });
      }
    });

    return Array.from(dateMap.values())
      .filter((item) => {
        const date = new Date(item.date);
        return date >= range.from && date <= range.to;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [successfulTxns, range]);

  const networkBreakdown = useMemo(() => {
    const byNetwork = groupBy(successfulTxns, (t) => t.cardBrand || "UNKNOWN");
    const networks = ["RUPAY", "VISA", "MASTERCARD", "AMEX"] as const;
    return networks.map((network) => ({
      network: network,
      gmv: sum(byNetwork[network] || [], (t) => t.amount),
    }));
  }, [successfulTxns]);

  // Top Contributors Table
  const topContributors = useMemo(() => {
    return distributors
      .map((dist) => {
        const distTxns = successfulTxns.filter(
          (t) => t.distributorId === dist.id
        );
        const txns = count(distTxns);
        const distGmv = sum(distTxns, (t) => t.amount);

        // Calculate net revenue: fees + mgmt commission - chargebacks
        const fees = sum(
          distTxns,
          (t) => t.feeFixed + (t.amount * t.feePercent) / 100
        );
        const mgmtCommissionFromTxns = sum(distTxns, (t) => t.commissionToMgmt);
        const chargebacks = sum(
          disputes.filter((d) => {
            const txn = distTxns.find((t) => t.id === d.transactionId);
            return txn && (d.status === "pending" || d.status === "processing");
          }),
          (d) => {
            const txn = distTxns.find((t) => t.id === d.transactionId);
            return txn?.amount || 0;
          }
        );
        const netRev = fees + mgmtCommissionFromTxns - chargebacks;

        // Management commission = 82% of net revenue
        const mgmtCommission = Math.round(netRev * 0.82);
        const yieldPct = percent(netRev, distGmv);

        return {
          distributor: dist.name,
          txns,
          gmv: distGmv,
          mgmtCommission,
          netRevenue: netRev,
          yieldPct,
        };
      })
      .sort((a, b) => b.netRevenue - a.netRevenue)
      .slice(0, 10);
  }, [successfulTxns, disputes]);

  const contributorColumns: ColumnDef<(typeof topContributors)[0]>[] = [
    { key: "distributor", label: "Distributor", sortable: true },
    {
      key: "txns",
      label: "Transactions",
      sortable: true,
      render: (row) => fmtNumber(row.txns),
    },
    {
      key: "gmv",
      label: "Gross Merchandise Value",
      sortable: true,
      render: (row) => fmtINR(row.gmv),
    },
    {
      key: "netRevenue",
      label: "Net Revenue",
      sortable: true,
      render: (row) => fmtINR(row.netRevenue),
    },
    {
      key: "mgmtCommission",
      label: "Mgmt Commission",
      sortable: true,
      render: (row) => fmtINR(row.mgmtCommission),
    },
    {
      key: "yieldPct",
      label: "Yield %",
      sortable: true,
      render: (row) => fmtPercent(row.yieldPct, 2),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-[var(--foreground)]" />
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">
            Finance
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 30
                ? "bg-[var(--foreground)] text-white"
                : "bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80"
            }`}
            onClick={() => setDays(30)}
          >
            30d
          </button>
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 90
                ? "bg-[var(--foreground)] text-white"
                : "bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80"
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
          header="Gross Merchandise Value"
          value={fmtINR(gmv)}
          subtext={`${count(successfulTxns)} successful transactions`}
          variant="success"
        />
        <Card
          header="Success Rate"
          value={fmtPercent(successRate, 1)}
          subtext={`Over last ${days} days`}
          variant="info"
        />
        <Card
          header="Net Revenue"
          value={fmtINR(netRevenue)}
          subtext="After chargebacks"
          variant="success"
        />
        <Card
          header="Average Fee "
          value={fmtINR(avgFeePerTxn)}
          subtext="Per transaction"
          variant="info"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Gross Merchandise Value vs Net Revenue
              </h3>
              <LineSeries
                data={gmvByDay}
                lines={[
                  {
                    dataKey: "gmv",
                    name: "Gross Merchandise Value",
                    color: "var(--foreground)",
                  },
                  {
                    dataKey: "revenue",
                    name: "Net Revenue",
                    color: "var(--success-border)",
                  },
                ]}
                height={300}
              />
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Gross Merchandise Value by Card Network
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={networkBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    dataKey="gmv"
                    tickFormatter={(value) => fmtINR(value)}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="network"
                    width={100}
                    tick={{ fill: "var(--text-color)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => fmtINR(value)}
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="gmv"
                    fill="var(--foreground)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Contributors Table */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
            Top Contributors (by Net Revenue)
          </h3>
          <DataTable
            columns={contributorColumns}
            rows={topContributors}
            searchKeys={["distributor"]}
            defaultPageSize={10}
            enableExport={true}
          />
        </div>
      </Card>
    </div>
  );
}
