'use client';

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format';
import type { ColumnDef, Distributor } from '@/lib/types';
import { Plus, Edit, Eye, Power } from 'lucide-react';

export default function ManagementOnboardingPage() {
  const { distributors, addDistributor, updateDistributor } = useStore();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [viewingDistributor, setViewingDistributor] = useState<Distributor | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    commissionRateFixed: '5.0',
    commissionRatePercent: '1.5',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDistributor) {
      updateDistributor(editingDistributor.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        region: formData.region,
        commissionRateFixed: parseFloat(formData.commissionRateFixed),
        commissionRatePercent: parseFloat(formData.commissionRatePercent),
      });
      showToast('Distributor updated successfully', 'success');
    } else {
      const newDistributor: Distributor = {
        id: `D${String(distributors.length + 1).padStart(3, '0')}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        region: formData.region,
        kycStatus: 'pending',
        commissionRateFixed: parseFloat(formData.commissionRateFixed),
        commissionRatePercent: parseFloat(formData.commissionRatePercent),
        monthVolume: 0,
        monthGmv: 0,
        createdAt: new Date().toISOString(),
        active: true,
      };
      addDistributor(newDistributor);
      showToast('Distributor created successfully', 'success');
    }
    
    setIsModalOpen(false);
    setEditingDistributor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: '',
      commissionRateFixed: '5.0',
      commissionRatePercent: '1.5',
    });
  };
  
  const handleEdit = (distributor: Distributor) => {
    setEditingDistributor(distributor);
    setFormData({
      name: distributor.name,
      email: distributor.email,
      phone: distributor.phone,
      region: distributor.region,
      commissionRateFixed: String(distributor.commissionRateFixed),
      commissionRatePercent: String(distributor.commissionRatePercent),
    });
    setIsModalOpen(true);
  };
  
  const handleToggleActive = (distributor: Distributor) => {
    updateDistributor(distributor.id, { active: !distributor.active });
    showToast(
      `Distributor ${distributor.active ? 'disabled' : 'enabled'} successfully`,
      'success'
    );
  };
  
  const columns: ColumnDef<Distributor>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'region', label: 'Region', sortable: true },
    {
      key: 'kycStatus',
      label: 'KYC Status',
      render: (row) => {
        const variant =
          row.kycStatus === 'verified'
            ? 'success'
            : row.kycStatus === 'rejected'
            ? 'danger'
            : 'warning';
        return <Badge variant={variant}>{row.kycStatus}</Badge>;
      },
    },
    {
      key: 'commissionRateFixed',
      label: 'Fixed Rate',
      sortable: true,
      render: (row) => fmtCurrency(row.commissionRateFixed),
    },
    {
      key: 'commissionRatePercent',
      label: '% Rate',
      sortable: true,
      render: (row) => `${row.commissionRatePercent}%`,
    },
    {
      key: 'monthVolume',
      label: 'MTD Volume',
      sortable: true,
      render: (row) => fmtNumber(row.monthVolume),
    },
    {
      key: 'monthGmv',
      label: 'MTD GMV',
      sortable: true,
      render: (row) => fmtCurrency(row.monthGmv),
    },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'default'}>
          {row.active ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              setViewingDistributor(row);
            }}
            aria-label="View"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            aria-label="Edit"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Power}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(row);
            }}
            aria-label={row.active ? 'Disable' : 'Enable'}
          />
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
            Management Onboarding
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Create and manage distributors in your network
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingDistributor(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              region: '',
              commissionRateFixed: '5.0',
              commissionRatePercent: '1.5',
            });
            setIsModalOpen(true);
          }}
        >
          Create Distributor
        </Button>
      </div>
      
      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDistributor(null);
        }}
        title={editingDistributor ? 'Edit Distributor' : 'Create New Distributor'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDistributor(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDistributor ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            fullWidth
          />
          <Input
            label="Region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            required
            fullWidth
            helperText="e.g., Riyadh, Jeddah, Dammam"
          />
          <Input
            label="Fixed Commission Rate"
            type="number"
            step="0.01"
            value={formData.commissionRateFixed}
            onChange={(e) =>
              setFormData({ ...formData, commissionRateFixed: e.target.value })
            }
            required
            fullWidth
            helperText="Fixed amount per transaction"
          />
          <Input
            label="Percentage Commission Rate"
            type="number"
            step="0.01"
            value={formData.commissionRatePercent}
            onChange={(e) =>
              setFormData({ ...formData, commissionRatePercent: e.target.value })
            }
            required
            fullWidth
            helperText="Percentage of transaction amount"
          />
        </form>
      </Modal>
      
      {/* View Modal */}
      {viewingDistributor && (
        <Modal
          isOpen={!!viewingDistributor}
          onClose={() => setViewingDistributor(null)}
          title="Distributor Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  ID
                </label>
                <p className="text-[var(--text-color)]">{viewingDistributor.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={viewingDistributor.active ? 'success' : 'default'}>
                    {viewingDistributor.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Name
                </label>
                <p className="text-[var(--text-color)]">{viewingDistributor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Email
                </label>
                <p className="text-[var(--text-color)]">{viewingDistributor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Phone
                </label>
                <p className="text-[var(--text-color)]">{viewingDistributor.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Region
                </label>
                <p className="text-[var(--text-color)]">{viewingDistributor.region}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  KYC Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      viewingDistributor.kycStatus === 'verified'
                        ? 'success'
                        : viewingDistributor.kycStatus === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {viewingDistributor.kycStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Created At
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtDate(viewingDistributor.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  Fixed Commission
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtCurrency(viewingDistributor.commissionRateFixed)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  % Commission
                </label>
                <p className="text-[var(--text-color)]">
                  {viewingDistributor.commissionRatePercent}%
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  MTD Volume
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtNumber(viewingDistributor.monthVolume)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">
                  MTD GMV
                </label>
                <p className="text-[var(--text-color)]">
                  {fmtCurrency(viewingDistributor.monthGmv)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Distributors Table */}
      <Card>
        <DataTable
          columns={columns}
          rows={distributors}
          searchKeys={['name', 'email', 'region', 'id']}
          filters={[
            {
              key: 'region',
              label: 'Region',
              options: Array.from(new Set(distributors.map((d) => d.region))).map(
                (r) => ({ value: r, label: r })
              ),
            },
            {
              key: 'kycStatus',
              label: 'KYC Status',
              options: [
                { value: 'verified', label: 'Verified' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
          ]}
          defaultPageSize={10}
        />
      </Card>
    </div>
  );
}

