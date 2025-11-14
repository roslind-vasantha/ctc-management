'use client';

import { UserTypeBadge } from '@/app/components/ui/UserTypeBadge';
import { StatusPill } from '@/app/components/ui/StatusPill';
import { KYCIcon } from '@/app/components/ui/KYCIcon';
import { fmtCurrency, fmtNumber, fmtDate } from '@/lib/format';
import type { ProfileRelationship, UserType } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface RelationshipsTabProps {
  userType: UserType;
  retailers?: ProfileRelationship[];
  customers?: ProfileRelationship[];
  onOpenProfile: (id: string) => void;
}

export const RelationshipsTab = ({
  userType,
  retailers,
  customers,
  onOpenProfile,
}: RelationshipsTabProps) => {
  // Customer view - empty state
  if (userType === 'Customer') {
    return (
      <div className="border border-[var(--border)] rounded-xl p-12 text-center">
        <div className="text-[var(--muted-foreground)] mb-2">No sub-profiles</div>
        <div className="text-sm text-[var(--muted-foreground)]">
          Customers cannot onboard other users.
        </div>
      </div>
    );
  }

  const RelationshipTable = ({
    title,
    data,
    emptyMessage,
  }: {
    title: string;
    data: ProfileRelationship[];
    emptyMessage: string;
  }) => (
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
        {title} ({data.length})
      </h3>

      {data.length > 0 ? (
        <>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color)]">
                    Txns
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color)]">
                    GMV
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.slice(0, 10).map((relationship) => (
                  <tr key={relationship.id} className="hover:bg-[var(--muted)]">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onOpenProfile(relationship.id)}
                        className="text-sm font-medium text-[#3B82F6] hover:underline text-left"
                      >
                        {relationship.name}
                      </button>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {fmtDate(relationship.onboarded, 'short')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <UserTypeBadge type={relationship.type} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill status={relationship.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--text-color)]">
                      {fmtNumber(relationship.txns)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[var(--text-color)]">
                      {fmtCurrency(relationship.gmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length > 10 && (
            <div className="mt-4">
              <a
                href={`/profile-management?type=${title.toLowerCase()}`}
                className="text-[#3B82F6] hover:underline text-sm inline-flex items-center gap-1"
              >
                View All {title}
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="border border-[var(--border)] rounded-xl p-8 text-center text-[var(--muted-foreground)]">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Distributor view - show both retailers and customers */}
      {userType === 'Distributor' && (
        <>
          <RelationshipTable
            title="Retailers"
            data={retailers || []}
            emptyMessage="No retailers onboarded yet"
          />
          <RelationshipTable
            title="Customers"
            data={customers || []}
            emptyMessage="No customers onboarded yet"
          />
        </>
      )}

      {/* Retailer view - show only customers */}
      {userType === 'Retailer' && (
        <RelationshipTable
          title="Customers"
          data={customers || []}
          emptyMessage="No customers onboarded yet"
        />
      )}
    </div>
  );
};
