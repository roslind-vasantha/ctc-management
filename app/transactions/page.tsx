'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { filterByDateRange } from '@/lib/filters';
import type { ColumnDef, Transaction } from '@/lib/types';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, distributors, retailers, customers, updateTransaction } = useStore();
  const { showToast } = useToast();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCardBrand, setSelectedCardBrand] = useState('');
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [selectedTxns, setSelectedTxns] = useState<Set<string>>(new Set());
  
  // Apply filters
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    if (startDate || endDate) {
      result = filterByDateRange(result, startDate, endDate);
    }
    
    if (selectedDistributor) {
      result = result.filter((t) => t.distributorId === selectedDistributor);
    }
    
    if (selectedRetailer) {
      result = result.filter((t) => t.retailerId === selectedRetailer);
    }
    
    if (selectedStatus) {
      result = result.filter((t) => t.status === selectedStatus);
    }
    
    if (selectedCardBrand) {
      result = result.filter((t) => t.cardBrand === selectedCardBrand);
    }
    
    return result;
  }, [transactions, startDate, endDate, selectedDistributor, selectedRetailer, selectedStatus, selectedCardBrand]);
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalGmv = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = filteredTransactions.reduce(
      (sum, t) => sum + t.feeFixed + (t.amount * t.feePercent) / 100,
      0
    );
    const mgmtCommission = filteredTransactions.reduce(
      (sum, t) => sum + t.commissionToMgmt,
      0
    );
    const successCount = filteredTransactions.filter((t) => t.status === 'success').length;
    const successRate =
      filteredTransactions.length > 0
        ? (successCount / filteredTransactions.length) * 100
        : 0;
    
    return { totalGmv, totalFees, mgmtCommission, successRate };
  }, [filteredTransactions]);
  
  const handleBulkUpdate = (newStatus: 'success' | 'failed') => {
    selectedTxns.forEach((txnId) => {
      updateTransaction(txnId, {
        status: newStatus,
        completedAt: newStatus === 'success' ? new Date().toISOString() : undefined,
      });
    });
    
    showToast(`${selectedTxns.size} transactions updated to ${newStatus}`, 'success');
    setSelectedTxns(new Set());
  };
  
  const toggleSelection = (txnId: string) => {
    const newSelected = new Set(selectedTxns);
    if (newSelected.has(txnId)) {
      newSelected.delete(txnId);
    } else {
      newSelected.add(txnId);
    }
    setSelectedTxns(newSelected);
  };
  
  const columns: ColumnDef<Transaction>[] = [
    { key: 'id', label: 'Transaction ID', sortable: true },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => fmtDate(row.createdAt, 'short'),
    },
    {
      key: 'distributorId',
      label: 'Distributor',
      render: (row) => {
        const dist = distributors.find((d) => d.id === row.distributorId);
        return <span className="truncate max-w-[150px] block">{dist?.name || '-'}</span>;
      },
    },
    {
      key: 'retailerId',
      label: 'Retailer',
      render: (row) => {
        const retailer = retailers.find((r) => r.id === row.retailerId);
        return <span className="truncate max-w-[150px] block">{retailer?.name || '-'}</span>;
      },
    },
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
      key: 'cardBrand',
      label: 'Card',
      render: (row) => <Badge variant="info">{row.cardBrand}</Badge>,
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setViewingTransaction(row);
          }}
        >
          View
        </Button>
      ),
    },
  ];
  
  return (
    <div className="min-h-screen bg-[#F5F6FA] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">
            Monitor and manage all card-to-cash transactions
          </p>
        </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          header="Total GMV"
          value={fmtCurrency(kpis.totalGmv)}
          subtext={`${filteredTransactions.length} transactions`}
        />
        <Card
          header="Total Fees"
          value={fmtCurrency(kpis.totalFees)}
          subtext="Collected from customers"
          variant="info"
        />
        <Card
          header="Mgmt Commission"
          value={fmtCurrency(kpis.mgmtCommission)}
          subtext="Net revenue"
          variant="success"
        />
        <Card
          header="Success Rate"
          value={`${kpis.successRate.toFixed(1)}%`}
          subtext="Transaction success rate"
          variant={kpis.successRate >= 90 ? 'success' : 'warning'}
        />
      </div>
      
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
          />
          <Select
            label="Distributor"
            value={selectedDistributor}
            onChange={(e) => setSelectedDistributor(e.target.value)}
            options={[
              { value: '', label: 'All Distributors' },
              ...distributors.map((d) => ({ value: d.id, label: d.name })),
            ]}
            fullWidth
          />
          <Select
            label="Retailer"
            value={selectedRetailer}
            onChange={(e) => setSelectedRetailer(e.target.value)}
            options={[
              { value: '', label: 'All Retailers' },
              ...retailers.map((r) => ({ value: r.id, label: r.name })),
            ]}
            fullWidth
          />
          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'success', label: 'Success' },
              { value: 'failed', label: 'Failed' },
              { value: 'reversed', label: 'Reversed' },
            ]}
            fullWidth
          />
          <Select
            label="Card Brand"
            value={selectedCardBrand}
            onChange={(e) => setSelectedCardBrand(e.target.value)}
            options={[
              { value: '', label: 'All Brands' },
              { value: 'VISA', label: 'VISA' },
              { value: 'MASTERCARD', label: 'MASTERCARD' },
              { value: 'AMEX', label: 'AMEX' },
              { value: 'RUPAY', label: 'RUPAY' },
            ]}
            fullWidth
          />
        </div>
        
        {selectedTxns.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-[var(--info-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--info-text)]">
              {selectedTxns.size} transactions selected
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkUpdate('success')}
            >
              Mark as Success
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkUpdate('failed')}
            >
              Mark as Failed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTxns(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </Card>
      
      {/* Transactions Table */}
      <Card>
        <DataTable
          columns={columns}
          rows={filteredTransactions}
          searchKeys={['id']}
          defaultPageSize={25}
        />
      </Card>
      
      {/* Transaction Detail Modal */}
      {viewingTransaction && (
        <Modal
          isOpen={!!viewingTransaction}
          onClose={() => setViewingTransaction(null)}
          title="Transaction Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Transaction ID
                </label>
                <p className="text-[var(--text-color)]">{viewingTransaction.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      viewingTransaction.status === 'success'
                        ? 'success'
                        : viewingTransaction.status === 'failed'
                        ? 'danger'
                        : viewingTransaction.status === 'processing'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {viewingTransaction.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Amount
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtCurrency(viewingTransaction.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Card Brand
                </label>
                <div className="mt-1">
                  <Badge variant="info">{viewingTransaction.cardBrand}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Created At
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(viewingTransaction.createdAt, 'long')}
                </p>
              </div>
              {viewingTransaction.completedAt && (
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Completed At
                  </label>
                  <p className="text-[var(--text-color)]">
                    {fmtDate(viewingTransaction.completedAt, 'long')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Money Flow */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Money Flow
              </h3>
              <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Customer Card
                  </p>
                  <p className="font-semibold text-[var(--text-color)]">
                    {fmtCurrency(
                      viewingTransaction.amount +
                        viewingTransaction.feeFixed +
                        (viewingTransaction.amount * viewingTransaction.feePercent) / 100
                    )}
                  </p>
                </div>
                <ArrowRight className="text-[var(--muted-foreground)]" />
                <div className="text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Collection Account
                  </p>
                  <p className="font-semibold text-[var(--text-color)]">
                    {fmtCurrency(
                      viewingTransaction.amount +
                        viewingTransaction.feeFixed +
                        (viewingTransaction.amount * viewingTransaction.feePercent) / 100
                    )}
                  </p>
                </div>
                <ArrowRight className="text-[var(--muted-foreground)]" />
                <div className="text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Wallet</p>
                  <p className="font-semibold text-[var(--text-color)]">
                    {fmtCurrency(viewingTransaction.amount)}
                  </p>
                </div>
                <ArrowRight className="text-[var(--muted-foreground)]" />
                <div className="text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Customer Debit Card
                  </p>
                  <p className="font-semibold text-[var(--text-color)]">
                    {fmtCurrency(viewingTransaction.amount)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Fee Breakdown */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Fee Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Fixed Fee
                  </span>
                  <span className="font-medium text-[var(--text-color)]">
                    {fmtCurrency(viewingTransaction.feeFixed)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Percentage Fee ({viewingTransaction.feePercent}%)
                  </span>
                  <span className="font-medium text-[var(--text-color)]">
                    {fmtCurrency(
                      (viewingTransaction.amount * viewingTransaction.feePercent) / 100
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-sm font-semibold text-[var(--text-color)]">
                    Total Fees
                  </span>
                  <span className="font-bold text-[var(--text-color)]">
                    {fmtCurrency(
                      viewingTransaction.feeFixed +
                        (viewingTransaction.amount * viewingTransaction.feePercent) / 100
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Distributor Commission
                  </span>
                  <span className="font-medium text-[var(--text-color)]">
                    {fmtCurrency(viewingTransaction.commissionToDistributor)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-sm font-semibold text-[var(--success-text)]">
                    Management Commission
                  </span>
                  <span className="font-bold text-[var(--success-text)]">
                    {fmtCurrency(viewingTransaction.commissionToMgmt)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Entities */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Involved Parties
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Distributor
                  </label>
                  <p className="text-[var(--text-color)]">
                    {distributors.find((d) => d.id === viewingTransaction.distributorId)
                      ?.name || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Retailer
                  </label>
                  <p className="text-[var(--text-color)]">
                    {retailers.find((r) => r.id === viewingTransaction.retailerId)?.name ||
                      '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Customer
                  </label>
                  <p className="text-[var(--text-color)]">
                    {customers.find((c) => c.id === viewingTransaction.customerId)?.name ||
                      '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
}

