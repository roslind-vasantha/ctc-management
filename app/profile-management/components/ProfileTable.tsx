'use client';

import { useState } from 'react';
import { UserTypeBadge } from '@/app/components/ui/UserTypeBadge';
import { StatusPill } from '@/app/components/ui/StatusPill';
import { KYCIcon } from '@/app/components/ui/KYCIcon';
import { Button } from '@/app/components/ui/Button';
import { fmtCurrency, fmtNumber, fmtDate } from '@/lib/format';
import type { UnifiedProfile, UserType, ProfileStatus, KYCStatus } from '@/lib/types';
import { Search, X, Download, Power } from 'lucide-react';

interface ProfileTableProps {
  profiles: UnifiedProfile[];
  onRowClick: (profile: UnifiedProfile) => void;
  onParentClick: (parentId: string) => void;
  onBulkSuspend: (ids: string[]) => void;
  onBulkActivate: (ids: string[]) => void;
  onExportCSV: (profiles: UnifiedProfile[]) => void;
}

export const ProfileTable = ({
  profiles,
  onRowClick,
  onParentClick,
  onBulkSuspend,
  onBulkActivate,
  onExportCSV,
}: ProfileTableProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<UserType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'All'>('All');
  const [kycFilter, setKycFilter] = useState<KYCStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'gmv'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters
  const filteredProfiles = profiles.filter((profile) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      profile.name.toLowerCase().includes(searchLower) ||
      profile.phone.includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = typeFilter === 'All' || profile.userType === typeFilter;

    // Status filter
    const matchesStatus = statusFilter === 'All' || profile.status === statusFilter;

    // KYC filter
    const matchesKYC =
      kycFilter === 'All' ||
      (kycFilter === null && profile.kycStatus === null) ||
      profile.kycStatus === kycFilter;

    return matchesSearch && matchesType && matchesStatus && matchesKYC;
  });

  // Apply sorting
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'created') {
      comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'gmv') {
      comparison = a.gmv - b.gmv;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProfiles.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedProfiles = sortedProfiles.slice(startIndex, startIndex + perPage);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedProfiles.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setKycFilter('All');
  };

  const hasActiveFilters =
    search || typeFilter !== 'All' || statusFilter !== 'All' || kycFilter !== 'All';

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name, Phone, or Email..."
          className="w-full pl-10 pr-10 py-3 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--text-color)]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white"
        >
          <option value="All">User Type</option>
          <option value="Distributor">Distributor</option>
          <option value="Retailer">Retailer</option>
          <option value="Customer">Customer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white"
        >
          <option value="All">Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending KYC">Pending KYC</option>
        </select>

        <select
          value={kycFilter === null ? 'None' : kycFilter}
          onChange={(e) => setKycFilter(e.target.value === 'None' ? null : (e.target.value as any))}
          className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white"
        >
          <option value="All">KYC</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="None">None</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#3B82F6] hover:underline"
          >
            Clear All
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white"
          >
            <option value="created">Created</option>
            <option value="name">Name (A-Z)</option>
            <option value="gmv">GMV</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--muted)]"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-[#F0F7FF] border border-[#3B82F6] rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-color)]">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onBulkSuspend(Array.from(selectedIds))}>
              Suspend
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onBulkActivate(Array.from(selectedIds))}>
              Activate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => onExportCSV(profiles.filter((p) => selectedIds.has(p.id)))}
            >
              Export CSV
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {paginatedProfiles.length > 0 ? (
        <>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProfiles.length > 0 &&
                        paginatedProfiles.every((p) => selectedIds.has(p.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                    User Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                    Onboarded By
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                    Created
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                    KYC
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color)]">
                    Total Txns
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color)]">
                    GMV
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-[var(--muted)] cursor-pointer transition-colors"
                    onClick={() => onRowClick(profile)}
                  >
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(profile.id)}
                        onChange={(e) => handleSelectOne(profile.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-[#3B82F6] hover:underline">
                        {profile.name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">{profile.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-sm text-[var(--text-color)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {profile.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <UserTypeBadge type={profile.userType} />
                    </td>
                    <td className="px-4 py-3">
                      {profile.onboardedBy === 'Admin' ? (
                        <span className="text-sm text-[var(--muted-foreground)]">Admin</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof profile.onboardedBy !== 'string') {
                              onParentClick(profile.onboardedBy.id);
                            }
                          }}
                          className="text-sm text-[#3B82F6] hover:underline text-left"
                        >
                          {typeof profile.onboardedBy !== 'string' ? profile.onboardedBy.name : ''}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill status={profile.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {fmtDate(profile.created, 'short')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <KYCIcon status={profile.kycStatus} showLabel />
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--text-color)]">
                      {fmtNumber(profile.totalTransactions)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[var(--text-color)]">
                      {fmtCurrency(profile.gmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">
                Showing {startIndex + 1}-{Math.min(startIndex + perPage, sortedProfiles.length)} of{' '}
                {sortedProfiles.length} results
              </span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-[var(--border)] rounded-lg text-sm bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-[var(--muted-foreground)]">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
              >
                ←
              </button>
              <span className="text-sm text-[var(--text-color)]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
              >
                →
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="text-[var(--muted-foreground)] mb-4">
            No profiles match these filters
          </div>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
