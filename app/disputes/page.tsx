'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtDate, fmtCurrency, fmtDateIN, fmtDateINDateOnly } from '@/lib/format';
import { Eye } from 'lucide-react';
import type { ColumnDef, Dispute } from '@/lib/types';

export default function DisputesPage() {
  const { disputes, transactions, customers, updateDispute } = useStore();
  const { showToast } = useToast();
  
  const [viewingDispute, setViewingDispute] = useState<Dispute | null>(null);
  const [notes, setNotes] = useState('');
  
  const selectedTransaction = viewingDispute
    ? transactions.find((t) => t.id === viewingDispute.transactionId)
    : null;
  const selectedCustomer = selectedTransaction
    ? customers.find((c) => c.id === selectedTransaction.customerId)
    : null;
  
  // Calculate summary
  const summary = useMemo(() => {
    return {
      pending: disputes.filter((d) => d.status === 'pending').length,
      processing: disputes.filter((d) => d.status === 'processing').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      rejected: disputes.filter((d) => d.status === 'rejected').length,
    };
  }, [disputes]);
  
  type DisputeRow = Dispute & {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };

  const disputeRows: DisputeRow[] = useMemo(() => {
    return disputes.map((dispute) => {
      const txn = transactions.find((t) => t.id === dispute.transactionId);
      const customer = txn ? customers.find((c) => c.id === txn.customerId) : null;
      return {
        ...dispute,
        customerName: customer?.name || 'Unknown customer',
        customerEmail: customer?.email || 'Not provided',
        customerPhone: customer?.phone || '—',
      };
    });
  }, [disputes, transactions, customers]);
  
  const handleStatusUpdate = (
    dispute: Dispute,
    newStatus: Dispute['status']
  ) => {
    updateDispute(dispute.id, {
      status: newStatus,
      notes: notes || dispute.notes,
    });
    showToast(`Dispute ${newStatus}`, 'success');
    setViewingDispute(null);
    setNotes('');
  };
  
  const columns: ColumnDef<DisputeRow>[] = [
    {
      key: 'id',
      label: 'Dispute ID',
      sortable: true,
      render: (row) => (
        <span className="inline-block max-w-[110px] truncate font-medium text-[var(--text-color)]">
          {row.id}
        </span>
      ),
    },
    {
      key: 'transactionId',
      label: 'Transaction ID',
      sortable: true,
      render: (row) => (
        <span className="inline-block max-w-[120px] truncate text-[var(--text-color)]">
          {row.transactionId}
        </span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      width: 180,
      render: (row) => (
        <span className="font-medium text-[var(--text-color)] truncate inline-block w-[180px]">
          {row.customerName}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => {
        const reasonLabels: Record<Dispute['reason'], string> = {
          'not-credited': 'Not Credited',
          'amount-mismatch': 'Amount Mismatch',
          duplicate: 'Duplicate',
          other: 'Other',
        };
        return reasonLabels[row.reason];
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variant =
          row.status === 'pending'
            ? 'warning'
            : row.status === 'processing'
            ? 'info'
            : row.status === 'resolved'
            ? 'success'
            : 'danger';
        const label =
          row.status.charAt(0).toUpperCase() + row.status.slice(1);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (row) => (
        <span className="whitespace-nowrap">{fmtDateINDateOnly(row.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 100,
      render: (row) => (
        <button
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-[var(--foreground)] text-white cursor-pointer hover:opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            setViewingDispute(row);
            setNotes(row.notes || '');
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </button>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Disputes</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage transaction disputes and customer issues
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 bg-[var(--foreground)] text-white shadow-sm">
          <div className="text-sm font-medium">Pending</div>
          <div className="text-[30px] font-bold mt-1">{summary.pending}</div>
          <div className="text-sm mt-1 text-white/90">Awaiting review</div>
        </div>
        <Card
          header="Processing"
          value={summary.processing}
          subtext="Under review"
          variant="default"
        />
        <Card
          header="Resolved"
          value={summary.resolved}
          subtext="Successfully resolved"
          variant="default"
        />
        <Card
          header="Rejected"
          value={summary.rejected}
          subtext="Rejected disputes"
          variant="default"
        />
      </div>
      
      {/* Disputes Table */}
      <Card>
        <DataTable
          columns={columns}
          rows={disputeRows}
          searchKeys={['id', 'transactionId', 'customerName', 'customerEmail', 'customerPhone']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
            {
              key: 'reason',
              label: 'Reason',
              options: [
                { value: 'not-credited', label: 'Not Credited' },
                { value: 'amount-mismatch', label: 'Amount Mismatch' },
                { value: 'duplicate', label: 'Duplicate' },
                { value: 'other', label: 'Other' },
              ],
            },
          ]}
          defaultPageSize={10}
        />
      </Card>
      
      {/* Dispute Detail Modal */}
      {viewingDispute && (
        <Modal
          isOpen={!!viewingDispute}
          onClose={() => {
            setViewingDispute(null);
            setNotes('');
          }}
          title="Dispute Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Dispute ID
                </label>
                <p className="text-[var(--text-color)]">{viewingDispute.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Transaction ID
                </label>
                <p className="text-[var(--text-color)]">{viewingDispute.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Reason
                </label>
                <p className="text-[var(--text-color)]">
                  {viewingDispute.reason
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      viewingDispute.status === 'pending'
                        ? 'warning'
                        : viewingDispute.status === 'processing'
                        ? 'info'
                        : viewingDispute.status === 'resolved'
                        ? 'success'
                        : viewingDispute.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {viewingDispute.status.charAt(0).toUpperCase() +
                      viewingDispute.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Created
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(viewingDispute.createdAt, 'long')}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Last Updated
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(viewingDispute.updatedAt, 'long')}
                </p>
              </div>
            </div>
            
            {/* Customer Info */}
            {selectedCustomer && (
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                  Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Name
                    </label>
                    <p className="text-[var(--text-color)]">
                      {selectedCustomer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Email
                    </label>
                    <p className="text-[var(--text-color)]">
                      {selectedCustomer.email || 'Not shared'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Phone
                    </label>
                    <p className="text-[var(--text-color)]">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Card
                    </label>
                    <p className="text-[var(--text-color)]">
                      {selectedCustomer.cardBrand || 'Card'}{' '}
                      {selectedCustomer.cardLast4
                        ? `•••• ${selectedCustomer.cardLast4}`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Transaction Info */}
            {selectedTransaction && (
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                  Transaction Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Amount
                    </label>
                    <p className="text-[var(--text-color)]">
                      {fmtCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Card Brand
                    </label>
                    <div className="mt-1">
                      <Badge variant="info">{selectedTransaction.cardBrand}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Transaction Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedTransaction.status === 'success'
                            ? 'success'
                            : selectedTransaction.status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Transaction Date
                    </label>
                    <p className="text-[var(--text-color)]">
                      {fmtDate(selectedTransaction.createdAt, 'long')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Timeline */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[var(--foreground)] rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-color)]">
                      Dispute Created
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {fmtDate(viewingDispute.createdAt, 'long')}
                    </p>
                  </div>
                </div>
                {viewingDispute.status !== 'pending' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[var(--foreground)] rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-color)]">
                        Status Updated to {viewingDispute.status}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {fmtDate(viewingDispute.updatedAt, 'long')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div className="border-t border-[var(--border)] pt-6">
              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-color)] min-h-[100px]"
                placeholder="Add notes about this dispute..."
              />
            </div>
            
            {/* Actions */}
            {viewingDispute.status !== 'resolved' && viewingDispute.status !== 'rejected' && (
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {viewingDispute.status === 'pending' && (
                    <Button
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleStatusUpdate(viewingDispute, 'processing')}
                    >
                      Mark as Processing
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    className="cursor-pointer"
                    onClick={() => handleStatusUpdate(viewingDispute, 'resolved')}
                  >
                    Resolve Dispute
                  </Button>
                  {(viewingDispute.status === 'pending' || viewingDispute.status === 'processing') && (
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleStatusUpdate(viewingDispute, 'rejected')}
                    >
                      Reject Dispute
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

