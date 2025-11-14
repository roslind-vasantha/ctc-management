/*
 * ONBOARDING APPROVAL PAGE - Comprehensive Refactor
 * 
 * Major changes implemented:
 * 1. Removed Distributor tabs completely - only Retailers and Customers shown
 * 2. Removed Distributor/Retailer dropdown filters; added Clear button for search
 * 3. Added onboardingState field to Retailers and Customers with strict validation:
 *    - PENDING: Missing one or more required fields (Personal/KYC/KYB/Agreement)
 *    - SUBMITTED: ALL fields complete and ready for management approval
 * 4. Implemented nested tabs: Retailers → (Pending/Submitted); Customers → (Pending/Submitted)
 * 5. Updated dashboard cards to show 4 cards: Pending/Awaiting Approval for both Retailers and Customers
 * 6. Expanded retailer review drawer to include:
 *    - Personal Information (Name, Email, Phone, City, Distributor)
 *    - KYC Documents (Aadhaar, PAN with view buttons)
 *    - KYB (Business Name, GST Number, Business PAN)
 *    - Commission (Type: Fixed/Percentage, Amount)
 *    - Agreement Document (PDF with view button)
 *    - Enhanced Risk Assessment (Document completeness, Business info status)
 * 7. Expanded customer review drawer to include:
 *    - Personal Information (Retailer, Name, Phone, Email, Date of Birth)
 *    - Employment Details (Company Name, Designation, Salary per Annum)
 *    - Document Verification (Aadhaar Document, PAN Document with view buttons)
 *    - Enhanced Risk Assessment (Identity verification, Documents, Employment completion)
 * 8. CSV export disabled for all tables (enableExport={false})
 * 9. Maintained Indian date format (fmtDateIN) throughout
 * 10. "View" button renamed to "Review" in Submitted tabs only
 * 
 * Business Rules:
 * - Retailer reaches "submitted" state ONLY when they complete:
 *   • Personal details (Name, Email, Phone)
 *   • KYC Documents (Both Aadhaar AND PAN uploaded)
 *   • KYB (Business Name, GST Number, Business PAN)
 *   • Commission settings
 *   • Agreement Document (Signed PDF)
 * 
 * - Customer reaches "submitted" state ONLY when they complete:
 *   • Personal Information (Retailer, Name, Phone, Email, Date of Birth)
 *   • Employment Details (Company Name, Designation, Salary per Annum)
 *   • Document Verification (Both Aadhaar AND PAN uploaded)
 * 
 * If ANY required field is missing, they remain in "pending" state.
 */

'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtDateIN, fmtCurrency } from '@/lib/format';
import type { ColumnDef, Retailer, Customer } from '@/lib/types';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function OnboardingApprovalPage() {
  const { retailers, customers, distributors, updateRetailer, updateCustomer } = useStore();
  const { showToast } = useToast();
  
  // State for review drawers
  const [reviewingRetailer, setReviewingRetailer] = useState<Retailer | null>(null);
  const [reviewingCustomer, setReviewingCustomer] = useState<Customer | null>(null);
  
  // Search states
  const [retailerSearch, setRetailerSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Sub-tab states
  const [retailerSubTab, setRetailerSubTab] = useState<'pending' | 'submitted'>('pending');
  const [customerSubTab, setCustomerSubTab] = useState<'pending' | 'submitted'>('pending');
  
  // Filter data by onboarding state
  const pendingRetailers = useMemo(
    () => retailers.filter((r) => r.onboardingState === 'pending'),
    [retailers]
  );
  
  const submittedRetailers = useMemo(
    () => retailers.filter((r) => r.onboardingState === 'submitted' && r.kycStatus === 'pending'),
    [retailers]
  );
  
  const pendingCustomers = useMemo(
    () => customers.filter((c) => c.onboardingState === 'pending'),
    [customers]
  );
  
  const submittedCustomers = useMemo(
    () => customers.filter((c) => c.onboardingState === 'submitted' && c.kycStatus === 'pending'),
    [customers]
  );
  
  // Summary card counts
  const summary = {
    pendingRetailers: pendingRetailers.length,
    awaitingRetailers: submittedRetailers.length,
    pendingCustomers: pendingCustomers.length,
    awaitingCustomers: submittedCustomers.length,
  };
  
  // Handlers
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
  
  // Retailer columns (City removed) - dynamic based on sub-tab
  const getRetailerColumns = (isSubmittedTab: boolean): ColumnDef<Retailer>[] => [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      render: (row) => fmtDateIN(row.createdAt),
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
          {/* Changed "View" → "Review" for Submitted tabs only per new UX requirement */}
          {isSubmittedTab ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];
  
  // Customer columns (Card details removed) - dynamic based on sub-tab
  const getCustomerColumns = (isSubmittedTab: boolean): ColumnDef<Customer>[] => [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      render: (row) => fmtDateIN(row.createdAt),
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
          {/* Changed "View" → "Review" for Submitted tabs only per new UX requirement */}
          {isSubmittedTab ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];
  
  // Create nested tab structure for Retailers
  const retailerSubTabs = [
    {
      id: 'pending',
      label: `Pending (${pendingRetailers.length})`,
      content: (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search retailers..."
              value={retailerSearch}
              onChange={(e) => setRetailerSearch(e.target.value)}
              className="flex-1"
            />
            {retailerSearch && (
              <Button
                variant="secondary"
                size="sm"
                icon={X}
                onClick={() => setRetailerSearch('')}
              >
                Clear
              </Button>
            )}
          </div>
          <DataTable
            columns={getRetailerColumns(false)}
            rows={pendingRetailers.filter((r) =>
              retailerSearch
                ? r.name.toLowerCase().includes(retailerSearch.toLowerCase()) ||
                  r.email.toLowerCase().includes(retailerSearch.toLowerCase()) ||
                  r.id.toLowerCase().includes(retailerSearch.toLowerCase())
                : true
            )}
            searchKeys={[]}
            defaultPageSize={10}
            enableExport={false}
          />
        </div>
      ),
    },
    {
      id: 'submitted',
      label: `Submitted (${submittedRetailers.length})`,
      content: (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search retailers..."
              value={retailerSearch}
              onChange={(e) => setRetailerSearch(e.target.value)}
              className="flex-1"
            />
            {retailerSearch && (
              <Button
                variant="secondary"
                size="sm"
                icon={X}
                onClick={() => setRetailerSearch('')}
              >
                Clear
              </Button>
            )}
          </div>
          <DataTable
            columns={getRetailerColumns(true)}
            rows={submittedRetailers.filter((r) =>
              retailerSearch
                ? r.name.toLowerCase().includes(retailerSearch.toLowerCase()) ||
                  r.email.toLowerCase().includes(retailerSearch.toLowerCase()) ||
                  r.id.toLowerCase().includes(retailerSearch.toLowerCase())
                : true
            )}
            searchKeys={[]}
            defaultPageSize={10}
            enableExport={false}
          />
        </div>
      ),
    },
  ];
  
  // Create nested tab structure for Customers
  const customerSubTabs = [
    {
      id: 'pending',
      label: `Pending (${pendingCustomers.length})`,
      content: (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="flex-1"
            />
            {customerSearch && (
              <Button
                variant="secondary"
                size="sm"
                icon={X}
                onClick={() => setCustomerSearch('')}
              >
                Clear
              </Button>
            )}
          </div>
          <DataTable
            columns={getCustomerColumns(false)}
            rows={pendingCustomers.filter((c) =>
              customerSearch
                ? c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.phone.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.id.toLowerCase().includes(customerSearch.toLowerCase())
                : true
            )}
            searchKeys={[]}
            defaultPageSize={10}
            enableExport={false}
          />
        </div>
      ),
    },
    {
      id: 'submitted',
      label: `Submitted (${submittedCustomers.length})`,
      content: (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="flex-1"
            />
            {customerSearch && (
              <Button
                variant="secondary"
                size="sm"
                icon={X}
                onClick={() => setCustomerSearch('')}
              >
                Clear
              </Button>
            )}
          </div>
          <DataTable
            columns={getCustomerColumns(true)}
            rows={submittedCustomers.filter((c) =>
              customerSearch
                ? c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.phone.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.id.toLowerCase().includes(customerSearch.toLowerCase())
                : true
            )}
            searchKeys={[]}
            defaultPageSize={10}
            enableExport={false}
          />
        </div>
      ),
    },
  ];
  
  // Primary tabs (top-level)
  const primaryTabs = [
    {
      id: 'retailers',
      label: 'Retailers',
      content: (
        <Card>
          <Tabs tabs={retailerSubTabs} defaultTab="pending" onChange={(tab) => setRetailerSubTab(tab as 'pending' | 'submitted')} />
        </Card>
      ),
    },
    {
      id: 'customers',
      label: 'Customers',
      content: (
        <Card>
          <Tabs tabs={customerSubTabs} defaultTab="pending" onChange={(tab) => setCustomerSubTab(tab as 'pending' | 'submitted')} />
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
          Review and approve pending onboarding requests across all user types
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          header="Pending Retailers"
          value={summary.pendingRetailers}
          subtext="Started but not completed onboarding"
          variant="warning"
        />
        <Card
          header="Retailers Awaiting Approval"
          value={summary.awaitingRetailers}
          subtext="Ready for review"
          variant="info"
        />
        <Card
          header="Pending Customers"
          value={summary.pendingCustomers}
          subtext="Started but not completed onboarding"
          variant="warning"
        />
        <Card
          header="Customers Awaiting Approval"
          value={summary.awaitingCustomers}
          subtext="Ready for management approval"
          variant="info"
        />
      </div>
      
      {/* Primary Tabs */}
      <Tabs tabs={primaryTabs} defaultTab="retailers" />
      
      {/* Retailer Review Modal */}
      {reviewingRetailer && (
        <Modal
          isOpen={!!reviewingRetailer}
          onClose={() => setReviewingRetailer(null)}
          title="Review Retailer Application"
          size="xl"
          footer={
            reviewingRetailer.kycStatus === 'pending' ? (
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
            ) : undefined
          }
        >
          <div className="space-y-6">
            {/* 1. PERSONAL INFORMATION */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Retailer ID
                  </label>
                  <p className="text-[var(--text-color)]">{reviewingRetailer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Onboarding State
                  </label>
                  <div className="mt-1">
                    <Badge variant={reviewingRetailer.onboardingState === 'submitted' ? 'success' : 'warning'}>
                      {reviewingRetailer.onboardingState}
                    </Badge>
                  </div>
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
                    Phone Number
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
                    Submitted
                  </label>
                  <p className="text-[var(--text-color)]">
                    {fmtDateIN(reviewingRetailer.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    KYC Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        reviewingRetailer.kycStatus === 'verified'
                          ? 'success'
                          : reviewingRetailer.kycStatus === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {reviewingRetailer.kycStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Distributor
                  </label>
                  <p className="text-[var(--text-color)]">
                    {distributors.find((d) => d.id === reviewingRetailer.distributorId)
                      ?.name || '—'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2. KYC DOCUMENTS */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                KYC Documents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Aadhaar Document
                  </label>
                  {reviewingRetailer.aadhaarDocument ? (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm text-[var(--text-color)]">
                        {reviewingRetailer.aadhaarDocument}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[var(--muted-foreground)] mt-2">—</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    PAN Document
                  </label>
                  {reviewingRetailer.panDocument ? (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm text-[var(--text-color)]">
                        {reviewingRetailer.panDocument}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[var(--muted-foreground)] mt-2">—</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 3. KYB (KNOW YOUR BUSINESS) */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Know Your Business (KYB)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Business Name
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingRetailer.businessName || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    GST Number
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingRetailer.gstNumber || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Business PAN
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingRetailer.businessPan || '—'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 4. COMMISSION */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Commission
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Commission Type
                  </label>
                  {reviewingRetailer.commissionType ? (
                    <div className="mt-1">
                      <Badge variant="info">
                        {reviewingRetailer.commissionType === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-[var(--text-color)]">—</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Commission Amount
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingRetailer.commissionAmount
                      ? reviewingRetailer.commissionType === 'fixed'
                        ? fmtCurrency(reviewingRetailer.commissionAmount)
                        : `${reviewingRetailer.commissionAmount}%`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 5. AGREEMENT DOCUMENT */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Agreement Document
              </h3>
              {reviewingRetailer.agreementDocument ? (
                <div className="flex items-center gap-2 p-4 bg-[var(--muted)] rounded-lg">
                  <span className="flex-1 text-sm text-[var(--text-color)]">
                    {reviewingRetailer.agreementDocument}
                  </span>
                  <Button variant="ghost" size="sm">
                    View PDF
                  </Button>
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  No agreement document uploaded
                </p>
              )}
            </div>
            
            {/* Risk Assessment */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Risk Assessment
              </h3>
              <div className="p-4 bg-[var(--info-bg)] rounded-lg">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Documents Submitted
                    </span>
                    <Badge variant={reviewingRetailer.aadhaarDocument && reviewingRetailer.panDocument && reviewingRetailer.agreementDocument ? 'success' : 'warning'}>
                      {reviewingRetailer.aadhaarDocument && reviewingRetailer.panDocument && reviewingRetailer.agreementDocument ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Business Information
                    </span>
                    <Badge variant={reviewingRetailer.businessName && reviewingRetailer.gstNumber ? 'success' : 'warning'}>
                      {reviewingRetailer.businessName && reviewingRetailer.gstNumber ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Customer Review Modal - Expanded with new fields */}
      {reviewingCustomer && (
        <Modal
          isOpen={!!reviewingCustomer}
          onClose={() => setReviewingCustomer(null)}
          title="Review Customer Application"
          size="xl"
          footer={
            reviewingCustomer.kycStatus === 'pending' ? (
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
            ) : undefined
          }
        >
          <div className="space-y-6">
            {/* 1. PERSONAL INFORMATION */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Customer ID
                  </label>
                  <p className="text-[var(--text-color)]">{reviewingCustomer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Onboarding State
                  </label>
                  <div className="mt-1">
                    <Badge variant={reviewingCustomer.onboardingState === 'submitted' ? 'success' : 'warning'}>
                      {reviewingCustomer.onboardingState}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Retailer
                  </label>
                  <p className="text-[var(--text-color)]">
                    {retailers.find((r) => r.id === reviewingCustomer.retailerId)?.name ||
                      '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Distributor
                  </label>
                  <p className="text-[var(--text-color)]">
                    {(() => {
                      const retailer = retailers.find(
                        (r) => r.id === reviewingCustomer.retailerId
                      );
                      const dist = retailer
                        ? distributors.find((d) => d.id === retailer.distributorId)
                        : null;
                      return dist?.name || '—';
                    })()}
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
                    Phone Number
                  </label>
                  <p className="text-[var(--text-color)]">{reviewingCustomer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Email
                  </label>
                  <p className="text-[var(--text-color)]">{reviewingCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Date of Birth
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingCustomer.dateOfBirth ? fmtDateIN(reviewingCustomer.dateOfBirth) : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Submitted
                  </label>
                  <p className="text-[var(--text-color)]">
                    {fmtDateIN(reviewingCustomer.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    KYC Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        reviewingCustomer.kycStatus === 'verified'
                          ? 'success'
                          : reviewingCustomer.kycStatus === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {reviewingCustomer.kycStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 2. EMPLOYMENT DETAILS */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Company Name
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingCustomer.companyName || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Designation
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingCustomer.designation || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Salary per Annum
                  </label>
                  <p className="text-[var(--text-color)]">
                    {reviewingCustomer.salaryPerAnnum
                      ? fmtCurrency(reviewingCustomer.salaryPerAnnum)
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 3. DOCUMENT VERIFICATION */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Document Verification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Aadhaar Document
                  </label>
                  {reviewingCustomer.aadhaarDocument ? (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm text-[var(--text-color)]">
                        {reviewingCustomer.aadhaarDocument}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[var(--muted-foreground)] mt-2">—</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    PAN Document
                  </label>
                  {reviewingCustomer.panDocument ? (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm text-[var(--text-color)]">
                        {reviewingCustomer.panDocument}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[var(--muted-foreground)] mt-2">—</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Risk Assessment
              </h3>
              <div className="p-4 bg-[var(--info-bg)] rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Identity Verification
                    </span>
                    <Badge variant={reviewingCustomer.aadhaarDocument ? 'success' : 'warning'}>
                      {reviewingCustomer.aadhaarDocument ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">Phone Validation</span>
                    <Badge variant="success">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Retailer Status
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Documents Submitted
                    </span>
                    <Badge variant={reviewingCustomer.aadhaarDocument && reviewingCustomer.panDocument ? 'success' : 'warning'}>
                      {reviewingCustomer.aadhaarDocument && reviewingCustomer.panDocument ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--info-text)]">
                      Employment Details
                    </span>
                    <Badge variant={reviewingCustomer.companyName && reviewingCustomer.designation && reviewingCustomer.salaryPerAnnum ? 'success' : 'warning'}>
                      {reviewingCustomer.companyName && reviewingCustomer.designation && reviewingCustomer.salaryPerAnnum ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
