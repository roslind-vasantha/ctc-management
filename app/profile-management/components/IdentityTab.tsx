'use client';

import { Button } from '@/app/components/ui/Button';
import { StatusPill } from '@/app/components/ui/StatusPill';
import { KYCIcon } from '@/app/components/ui/KYCIcon';
import type { Document, KYCStatus } from '@/lib/types';
import { Eye, Upload } from 'lucide-react';

interface IdentityTabProps {
  kycStatus: KYCStatus;
  documents: Document[];
  onRequestReUpload: (docId: string) => void;
  onRequestReUploadAll: () => void;
}

export const IdentityTab = ({
  kycStatus,
  documents,
  onRequestReUpload,
  onRequestReUploadAll,
}: IdentityTabProps) => {
  return (
    <div className="space-y-6">
      {/* KYC Status */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">KYC Status</h3>
          <KYCIcon status={kycStatus} showLabel />
        </div>

        {kycStatus === 'Verified' && (
          <div className="bg-[#e6f9ee] border border-[#82d4a3] rounded-xl p-4 text-sm text-[#166534]">
            KYC verification completed successfully
          </div>
        )}

        {kycStatus === 'Pending' && (
          <div className="bg-[#fff9e6] border border-[#fcd34d] rounded-xl p-4 text-sm text-[#92400e]">
            KYC verification is pending review
          </div>
        )}

        {kycStatus === null && (
          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted-foreground)]">
            No KYC documents submitted
          </div>
        )}
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">Documents</h3>

        {documents.length > 0 ? (
          <>
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                      Document
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[var(--muted)]">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[var(--text-color)]">
                          {doc.type}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {doc.number}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doc.status === 'Verified' && (
                          <span className="inline-flex items-center gap-1 text-[#10B981] text-sm">
                            <KYCIcon status="Verified" />
                            Verified
                          </span>
                        )}
                        {doc.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 text-[#F59E0B] text-sm">
                            <KYCIcon status="Pending" />
                            Pending
                          </span>
                        )}
                        {doc.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 text-[#EF4444] text-sm">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              if (doc.url) window.open(doc.url, '_blank');
                            }}
                          >
                            View
                          </Button>
                          {doc.status !== 'Verified' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Upload}
                              onClick={() => onRequestReUpload(doc.id)}
                            >
                              Re-upload
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Button variant="secondary" onClick={onRequestReUploadAll} fullWidth>
                Request Re-upload All
              </Button>
            </div>
          </>
        ) : (
          <div className="border border-[var(--border)] rounded-xl p-8 text-center text-[var(--muted-foreground)]">
            No documents uploaded
          </div>
        )}
      </div>
    </div>
  );
};
