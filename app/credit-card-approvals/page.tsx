'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { useManagementUser } from '@/lib/store';
import { fmtCurrency, fmtDate } from '@/lib/format';
import type { ColumnDef, CreditCardApproval } from '@/lib/types';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

export default function CreditCardApprovalsPage() {
  const { cardApprovals, customers, updateCardApproval } = useStore();
  const [user] = useManagementUser();
  const { showToast } = useToast();
  
  const [reviewingApproval, setReviewingApproval] = useState<CreditCardApproval | null>(
    null
  );
  
  // Calculate summary
  const summary = useMemo(() => {
    return {
      pending: cardApprovals.filter((ca) => ca.status === 'pending').length,
      approved: cardApprovals.filter((ca) => ca.status === 'approved').length,
      rejected: cardApprovals.filter((ca) => ca.status === 'rejected').length,
    };
  }, [cardApprovals]);
  
  const handleApprove = (approval: CreditCardApproval) => {
    updateCardApproval(approval.id, {
      status: 'approved',
      reviewer: user.name,
      reviewedAt: new Date().toISOString(),
    });
    showToast('Credit card application approved', 'success');
    setReviewingApproval(null);
  };
  
  const handleReject = (approval: CreditCardApproval) => {
    updateCardApproval(approval.id, {
      status: 'rejected',
      reviewer: user.name,
      reviewedAt: new Date().toISOString(),
    });
    showToast('Credit card application rejected', 'warning');
    setReviewingApproval(null);
  };
  
  const columns: ColumnDef<CreditCardApproval>[] = [
    { key: 'id', label: 'Application ID', sortable: true },
    {
      key: 'customerId',
      label: 'Customer',
      render: (row) => {
        const customer = customers.find((c) => c.id === row.customerId);
        return customer?.name || '-';
      },
    },
    {
      key: 'cardBrand',
      label: 'Card Brand',
      render: (row) => <Badge variant="info">{row.cardBrand}</Badge>,
    },
    {
      key: 'cardLast4',
      label: 'Card Last 4',
      render: (row) => `**** ${row.cardLast4}`,
    },
    {
      key: 'limitRequested',
      label: 'Limit Requested',
      sortable: true,
      render: (row) => fmtCurrency(row.limitRequested),
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (row) => `${row.documents.length} files`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variant =
          row.status === 'approved'
            ? 'success'
            : row.status === 'rejected'
            ? 'danger'
            : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      render: (row) => fmtDate(row.createdAt, 'relative'),
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
            setReviewingApproval(row);
          }}
        >
          {row.status === 'pending' ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
          Credit Card Approvals
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Review and approve credit card limit requests
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          header="Pending Approvals"
          value={summary.pending}
          subtext="Awaiting review"
          variant="warning"
        />
        <Card
          header="Approved"
          value={summary.approved}
          subtext="Successfully approved"
          variant="success"
        />
        <Card header="Rejected" value={summary.rejected} subtext="Applications rejected" />
      </div>
      
      {/* Approvals Table */}
      <Card>
        <DataTable
          columns={columns}
          rows={cardApprovals}
          searchKeys={['id', 'customerId']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
            {
              key: 'cardBrand',
              label: 'Card Brand',
              options: [
                { value: 'VISA', label: 'VISA' },
                { value: 'MASTERCARD', label: 'MASTERCARD' },
                { value: 'AMEX', label: 'AMEX' },
                { value: 'RUPAY', label: 'RUPAY' },
              ],
            },
          ]}
          defaultPageSize={10}
        />
      </Card>
      
      {/* Review Modal */}
      {reviewingApproval && (
        <Modal
          isOpen={!!reviewingApproval}
          onClose={() => setReviewingApproval(null)}
          title="Credit Card Application Review"
          size="lg"
          footer={
            reviewingApproval.status === 'pending' ? (
              <>
                <Button
                  variant="destructive"
                  icon={XCircle}
                  onClick={() => handleReject(reviewingApproval)}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  icon={CheckCircle}
                  onClick={() => handleApprove(reviewingApproval)}
                >
                  Approve
                </Button>
              </>
            ) : undefined
          }
        >
          <div className="space-y-6">
            {/* Application Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Application ID
                </label>
                <p className="text-[var(--text-color)]">{reviewingApproval.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      reviewingApproval.status === 'approved'
                        ? 'success'
                        : reviewingApproval.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {reviewingApproval.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Submitted
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(reviewingApproval.createdAt, 'long')}
                </p>
              </div>
              {reviewingApproval.reviewedAt && (
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Reviewed
                  </label>
                  <p className="text-[var(--text-color)]">
                    {fmtDate(reviewingApproval.reviewedAt, 'long')}
                  </p>
                </div>
              )}
              {reviewingApproval.reviewer && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Reviewer
                  </label>
                  <p className="text-[var(--text-color)]">{reviewingApproval.reviewer}</p>
                </div>
              )}
            </div>
            
            {/* Customer Info */}
            {(() => {
              const customer = customers.find(
                (c) => c.id === reviewingApproval.customerId
              );
              return customer ? (
                <div className="border-t border-[var(--border)] pt-6">
                  <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Customer ID
                      </label>
                      <p className="text-[var(--text-color)]">{customer.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        KYC Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            customer.kycStatus === 'verified'
                              ? 'success'
                              : customer.kycStatus === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {customer.kycStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Name
                      </label>
                      <p className="text-[var(--text-color)]">{customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Email
                      </label>
                      <p className="text-[var(--text-color)]">{customer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Phone
                      </label>
                      <p className="text-[var(--text-color)]">{customer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        Member Since
                      </label>
                      <p className="text-[var(--text-color)]">
                        {fmtDate(customer.createdAt, 'short')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            
            {/* Card Details */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Card Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Card Brand
                  </label>
                  <div className="mt-1">
                    <Badge variant="info">{reviewingApproval.cardBrand}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Card Number
                  </label>
                  <p className="text-[var(--text-color)]">
                    **** **** **** {reviewingApproval.cardLast4}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Limit Requested
                  </label>
                  <p className="text-2xl font-bold text-[var(--text-color)]">
                    {fmtCurrency(reviewingApproval.limitRequested)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Documents */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Supporting Documents
              </h3>
              <div className="space-y-2">
                {reviewingApproval.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                  >
                    <FileText size={20} className="text-[var(--muted-foreground)]" />
                    <span className="flex-1 text-sm text-[var(--text-color)]">
                      {doc.name}
                    </span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Risk Assessment
              </h3>
              <div className="space-y-3 p-4 bg-[var(--info-bg)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Credit Score Check
                  </span>
                  <Badge variant="success">Passed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Income Verification
                  </span>
                  <Badge variant="success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Fraud Check
                  </span>
                  <Badge variant="success">Clear</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Existing Limits
                  </span>
                  <span className="text-sm font-medium text-[var(--info-text)]">
                    {fmtCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--info-border)]">
                  <span className="text-sm font-semibold text-[var(--info-text)]">
                    Overall Risk
                  </span>
                  <Badge variant="success">Low</Badge>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

