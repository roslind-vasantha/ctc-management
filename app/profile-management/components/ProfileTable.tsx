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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with Search and Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Phone, or Email..."
              className="w-full pl-9 pr-10 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => onExportCSV(filteredProfiles)}
          >
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <option value="All">User Type</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
            <option value="Customer">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <option value="All">Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending KYC">Pending KYC</option>
          </select>

          <select
            value={kycFilter === null ? 'None' : kycFilter}
            onChange={(e) => setKycFilter(e.target.value === 'None' ? null : (e.target.value as any))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <option value="All">KYC</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="None">None</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <option value="created">Created</option>
            <option value="name">Name (A-Z)</option>
            <option value="gmv">GMV</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 hover:underline ml-2"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProfiles.length > 0 &&
                        paginatedProfiles.every((p) => selectedIds.has(p.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-gray-600 focus:ring-gray-400 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Onboarded By
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    KYC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Txns
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    GMV
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onRowClick(profile)}
                  >
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(profile.id)}
                        onChange={(e) => handleSelectOne(profile.id, e.target.checked)}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-400 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {profile.name}
                      </div>
                      <div className="text-xs text-gray-600">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {profile.phone}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <UserTypeBadge type={profile.userType} />
                    </td>
                    <td className="px-6 py-4">
                      {profile.onboardedBy === 'Admin' ? (
                        <span className="text-sm text-gray-600">Admin</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof profile.onboardedBy !== 'string') {
                              onParentClick(profile.onboardedBy.id);
                            }
                          }}
                          className="text-sm text-gray-900 hover:underline text-left"
                        >
                          {typeof profile.onboardedBy !== 'string' ? profile.onboardedBy.name : ''}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusPill status={profile.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fmtDate(profile.created, 'short')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <KYCIcon status={profile.kycStatus} showLabel />
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {fmtNumber(profile.totalTransactions)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {fmtCurrency(profile.gmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + perPage, sortedProfiles.length)} of{' '}
                {sortedProfiles.length} results
              </span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 bg-white"
              >
                ←
              </button>
              <span className="text-sm text-gray-900">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 bg-white"
              >
                →
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-500 mb-4">
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
