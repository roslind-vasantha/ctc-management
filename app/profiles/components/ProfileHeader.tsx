'use client';

import { useState, useEffect } from 'react';
import { StatusPill } from '@/app/components/ui/StatusPill';
import { UserTypeBadge } from '@/app/components/ui/UserTypeBadge';
import { KYCIcon } from '@/app/components/ui/KYCIcon';
import { AlertTriangle, ArrowLeft, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import type { UnifiedProfile, ProfileStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { fmtDate } from '@/lib/format';

interface ProfileHeaderProps {
  profile: UnifiedProfile;
  onSaveChanges: (updates: { name: string; email: string; phone: string; status: ProfileStatus }) => void;
}

export const ProfileHeader = ({ profile, onSaveChanges }: ProfileHeaderProps) => {
  const router = useRouter();
  const needsKYC = profile.kycStatus !== 'Verified';
  const isDistributor = profile.userType === 'Distributor';
  const isRetailer = profile.userType === 'Retailer';
  const requiresVerification = isDistributor || isRetailer;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  const [editedPhone, setEditedPhone] = useState(profile.phone);
  const [editedStatus, setEditedStatus] = useState(profile.status);
  const [hasChanges, setHasChanges] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  // Reset form when profile changes
  useEffect(() => {
    setEditedName(profile.name);
    setEditedEmail(profile.email);
    setEditedPhone(profile.phone);
    setEditedStatus(profile.status);
    setIsEditMode(false);
    setHasChanges(false);
    setErrors({});
  }, [profile.id, profile.name, profile.email, profile.phone, profile.status]);

  // Check for changes
  useEffect(() => {
    const changed =
      editedName !== profile.name ||
      editedEmail !== profile.email ||
      editedPhone !== profile.phone ||
      editedStatus !== profile.status;
    setHasChanges(changed);
  }, [editedName, editedEmail, editedPhone, editedStatus, profile]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!editedName.trim()) {
      newErrors.name = 'Name is required';
    } else if (editedName.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editedEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(editedEmail)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!editedPhone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!phoneRegex.test(editedPhone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSaveChanges({
      name: editedName.trim(),
      email: editedEmail.trim(),
      phone: editedPhone.trim(),
      status: editedStatus,
    });

    setIsEditMode(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditedName(profile.name);
    setEditedEmail(profile.email);
    setEditedPhone(profile.phone);
    setEditedStatus(profile.status);
    setIsEditMode(false);
    setHasChanges(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-medium text-[var(--text-color)] hover:bg-[#f9fafb] transition-colors"
        aria-label="Back to Profile Management"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to Profile Management
      </button>

      {/* KYC/KYB Warning Banner */}
      {requiresVerification && needsKYC && (
        <div className="bg-[#fff9e6] border-2 border-[#fcd34d] rounded-xl p-4" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#92400e] mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <div className="font-semibold text-[#92400e] mb-1">
                {isDistributor ? 'KYB' : 'KYC'} Verification Required
              </div>
              <div className="text-sm text-[#92400e]">
                {isDistributor
                  ? 'This distributor cannot view or manage transactions until KYB verification is completed. Please upload and verify all required business documents in the Identity & Docs tab.'
                  : 'This retailer cannot view or manage transactions until KYC verification is completed. Please upload and verify all required documents in the Identity & Docs tab.'}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const tabButtons = document.querySelectorAll('[role="tab"]');
                const identityTab = Array.from(tabButtons).find(
                  (btn) => btn.textContent?.includes('Identity')
                );
                if (identityTab) {
                  (identityTab as HTMLButtonElement).click();
                }
              }}
            >
              Go to Identity & Docs
            </Button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="border border-[#e5e7eb] rounded-xl p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-color)]">
              {isEditMode ? 'Edit Profile' : 'Profile Details'}
            </h1>
            <UserTypeBadge type={profile.userType} />
          </div>

          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button
                variant="primary"
                size="sm"
                icon={Edit2}
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Left Column: Identity Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-4">Identity Information</h3>
              <div className="space-y-5">
                {/* Editable: Name */}
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    Name {isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  {isEditMode ? (
                    <div>
                      <input
                        id="profile-name"
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                          errors.name ? 'border-red-500' : 'border-[#e5e7eb]'
                        }`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-xs text-red-500 mt-1" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[var(--text-color)] font-medium">{profile.name}</div>
                  )}
                </div>

                {/* Editable: Email */}
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    Email {isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  {isEditMode ? (
                    <div>
                      <input
                        id="profile-email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                          errors.email ? 'border-red-500' : 'border-[#e5e7eb]'
                        }`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[var(--text-color)]">{profile.email}</div>
                  )}
                </div>

                {/* Editable: Phone */}
                <div>
                  <label htmlFor="profile-phone" className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    Phone {isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  {isEditMode ? (
                    <div>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                          errors.phone ? 'border-red-500' : 'border-[#e5e7eb]'
                        }`}
                        placeholder="10-digit phone number"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-xs text-red-500 mt-1" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <a href={`tel:${profile.phone}`} className="text-[#3B82F6] hover:underline">
                      {profile.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e5e7eb]" />

            <div className="space-y-5">
              {/* Editable: Status */}
              <div>
                <label htmlFor="profile-status" className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  Status
                </label>
                {isEditMode ? (
                  <select
                    id="profile-status"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as ProfileStatus)}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending KYC">Pending KYC</option>
                  </select>
                ) : (
                  <StatusPill status={profile.status} />
                )}
              </div>

              {/* Non-editable: KYC Status */}
              <div className={isEditMode ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-[var(--text-color)] mb-2">KYC Status</div>
                <KYCIcon status={profile.kycStatus} showLabel />
              </div>

              {/* Non-editable: Profile ID */}
              <div className={isEditMode ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-[var(--text-color)] mb-2">Profile ID</div>
                <div className="text-[var(--muted-foreground)] text-sm font-mono">{profile.id}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Metrics & Relationships */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-4">Performance Metrics</h3>
              <div className="space-y-5">
                {/* Non-editable: GMV */}
                <div className={isEditMode ? 'opacity-50' : ''}>
                  <div className="text-sm font-medium text-[var(--text-color)] mb-2">GMV</div>
                  <div className="text-2xl font-bold text-[var(--text-color)]">₹{profile.gmv.toLocaleString('en-IN')}</div>
                </div>

                {/* Non-editable: Total Transactions */}
                <div className={isEditMode ? 'opacity-50' : ''}>
                  <div className="text-sm font-medium text-[var(--text-color)] mb-2">Total Transactions</div>
                  <div className="text-xl font-semibold text-[var(--text-color)]">{profile.totalTransactions}</div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e5e7eb]" />

            <div className="space-y-5">
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Additional Information</h3>

              {/* Non-editable: Onboarded By */}
              <div className={isEditMode ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-[var(--text-color)] mb-2">Onboarded By</div>
                <div className="text-[var(--muted-foreground)] text-sm">
                  {profile.onboardedBy === 'Admin'
                    ? 'Admin'
                    : profile.onboardedBy.name}
                </div>
              </div>

              {/* Non-editable: Created Date */}
              <div className={isEditMode ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-[var(--text-color)] mb-2">Created</div>
                <div className="text-[var(--muted-foreground)] text-sm">{fmtDate(profile.created, 'long')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
