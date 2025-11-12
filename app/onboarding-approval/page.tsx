'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtDate } from '@/lib/format';
import type { ColumnDef, Retailer, Customer } from '@/lib/types';
import { CheckCircle, XCircle } from 'lucide-react';

export default function OnboardingApprovalPage() {
  const { retailers, customers, distributors, updateRetailer, updateCustomer } = useStore();
  const { showToast } = useToast();
  
  const [reviewingRetailer, setReviewingRetailer] = useState<Retailer | null>(null);
  const [reviewingCustomer, setReviewingCustomer] = useState<Customer | null>(null);
  
  const pendingRetailers = useMemo(
    () => retailers.filter((r) => r.kycStatus === 'pending'),
    [retailers]
  );
  
  const pendingCustomers = useMemo(
    () => customers.filter((c) => c.kycStatus === 'pending'),
    [customers]
  );
  
  const handleApproveRetailer = (retailer: Retailer) => {
    updateRetailer(retailer.id, { kycStatus: 'verified' });
    showToast('Retailer approved successfully', 'success');
    setReviewingRetailer(null);
  };
  
  const handleRejectRetailer = (retailer: Retailer) => {
    updateRetailer(retailer.id, { kycStatus: 'rejected' });
    showToast('Retailer rejected', 'warning');
    setReviewingRetailer(null);
  };
  
  const handleApproveCustomer = (customer: Customer) => {
    updateCustomer(customer.id, { kycStatus: 'verified' });
    showToast('Customer approved successfully', 'success');
    setReviewingCustomer(null);
  };
  
  const handleRejectCustomer = (customer: Customer) => {
    updateCustomer(customer.id, { kycStatus: 'rejected' });
    showToast('Customer rejected', 'warning');
    setReviewingCustomer(null);
  };
  
  const retailerColumns: ColumnDef<Retailer>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City', sortable: true },
    {
      key: 'distributorId',
      label: 'Distributor',
      render: (row) => {
        const dist = distributors.find((d) => d.id === row.distributorId);
        return dist?.name || '-';
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
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setReviewingRetailer(row);
          }}
        >
          Review
        </Button>
      ),
    },
  ];
  
  const customerColumns: ColumnDef<Customer>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'cardBrand',
      label: 'Card Brand',
      render: (row) => <Badge variant="info">{row.cardBrand}</Badge>,
    },
    { key: 'cardLast4', label: 'Card Last 4' },
    {
      key: 'retailerId',
      label: 'Retailer',
      render: (row) => {
        const retailer = retailers.find((r) => r.id === row.retailerId);
        return retailer?.name || '-';
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
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setReviewingCustomer(row);
          }}
        >
          Review
        </Button>
      ),
    },
  ];
  
  const tabs = [
    {
      id: 'retailers',
      label: `Retailers (${pendingRetailers.length})`,
      content: (
        <Card>
          <DataTable
            columns={retailerColumns}
            rows={pendingRetailers}
            searchKeys={['name', 'email', 'city', 'id']}
            filters={[
              {
                key: 'city',
                label: 'City',
                options: Array.from(new Set(pendingRetailers.map((r) => r.city))).map(
                  (c) => ({ value: c, label: c })
                ),
              },
            ]}
            defaultPageSize={10}
          />
        </Card>
      ),
    },
    {
      id: 'customers',
      label: `Customers (${pendingCustomers.length})`,
      content: (
        <Card>
          <DataTable
            columns={customerColumns}
            rows={pendingCustomers}
            searchKeys={['name', 'email', 'id']}
            filters={[
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
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
          Onboarding Approval
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Review and approve pending retailer and customer onboarding requests
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          header="Pending Retailers"
          value={pendingRetailers.length}
          subtext="Retailers awaiting approval"
          variant="warning"
        />
        <Card
          header="Pending Customers"
          value={pendingCustomers.length}
          subtext="Customers awaiting approval"
          variant="warning"
        />
      </div>
      
      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="retailers" />
      
      {/* Retailer Review Modal */}
      {reviewingRetailer && (
        <Modal
          isOpen={!!reviewingRetailer}
          onClose={() => setReviewingRetailer(null)}
          title="Review Retailer Application"
          size="lg"
          footer={
            <>
              <Button
                variant="destructive"
                icon={XCircle}
                onClick={() => handleRejectRetailer(reviewingRetailer)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={() => handleApproveRetailer(reviewingRetailer)}
              >
                Approve
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Retailer ID
                </label>
                <p className="text-[var(--text-color)]">{reviewingRetailer.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Submitted
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(reviewingRetailer.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Name
                </label>
                <p className="text-[var(--text-color)]">{reviewingRetailer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Email
                </label>
                <p className="text-[var(--text-color)]">{reviewingRetailer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Phone
                </label>
                <p className="text-[var(--text-color)]">{reviewingRetailer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  City
                </label>
                <p className="text-[var(--text-color)]">{reviewingRetailer.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Distributor
                </label>
                <p className="text-[var(--text-color)]">
                  {distributors.find((d) => d.id === reviewingRetailer.distributorId)
                    ?.name || '-'}
                </p>
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div className="mt-6 p-4 bg-[var(--info-bg)] rounded-lg">
              <h3 className="text-sm font-semibold text-[var(--info-text)] mb-2">
                Risk Assessment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Email Verification
                  </span>
                  <Badge variant="success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Phone Verification
                  </span>
                  <Badge variant="success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Distributor Status
                  </span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Customer Review Modal */}
      {reviewingCustomer && (
        <Modal
          isOpen={!!reviewingCustomer}
          onClose={() => setReviewingCustomer(null)}
          title="Review Customer Application"
          size="lg"
          footer={
            <>
              <Button
                variant="destructive"
                icon={XCircle}
                onClick={() => handleRejectCustomer(reviewingCustomer)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={() => handleApproveCustomer(reviewingCustomer)}
              >
                Approve
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Customer ID
                </label>
                <p className="text-[var(--text-color)]">{reviewingCustomer.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Submitted
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(reviewingCustomer.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Name
                </label>
                <p className="text-[var(--text-color)]">{reviewingCustomer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Email
                </label>
                <p className="text-[var(--text-color)]">{reviewingCustomer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Phone
                </label>
                <p className="text-[var(--text-color)]">{reviewingCustomer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Card Brand
                </label>
                <div className="mt-1">
                  <Badge variant="info">{reviewingCustomer.cardBrand}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Card Last 4
                </label>
                <p className="text-[var(--text-color)]">
                  **** {reviewingCustomer.cardLast4}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Retailer
                </label>
                <p className="text-[var(--text-color)]">
                  {retailers.find((r) => r.id === reviewingCustomer.retailerId)?.name ||
                    '-'}
                </p>
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div className="mt-6 p-4 bg-[var(--info-bg)] rounded-lg">
              <h3 className="text-sm font-semibold text-[var(--info-text)] mb-2">
                Risk Assessment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Identity Verification
                  </span>
                  <Badge variant="success">Passed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">Card Validation</span>
                  <Badge variant="success">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--info-text)]">
                    Retailer Status
                  </span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

