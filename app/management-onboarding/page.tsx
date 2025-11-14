'use client';

import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { FileUpload } from '../components/ui/FileUpload';
import { Select } from '../components/ui/Select';
import { useStore } from '@/lib/store';
import type { Distributor, Retailer, Customer } from '@/lib/types';
import { Share2 } from 'lucide-react';

type TabType = 'distributor' | 'retailer' | 'customer';

export default function ManagementOnboardingPage() {
  const { distributors, retailers, customers, addDistributor, addRetailer, addCustomer } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('distributor');

  // Distributor Form State
  const [distributorForm, setDistributorForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaarDoc: null as File | null,
    panDoc: null as File | null,
    businessName: '',
    gstNumber: '',
    businessPan: '',
    commissionType: 'fixed' as 'fixed' | 'percentage',
    commissionValue: '5.0',
    agreementDoc: null as File | null,
  });

  // Retailer Form State
  const [retailerForm, setRetailerForm] = useState({
    distributorId: '',
    name: '',
    email: '',
    phone: '',
    aadhaarDoc: null as File | null,
    panDoc: null as File | null,
    businessName: '',
    gstNumber: '',
    businessPan: '',
    commissionType: 'fixed' as 'fixed' | 'percentage',
    commissionValue: '5.0',
    agreementDoc: null as File | null,
  });

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    retailerId: '',
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    companyName: '',
    designation: '',
    salaryPerAnnum: '',
    aadhaarDoc: null as File | null,
    panDoc: null as File | null,
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleDistributorEmailChange = (email: string) => {
    setDistributorForm({ ...distributorForm, email });
    if (email && !validateEmail(email)) {
      setErrors({ ...errors, email: 'Invalid email format' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleDistributorPhoneChange = (phone: string) => {
    setDistributorForm({ ...distributorForm, phone });
    if (phone && !validatePhone(phone)) {
      setErrors({ ...errors, phone: 'Phone must be 10 digits' });
    } else {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleRetailerEmailChange = (email: string) => {
    setRetailerForm({ ...retailerForm, email });
    if (email && !validateEmail(email)) {
      setErrors({ ...errors, email: 'Invalid email format' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleRetailerPhoneChange = (phone: string) => {
    setRetailerForm({ ...retailerForm, phone });
    if (phone && !validatePhone(phone)) {
      setErrors({ ...errors, phone: 'Phone must be 10 digits' });
    } else {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleCustomerPhoneChange = (phone: string) => {
    setCustomerForm({ ...customerForm, phone });
    if (phone && !validatePhone(phone)) {
      setErrors({ ...errors, phone: 'Phone must be 10 digits' });
    } else {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleCustomerEmailChange = (email: string) => {
    setCustomerForm({ ...customerForm, email });
    if (email && !validateEmail(email)) {
      setErrors({ ...errors, email: 'Invalid email format' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleDistributorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(distributorForm.email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    if (!validatePhone(distributorForm.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const newDistributor: Distributor = {
      id: `D${String(distributors.length + 1).padStart(3, '0')}`,
      name: distributorForm.name,
      email: distributorForm.email,
      phone: distributorForm.phone,
      kycStatus: 'pending',
      businessName: distributorForm.businessName,
      gstNumber: distributorForm.gstNumber,
      businessPan: distributorForm.businessPan,
      commissionType: distributorForm.commissionType,
      commissionValue: parseFloat(distributorForm.commissionValue),
      commissionRateFixed: distributorForm.commissionType === 'fixed' ? parseFloat(distributorForm.commissionValue) : 0,
      commissionRatePercent: distributorForm.commissionType === 'percentage' ? parseFloat(distributorForm.commissionValue) : 0,
      monthVolume: 0,
      monthGmv: 0,
      createdAt: new Date().toISOString(),
      active: true,
    };

    addDistributor(newDistributor);

    // Send app link
    sendAppLink(distributorForm.phone, 'distributor', newDistributor.name);
    showToast('Distributor created successfully and app link sent', 'success');

    // Reset form
    setDistributorForm({
      name: '',
      email: '',
      phone: '',
      aadhaarDoc: null,
      panDoc: null,
      businessName: '',
      gstNumber: '',
      businessPan: '',
      commissionType: 'fixed',
      commissionValue: '5.0',
      agreementDoc: null,
    });
    setErrors({ email: '', phone: '' });
  };

  const handleRetailerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!retailerForm.distributorId) {
      showToast('Please select a distributor', 'error');
      return;
    }

    if (!validateEmail(retailerForm.email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    if (!validatePhone(retailerForm.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const newRetailer: Retailer = {
      id: `R${String(retailers.length + 1).padStart(3, '0')}`,
      distributorId: retailerForm.distributorId,
      name: retailerForm.name,
      email: retailerForm.email,
      phone: retailerForm.phone,
      kycStatus: 'pending',
      businessName: retailerForm.businessName,
      gstNumber: retailerForm.gstNumber,
      businessPan: retailerForm.businessPan,
      commissionType: retailerForm.commissionType,
      commissionValue: parseFloat(retailerForm.commissionValue),
      monthVolume: 0,
      monthGmv: 0,
      createdAt: new Date().toISOString(),
      active: true,
    };

    addRetailer(newRetailer);

    // Send app link
    sendAppLink(retailerForm.phone, 'retailer', newRetailer.name);
    showToast('Retailer created successfully and app link sent', 'success');

    // Reset form
    setRetailerForm({
      distributorId: '',
      name: '',
      email: '',
      phone: '',
      aadhaarDoc: null,
      panDoc: null,
      businessName: '',
      gstNumber: '',
      businessPan: '',
      commissionType: 'fixed',
      commissionValue: '5.0',
      agreementDoc: null,
    });
    setErrors({ email: '', phone: '' });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerForm.retailerId) {
      showToast('Please select a retailer', 'error');
      return;
    }

    if (!validatePhone(customerForm.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (customerForm.email && !validateEmail(customerForm.email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    const newCustomer: Customer = {
      id: `C${String(customers.length + 1).padStart(3, '0')}`,
      retailerId: customerForm.retailerId,
      name: customerForm.name,
      phone: customerForm.phone,
      email: customerForm.email || undefined,
      dateOfBirth: customerForm.dateOfBirth || undefined,
      companyName: customerForm.companyName || undefined,
      designation: customerForm.designation || undefined,
      salaryPerAnnum: customerForm.salaryPerAnnum ? parseFloat(customerForm.salaryPerAnnum) : undefined,
      createdAt: new Date().toISOString(),
      active: true,
    };

    addCustomer(newCustomer);

    // Send app link
    sendAppLink(customerForm.phone, 'customer', newCustomer.name);
    showToast('Customer created successfully and app link sent', 'success');

    // Reset form
    setCustomerForm({
      retailerId: '',
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      companyName: '',
      designation: '',
      salaryPerAnnum: '',
      aadhaarDoc: null,
      panDoc: null,
    });
    setErrors({ email: '', phone: '' });
  };

  const sendAppLink = (phone: string, userType: 'distributor' | 'retailer' | 'customer', name: string) => {
    // In a real application, this would call an API to send SMS/WhatsApp
    const appLink = 'https://app.ctc-management.sa/download';
    console.log(`Sending app link to ${name} (${userType}) at ${phone}: ${appLink}`);
    // Simulate sending message
    showToast(`App link sent to ${phone}`, 'info');
  };

  const copyShareLink = () => {
    let url = '';
    if (activeTab === 'distributor') {
      url = 'www.distributor.credit2cash.com';
    } else if (activeTab === 'retailer') {
      url = 'www.retailer.credit2cash.com';
    } else {
      url = 'www.credit2cash.com';
    }

    navigator.clipboard.writeText(url)
      .then(() => {
        showToast('Link copied to clipboard!', 'success');
      })
      .catch(() => {
        showToast('Failed to copy link', 'error');
      });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1.5 bg-[var(--muted)] rounded-full p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('distributor')}
              className={`flex-1 py-1.5 px-4 text-sm font-medium transition-all rounded-full ${
                activeTab === 'distributor'
                  ? 'bg-white text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--text-color)]'
              }`}
            >
              Distributor
            </button>
            <button
              onClick={() => setActiveTab('retailer')}
              className={`flex-1 py-1.5 px-4 text-sm font-medium transition-all rounded-full ${
                activeTab === 'retailer'
                  ? 'bg-white text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--text-color)]'
              }`}
            >
              Retailer
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-1.5 px-4 text-sm font-medium transition-all rounded-full ${
                activeTab === 'customer'
                  ? 'bg-white text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--text-color)]'
              }`}
            >
              Customer
            </button>
          </div>
        </div>

        {/* Forms Container */}
        <div className="bg-white rounded-4xl shadow-sm p-8">
          {/* Share Link Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--info-bg)] rounded-lg transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>

          {/* Distributor Form */}
          {activeTab === 'distributor' && (
            <form onSubmit={handleDistributorSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Name"
                    value={distributorForm.name}
                    onChange={(e) => setDistributorForm({ ...distributorForm, name: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={distributorForm.email}
                    onChange={(e) => handleDistributorEmailChange(e.target.value)}
                    errorText={errors.email}
                    required
                    fullWidth
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={distributorForm.phone}
                    onChange={(e) => handleDistributorPhoneChange(e.target.value)}
                    errorText={errors.phone}
                    required
                    fullWidth
                    helperText="10-digit phone number"
                  />
                </div>
              </div>

              {/* KYC Documents & KYB Combined Row */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  KYC Documents
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <FileUpload
                    label="Aadhaar Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={distributorForm.aadhaarDoc}
                    onFileSelect={(file) => setDistributorForm({ ...distributorForm, aadhaarDoc: file })}
                    fullWidth
                  />
                  <FileUpload
                    label="PAN Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={distributorForm.panDoc}
                    onFileSelect={(file) => setDistributorForm({ ...distributorForm, panDoc: file })}
                    fullWidth
                  />
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4 mt-6">
                  KYB (Know Your Business)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Business Name"
                    value={distributorForm.businessName}
                    onChange={(e) => setDistributorForm({ ...distributorForm, businessName: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="GST Number"
                    value={distributorForm.gstNumber}
                    onChange={(e) => setDistributorForm({ ...distributorForm, gstNumber: e.target.value })}
                    fullWidth
                    helperText="e.g., 22AAAAA0000A1Z5"
                  />
                  <Input
                    label="Business PAN"
                    value={distributorForm.businessPan}
                    onChange={(e) => setDistributorForm({ ...distributorForm, businessPan: e.target.value })}
                    fullWidth
                    helperText="10-character PAN number"
                  />
                </div>
              </div>

              {/* Commission */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Commission
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-normal text-[var(--text-color)] mb-2">
                      Commission Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="distributorCommissionType"
                          value="fixed"
                          checked={distributorForm.commissionType === 'fixed'}
                          onChange={() => setDistributorForm({ ...distributorForm, commissionType: 'fixed' })}
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--text-color)]">Fixed Amount</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="distributorCommissionType"
                          value="percentage"
                          checked={distributorForm.commissionType === 'percentage'}
                          onChange={() => setDistributorForm({ ...distributorForm, commissionType: 'percentage' })}
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--text-color)]">Percentage</span>
                      </label>
                    </div>
                  </div>
                  <Input
                    label={distributorForm.commissionType === 'fixed' ? 'Commission Amount' : 'Commission Percentage'}
                    type="number"
                    step="0.01"
                    value={distributorForm.commissionValue}
                    onChange={(e) => setDistributorForm({ ...distributorForm, commissionValue: e.target.value })}
                    required
                    fullWidth
                    helperText={
                      distributorForm.commissionType === 'fixed'
                        ? 'Fixed amount per transaction'
                        : 'Percentage of transaction amount'
                    }
                  />
                  <div>{/* Empty column */}</div>
                </div>
              </div>

              {/* Agreement Document */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Agreement Document
                </h3>
                <FileUpload
                  accept=".pdf"
                  maxSize={25}
                  value={distributorForm.agreementDoc}
                  onFileSelect={(file) => setDistributorForm({ ...distributorForm, agreementDoc: file })}
                  helperText="Upload signed business agreement (PDF only)"
                  fullWidth
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setDistributorForm({
                      name: '',
                      email: '',
                      phone: '',
                      aadhaarDoc: null,
                      panDoc: null,
                      businessName: '',
                      gstNumber: '',
                      businessPan: '',
                      commissionType: 'fixed',
                      commissionValue: '5.0',
                      agreementDoc: null,
                    });
                    setErrors({ email: '', phone: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </form>
          )}

          {/* Retailer Form */}
          {activeTab === 'retailer' && (
            <form onSubmit={handleRetailerSubmit} className="space-y-6">
              {/* Distributor Selection & Personal Information Combined */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <Select
                    label="Select Distributor"
                    value={retailerForm.distributorId}
                    onChange={(e) => setRetailerForm({ ...retailerForm, distributorId: e.target.value })}
                    options={distributors.map(d => ({ value: d.id, label: `${d.name} (${d.id})` }))}
                    placeholder="Select a distributor"
                    required
                    fullWidth
                  />
                  <Input
                    label="Name"
                    value={retailerForm.name}
                    onChange={(e) => setRetailerForm({ ...retailerForm, name: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={retailerForm.email}
                    onChange={(e) => handleRetailerEmailChange(e.target.value)}
                    errorText={errors.email}
                    required
                    fullWidth
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={retailerForm.phone}
                    onChange={(e) => handleRetailerPhoneChange(e.target.value)}
                    errorText={errors.phone}
                    required
                    fullWidth
                    helperText="10-digit phone number"
                  />
                </div>
              </div>

              {/* KYC Documents & KYB Combined Row */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  KYC Documents
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <FileUpload
                    label="Aadhaar Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={retailerForm.aadhaarDoc}
                    onFileSelect={(file) => setRetailerForm({ ...retailerForm, aadhaarDoc: file })}
                    fullWidth
                  />
                  <FileUpload
                    label="PAN Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={retailerForm.panDoc}
                    onFileSelect={(file) => setRetailerForm({ ...retailerForm, panDoc: file })}
                    fullWidth
                  />
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4 mt-6">
                  KYB (Know Your Business)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Business Name"
                    value={retailerForm.businessName}
                    onChange={(e) => setRetailerForm({ ...retailerForm, businessName: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="GST Number"
                    value={retailerForm.gstNumber}
                    onChange={(e) => setRetailerForm({ ...retailerForm, gstNumber: e.target.value })}
                    fullWidth
                    helperText="e.g., 22AAAAA0000A1Z5"
                  />
                  <Input
                    label="Business PAN"
                    value={retailerForm.businessPan}
                    onChange={(e) => setRetailerForm({ ...retailerForm, businessPan: e.target.value })}
                    fullWidth
                    helperText="10-character PAN number"
                  />
                </div>
              </div>

              {/* Commission */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Commission
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-normal text-[var(--text-color)] mb-2">
                      Commission Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="retailerCommissionType"
                          value="fixed"
                          checked={retailerForm.commissionType === 'fixed'}
                          onChange={() => setRetailerForm({ ...retailerForm, commissionType: 'fixed' })}
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--text-color)]">Fixed Amount</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="retailerCommissionType"
                          value="percentage"
                          checked={retailerForm.commissionType === 'percentage'}
                          onChange={() => setRetailerForm({ ...retailerForm, commissionType: 'percentage' })}
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--text-color)]">Percentage</span>
                      </label>
                    </div>
                  </div>
                  <Input
                    label={retailerForm.commissionType === 'fixed' ? 'Commission Amount' : 'Commission Percentage'}
                    type="number"
                    step="0.01"
                    value={retailerForm.commissionValue}
                    onChange={(e) => setRetailerForm({ ...retailerForm, commissionValue: e.target.value })}
                    required
                    fullWidth
                    helperText={
                      retailerForm.commissionType === 'fixed'
                        ? 'Fixed amount per transaction'
                        : 'Percentage of transaction amount'
                    }
                  />
                  <div>{/* Empty column */}</div>
                </div>
              </div>

              {/* Agreement Document */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Agreement Document
                </h3>
                <FileUpload
                  accept=".pdf"
                  maxSize={25}
                  value={retailerForm.agreementDoc}
                  onFileSelect={(file) => setRetailerForm({ ...retailerForm, agreementDoc: file })}
                  helperText="Upload signed business agreement (PDF only)"
                  fullWidth
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setRetailerForm({
                      distributorId: '',
                      name: '',
                      email: '',
                      phone: '',
                      aadhaarDoc: null,
                      panDoc: null,
                      businessName: '',
                      gstNumber: '',
                      businessPan: '',
                      commissionType: 'fixed',
                      commissionValue: '5.0',
                      agreementDoc: null,
                    });
                    setErrors({ email: '', phone: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </form>
          )}

          {/* Customer Form */}
          {activeTab === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              {/* Section 1: Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  <Select
                    label="Select Retailer"
                    value={customerForm.retailerId}
                    onChange={(e) => setCustomerForm({ ...customerForm, retailerId: e.target.value })}
                    options={retailers.map(r => ({ value: r.id, label: `${r.name} (${r.id})` }))}
                    placeholder="Select a retailer"
                    required
                    fullWidth
                  />
                  <Input
                    label="Name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    required
                    fullWidth
                    helperText="Name as exact in Aadhaar"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    errorText={errors.phone}
                    required
                    fullWidth
                    helperText="10-digit phone number"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => handleCustomerEmailChange(e.target.value)}
                    errorText={errors.email}
                    fullWidth
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={customerForm.dateOfBirth}
                    onChange={(e) => setCustomerForm({ ...customerForm, dateOfBirth: e.target.value })}
                    fullWidth
                  />
                </div>
              </div>

              {/* Section 2: Employment Details */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Employment Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Company Name"
                    value={customerForm.companyName}
                    onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="Designation"
                    value={customerForm.designation}
                    onChange={(e) => setCustomerForm({ ...customerForm, designation: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="Salary per Annum"
                    type="number"
                    step="0.01"
                    value={customerForm.salaryPerAnnum}
                    onChange={(e) => setCustomerForm({ ...customerForm, salaryPerAnnum: e.target.value })}
                    fullWidth
                    helperText="Annual salary in INR"
                  />
                </div>
              </div>

              {/* Section 3: Document Verification */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--border)] pb-2.5 mb-4">
                  Document Verification
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload
                    label="Aadhaar Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={customerForm.aadhaarDoc}
                    onFileSelect={(file) => setCustomerForm({ ...customerForm, aadhaarDoc: file })}
                    fullWidth
                    helperText="Upload Aadhaar card (PDF/Image)"
                  />
                  <FileUpload
                    label="PAN Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={25}
                    value={customerForm.panDoc}
                    onFileSelect={(file) => setCustomerForm({ ...customerForm, panDoc: file })}
                    fullWidth
                    helperText="Upload PAN card (PDF/Image)"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setCustomerForm({
                      retailerId: '',
                      name: '',
                      phone: '',
                      email: '',
                      dateOfBirth: '',
                      companyName: '',
                      designation: '',
                      salaryPerAnnum: '',
                      aadhaarDoc: null,
                      panDoc: null,
                    });
                    setErrors({ email: '', phone: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
