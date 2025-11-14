'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import type { UnifiedProfile } from '@/lib/types';
import { AlertTriangle, Save, X, TrendingUp, Percent } from 'lucide-react';

interface CommissionTabProps {
  profile: UnifiedProfile;
  currentCommission: {
    type: 'fixed' | 'percentage' | null;
    value: number;
    legacyFixed?: number;
    legacyPercent?: number;
  };
  onUpdateCommission: (type: 'fixed' | 'percentage', value: number) => void;
}

export const CommissionTab = ({
  profile,
  currentCommission,
  onUpdateCommission,
}: CommissionTabProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>(
    currentCommission.type || 'fixed'
  );
  const [commissionValue, setCommissionValue] = useState<string>(
    currentCommission.value?.toString() || '0'
  );
  const [errors, setErrors] = useState<{ value?: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when profile or commission changes
  useEffect(() => {
    setCommissionType(currentCommission.type || 'fixed');
    setCommissionValue(currentCommission.value?.toString() || '0');
    setIsEditMode(false);
    setHasChanges(false);
    setErrors({});
  }, [profile.id, currentCommission]);

  // Check for changes
  useEffect(() => {
    const valueChanged =
      parseFloat(commissionValue) !== currentCommission.value ||
      commissionType !== currentCommission.type;
    setHasChanges(valueChanged);
  }, [commissionType, commissionValue, currentCommission]);

  // Customers don't have commissions
  if (profile.userType === 'Customer') {
    return (
      <div className="border border-[var(--border)] rounded-xl p-12 text-center">
        <div className="text-[var(--muted-foreground)] mb-2">
          No Commission Configuration
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">
          Customers do not have commission settings.
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const numValue = parseFloat(commissionValue);

    if (isNaN(numValue) || commissionValue.trim() === '') {
      newErrors.value = 'Commission value is required';
    } else if (numValue < 0) {
      newErrors.value = 'Commission value cannot be negative';
    } else if (commissionType === 'percentage' && numValue > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    } else if (commissionType === 'fixed' && numValue > 1000) {
      newErrors.value = 'Fixed commission seems too high (max ₹1000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onUpdateCommission(commissionType, parseFloat(commissionValue));
    setIsEditMode(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setCommissionType(currentCommission.type || 'fixed');
    setCommissionValue(currentCommission.value?.toString() || '0');
    setIsEditMode(false);
    setHasChanges(false);
    setErrors({});
  };

  const hasLegacyData =
    currentCommission.legacyFixed !== undefined ||
    currentCommission.legacyPercent !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-1">
            Commission Configuration
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage commission rates for {profile.name}
          </p>
        </div>

        {!isEditMode ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            Edit Commission
          </Button>
        ) : (
          <div className="flex items-center gap-2">
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
              icon={Save}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Legacy Data Warning */}
      {hasLegacyData && !currentCommission.type && (
        <div className="bg-[#fff9e6] border border-[#fcd34d] rounded-xl p-4" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-[#92400e] mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <div className="font-semibold text-[#92400e] text-sm mb-1">
                Legacy Commission Data Detected
              </div>
              <div className="text-xs text-[#92400e]">
                This profile has old commission fields. Please update to the new format below.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Commission Display / Edit Form */}
      <div className="border border-[var(--border)] rounded-xl p-6">
        <div className="space-y-6">
          {/* Commission Type */}
          <div>
            <label htmlFor="commission-type" className="block text-sm font-medium text-[var(--text-color)] mb-3">
              Commission Type
            </label>
            {isEditMode ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCommissionType('fixed')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    commissionType === 'fixed'
                      ? 'border-[#3B82F6] bg-[#F0F7FF]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                  aria-pressed={commissionType === 'fixed'}
                >
                  <div className={`p-2 rounded-lg ${
                    commissionType === 'fixed' ? 'bg-[#3B82F6]' : 'bg-[var(--muted)]'
                  }`}>
                    <TrendingUp size={20} className={commissionType === 'fixed' ? 'text-white' : 'text-[var(--muted-foreground)]'} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-[var(--text-color)]">Fixed Amount</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Flat rate per transaction</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCommissionType('percentage')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    commissionType === 'percentage'
                      ? 'border-[#3B82F6] bg-[#F0F7FF]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                  aria-pressed={commissionType === 'percentage'}
                >
                  <div className={`p-2 rounded-lg ${
                    commissionType === 'percentage' ? 'bg-[#3B82F6]' : 'bg-[var(--muted)]'
                  }`}>
                    <Percent size={20} className={commissionType === 'percentage' ? 'text-white' : 'text-[var(--muted-foreground)]'} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-[var(--text-color)]">Percentage</div>
                    <div className="text-xs text-[var(--muted-foreground)]">% of transaction amount</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant={currentCommission.type === 'fixed' ? 'default' : 'default'}>
                  {currentCommission.type === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                </Badge>
              </div>
            )}
          </div>

          {/* Commission Value */}
          <div>
            <label htmlFor="commission-value" className="block text-sm font-medium text-[var(--text-color)] mb-2">
              Commission Value
            </label>
            {isEditMode ? (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {commissionType === 'fixed' ? '₹' : '%'}
                  </span>
                  <input
                    id="commission-value"
                    type="number"
                    step={commissionType === 'fixed' ? '0.01' : '0.1'}
                    min="0"
                    max={commissionType === 'percentage' ? '100' : undefined}
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                      errors.value ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder={commissionType === 'fixed' ? 'Enter amount' : 'Enter percentage'}
                    aria-invalid={!!errors.value}
                    aria-describedby={errors.value ? 'value-error' : undefined}
                  />
                </div>
                {errors.value && (
                  <p id="value-error" className="text-xs text-red-500 mt-1" role="alert">
                    {errors.value}
                  </p>
                )}
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {commissionType === 'fixed'
                    ? 'Fixed amount earned per successful transaction'
                    : 'Percentage of transaction amount earned as commission'}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-[var(--text-color)]">
                  {currentCommission.type === 'fixed'
                    ? `₹${currentCommission.value.toFixed(2)}`
                    : `${currentCommission.value.toFixed(2)}%`}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {currentCommission.type === 'fixed'
                    ? 'per transaction'
                    : 'of transaction amount'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy Data Display (if exists) */}
      {hasLegacyData && (
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--muted)]">
          <h4 className="text-sm font-semibold text-[var(--text-color)] mb-4">
            Legacy Commission Data
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {currentCommission.legacyFixed !== undefined && (
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Fixed Rate (Old)</div>
                <div className="text-sm font-medium text-[var(--text-color)]">
                  ₹{currentCommission.legacyFixed.toFixed(2)}
                </div>
              </div>
            )}
            {currentCommission.legacyPercent !== undefined && (
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Percent Rate (Old)</div>
                <div className="text-sm font-medium text-[var(--text-color)]">
                  {currentCommission.legacyPercent.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission Calculation Examples */}
      {!isEditMode && currentCommission.type && (
        <div className="border border-[var(--border)] rounded-xl p-6">
          <h4 className="text-sm font-semibold text-[var(--text-color)] mb-4">
            Commission Examples
          </h4>
          <div className="space-y-3">
            {[1000, 5000, 10000].map((amount) => {
              const commission =
                currentCommission.type === 'fixed'
                  ? currentCommission.value
                  : (amount * currentCommission.value) / 100;

              return (
                <div key={amount} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    Transaction: ₹{amount.toLocaleString('en-IN')}
                  </span>
                  <span className="font-medium text-[var(--text-color)]">
                    Commission: ₹{commission.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
