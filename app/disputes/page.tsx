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
import { fmtDate, fmtCurrency } from '@/lib/format';
import type { ColumnDef, Dispute } from '@/lib/types';
import { Eye, MessageSquare } from 'lucide-react';

export default function DisputesPage() {
  const { disputes, transactions, customers, updateDispute } = useStore();
  const { showToast } = useToast();
  
  const [viewingDispute, setViewingDispute] = useState<Dispute | null>(null);
  const [notes, setNotes] = useState('');
  
  // Calculate summary
  const summary = useMemo(() => {
    return {
      open: disputes.filter((d) => d.status === 'open').length,
      investigating: disputes.filter((d) => d.status === 'investigating').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      rejected: disputes.filter((d) => d.status === 'rejected').length,
    };
  }, [disputes]);
  
  const handleStatusUpdate = (
    dispute: Dispute,
    newStatus: 'investigating' | 'resolved' | 'rejected'
  ) => {
    updateDispute(dispute.id, {
      status: newStatus,
      notes: notes || dispute.notes,
    });
    showToast(`Dispute ${newStatus}`, 'success');
    setViewingDispute(null);
    setNotes('');
  };
  
  const columns: ColumnDef<Dispute>[] = [
    { key: 'id', label: 'Dispute ID', sortable: true },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    {
      key: 'raisedBy',
      label: 'Raised By',
      render: (row) => <Badge variant="info">{row.raisedBy}</Badge>,
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
          row.status === 'resolved'
            ? 'success'
            : row.status === 'rejected'
            ? 'danger'
            : row.status === 'investigating'
            ? 'warning'
            : 'default';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (row) => fmtDate(row.updatedAt, 'relative'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setViewingDispute(row);
            setNotes(row.notes || '');
          }}
        >
          View
        </Button>
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
        <Card header="Open Disputes" value={summary.open} subtext="Requires attention" />
        <Card
          header="Investigating"
          value={summary.investigating}
          subtext="Under review"
          variant="warning"
        />
        <Card
          header="Resolved"
          value={summary.resolved}
          subtext="Successfully resolved"
          variant="success"
        />
        <Card
          header="Rejected"
          value={summary.rejected}
          subtext="Rejected disputes"
          variant="danger"
        />
      </div>
      
      {/* Disputes Table */}
      <Card>
        <DataTable
          columns={columns}
          rows={disputes}
          searchKeys={['id', 'transactionId']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'open', label: 'Open' },
                { value: 'investigating', label: 'Investigating' },
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
            {
              key: 'raisedBy',
              label: 'Raised By',
              options: [
                { value: 'customer', label: 'Customer' },
                { value: 'retailer', label: 'Retailer' },
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
                  Raised By
                </label>
                <div className="mt-1">
                  <Badge variant="info">{viewingDispute.raisedBy}</Badge>
                </div>
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
                      viewingDispute.status === 'resolved'
                        ? 'success'
                        : viewingDispute.status === 'rejected'
                        ? 'danger'
                        : viewingDispute.status === 'investigating'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {viewingDispute.status}
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
            
            {/* Transaction Info */}
            {(() => {
              const txn = transactions.find(
                (t) => t.id === viewingDispute.transactionId
              );
              const customer = txn
                ? customers.find((c) => c.id === txn.customerId)
                : null;
              
              return txn ? (
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
                        {fmtCurrency(txn.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Card Brand
                      </label>
                      <div className="mt-1">
                        <Badge variant="info">{txn.cardBrand}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Transaction Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            txn.status === 'success'
                              ? 'success'
                              : txn.status === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Transaction Date
                      </label>
                      <p className="text-[var(--text-color)]">
                        {fmtDate(txn.createdAt, 'long')}
                      </p>
                    </div>
                    {customer && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Customer
                        </label>
                        <p className="text-[var(--text-color)]">
                          {customer.name} ({customer.email})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            
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
                {viewingDispute.status !== 'open' && (
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
            {viewingDispute.status !== 'resolved' &&
              viewingDispute.status !== 'rejected' && (
                <div className="border-t border-[var(--border)] pt-6">
                  <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3">
                    Actions
                  </h3>
                  <div className="flex gap-3">
                    {viewingDispute.status === 'open' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleStatusUpdate(viewingDispute, 'investigating')}
                      >
                        Move to Investigating
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => handleStatusUpdate(viewingDispute, 'resolved')}
                    >
                      Resolve Dispute
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(viewingDispute, 'rejected')}
                    >
                      Reject Dispute
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
}

