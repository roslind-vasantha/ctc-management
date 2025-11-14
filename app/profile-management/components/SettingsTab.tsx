'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { UserTypeBadge } from '@/app/components/ui/UserTypeBadge';
import type { UnifiedProfile, UserType } from '@/lib/types';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface SettingsTabProps {
  profile: UnifiedProfile;
  availableParents?: Array<{ id: string; name: string; type: UserType; active: boolean }>;
  onReassignParent: (newParentId: string, reason: string) => void;
  onSuspend: (reason: string) => void;
  onActivate: () => void;
  onDelete: () => void;
}

export const SettingsTab = ({
  profile,
  availableParents,
  onReassignParent,
  onSuspend,
  onActivate,
  onDelete,
}: SettingsTabProps) => {
  const [reassignMode, setReassignMode] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [reassignReason, setReassignReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const canReassign =
    profile.status === 'Active' &&
    availableParents &&
    availableParents.length > 0;

  const handleReassignSubmit = () => {
    if (selectedParent && reassignReason.trim()) {
      onReassignParent(selectedParent, reassignReason);
      setReassignMode(false);
      setSelectedParent('');
      setReassignReason('');
    }
  };

  const handleSuspend = () => {
    if (suspendReason.trim()) {
      onSuspend(suspendReason);
      setSuspendReason('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Reassign Parent */}
      {profile.userType !== 'Distributor' && (
        <div className="border border-[var(--border)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            Reassign Parent
          </h3>

          {/* Current Parent */}
          <div className="mb-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-2">Current Parent:</div>
            {profile.onboardedBy !== 'Admin' ? (
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-color)] font-medium">
                  {profile.onboardedBy.name}
                </span>
                <UserTypeBadge type={profile.onboardedBy.type} />
              </div>
            ) : (
              <span className="text-[var(--text-color)] font-medium">Admin</span>
            )}
          </div>

          {!canReassign && (
            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--muted-foreground)]">
              {profile.status === 'Suspended'
                ? 'Profile must be Active to reassign parent'
                : 'No available parents to reassign to'}
            </div>
          )}

          {canReassign && !reassignMode && (
            <Button variant="secondary" onClick={() => setReassignMode(true)} fullWidth>
              Change Parent
            </Button>
          )}

          {canReassign && reassignMode && (
            <div className="space-y-4">
              {/* Step 1: Choose Parent */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  Step 1: Choose new{' '}
                  {profile.userType === 'Retailer' ? 'Distributor' : 'Retailer'}
                </label>
                <div className="space-y-2">
                  {availableParents?.map((parent) => (
                    <div
                      key={parent.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedParent === parent.id
                          ? 'border-[#3B82F6] bg-[#F0F7FF]'
                          : 'border-[var(--border)] hover:bg-[var(--muted)]'
                      }`}
                      onClick={() => setSelectedParent(parent.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-color)]">
                          {parent.name}
                        </span>
                        <UserTypeBadge type={parent.type} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Validation */}
              {selectedParent && (
                <div className="bg-[#e6f9ee] border border-[#82d4a3] rounded-lg p-3">
                  <div className="text-sm text-[#166534] space-y-1">
                    <div>✓ New parent is Active</div>
                    <div>✓ Not same as current parent</div>
                  </div>
                </div>
              )}

              {/* Step 3: Reason */}
              {selectedParent && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    Step 3: Reason for reassignment
                  </label>
                  <textarea
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReassignMode(false);
                    setSelectedParent('');
                    setReassignReason('');
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReassignSubmit}
                  disabled={!selectedParent || !reassignReason.trim()}
                  fullWidth
                >
                  Confirm Reassignment
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suspend Account */}
      <div className="border border-[#e5e7eb] rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#fff9e6]">
            <AlertTriangle size={18} className="text-[#92400e]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text-color)] mb-1">
              {profile.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
            </h3>
            <p className="text-sm text-[#6b7280]">
              {profile.status === 'Active'
                ? 'Temporarily disable this account. The user will not be able to perform transactions.'
                : 'Reactivate this account. The user will be able to resume transactions.'}
            </p>
          </div>
        </div>

        {profile.status === 'Active' ? (
          <div className="space-y-3">
            <div>
              <label htmlFor="suspend-reason" className="block text-sm font-medium text-[var(--text-color)] mb-2">
                Reason for suspension <span className="text-red-500">*</span>
              </label>
              <textarea
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter detailed reason for suspending this account..."
                rows={3}
                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                aria-required="true"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
              fullWidth
            >
              Suspend Account
            </Button>
          </div>
        ) : (
          <Button variant="primary" onClick={onActivate} fullWidth>
            Activate Account
          </Button>
        )}
      </div>

      {/* Delete Profile */}
      <div className="border border-[#fca5a5] rounded-xl p-6 bg-[#fef2f2]">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#dc2626]">
            <AlertTriangle size={18} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#991b1b] mb-1">
              Delete Profile
            </h3>
            <p className="text-sm text-[#991b1b]">
              Permanently remove this profile and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#fca5a5] rounded-lg p-4 mb-4">
          <div className="text-sm text-[#991b1b] space-y-2">
            <div className="font-semibold">This will permanently delete:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Profile information and contact details</li>
              <li>Transaction history and records</li>
              <li>Relationship connections</li>
              <li>All associated documents</li>
            </ul>
          </div>
        </div>

        <label className="flex items-start gap-3 mb-4 cursor-pointer p-3 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#fef2f2] transition-colors">
          <input
            type="checkbox"
            checked={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.checked)}
            className="mt-1"
            aria-describedby="delete-confirm-label"
          />
          <span id="delete-confirm-label" className="text-sm text-[var(--text-color)]">
            Yes, I understand this action is permanent and cannot be undone. I want to delete this profile.
          </span>
        </label>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirm(false)}
            disabled={!deleteConfirm}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={!deleteConfirm}
            fullWidth
          >
            Permanently Delete Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
