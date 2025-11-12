'use client';

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format';
import type { ColumnDef, Distributor, Retailer, Customer, Transaction } from '@/lib/types';
import { ChevronRight, ChevronDown, Building2, Store, User, Edit, Power } from 'lucide-react';

type ViewMode = 'distributor' | 'retailer' | 'customer';
type SelectedEntity = Distributor | Retailer | Customer;

export default function ProfileManagementPage() {
  const { distributors, retailers, customers, transactions, updateDistributor } = useStore();
  const { showToast } = useToast();
  
  const [expandedDistributors, setExpandedDistributors] = useState<Set<string>>(new Set());
  const [expandedRetailers, setExpandedRetailers] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('distributor');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  const toggleDistributor = (id: string) => {
    const newExpanded = new Set(expandedDistributors);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDistributors(newExpanded);
  };
  
  const toggleRetailer = (id: string) => {
    const newExpanded = new Set(expandedRetailers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRetailers(newExpanded);
  };
  
  const selectEntity = (entity: SelectedEntity, mode: ViewMode) => {
    setSelectedEntity(entity);
    setViewMode(mode);
  };
  
  // Get stats for selected entity
  const entityStats = useMemo(() => {
    if (!selectedEntity) return null;
    
    let entityTransactions: Transaction[] = [];
    
    if (viewMode === 'distributor') {
      entityTransactions = transactions.filter((t) => t.distributorId === selectedEntity.id);
    } else if (viewMode === 'retailer') {
      entityTransactions = transactions.filter((t) => t.retailerId === selectedEntity.id);
    } else if (viewMode === 'customer') {
      entityTransactions = transactions.filter((t) => t.customerId === selectedEntity.id);
    }
    
    const successTxns = entityTransactions.filter((t) => t.status === 'success');
    const totalGmv = successTxns.reduce((sum, t) => sum + t.amount, 0);
    const avgTxnAmount = successTxns.length > 0 ? totalGmv / successTxns.length : 0;
    
    return {
      totalTransactions: entityTransactions.length,
      successfulTransactions: successTxns.length,
      totalGmv,
      avgTxnAmount,
      successRate: entityTransactions.length > 0 ? (successTxns.length / entityTransactions.length) * 100 : 0,
    };
  }, [selectedEntity, viewMode, transactions]);
  
  // Recent transactions for selected entity
  const recentTransactions = useMemo(() => {
    if (!selectedEntity) return [];
    
    let entityTransactions: Transaction[] = [];
    
    if (viewMode === 'distributor') {
      entityTransactions = transactions.filter((t) => t.distributorId === selectedEntity.id);
    } else if (viewMode === 'retailer') {
      entityTransactions = transactions.filter((t) => t.retailerId === selectedEntity.id);
    } else if (viewMode === 'customer') {
      entityTransactions = transactions.filter((t) => t.customerId === selectedEntity.id);
    }
    
    return entityTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [selectedEntity, viewMode, transactions]);
  
  const txnColumns: ColumnDef<Transaction>[] = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => fmtDate(row.createdAt, 'short'),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => fmtCurrency(row.amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variant =
          row.status === 'success'
            ? 'success'
            : row.status === 'failed'
            ? 'danger'
            : row.status === 'processing'
            ? 'warning'
            : 'default';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];
  
  const handleSuspend = () => {
    if (!selectedEntity) return;
    
    if (viewMode === 'distributor') {
      const dist = selectedEntity as Distributor;
      updateDistributor(dist.id, { active: !dist.active });
      showToast(
        `Distributor ${dist.active ? 'suspended' : 'activated'} successfully`,
        'success'
      );
      setSelectedEntity({ ...dist, active: !dist.active });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
          Profile Management
        </h1>
        <p className="text-[var(--muted-foreground)]">
          View and manage distributor, retailer, and customer profiles
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tree Navigation */}
        <div className="lg:col-span-1">
          <Card header="Network Hierarchy">
            <div className="space-y-1">
              {distributors.map((distributor) => {
                const isExpanded = expandedDistributors.has(distributor.id);
                const distRetailers = retailers.filter(
                  (r) => r.distributorId === distributor.id
                );
                
                return (
                  <div key={distributor.id}>
                    {/* Distributor */}
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[var(--muted)] ${
                        selectedEntity?.id === distributor.id && viewMode === 'distributor'
                          ? 'bg-[var(--foreground)] text-[var(--background)]'
                          : ''
                      }`}
                      onClick={() => selectEntity(distributor, 'distributor')}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDistributor(distributor.id);
                        }}
                        className="p-0.5"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                      <Building2 size={16} />
                      <span className="text-sm flex-1 truncate">{distributor.name}</span>
                      <span className="text-xs">{distRetailers.length}</span>
                    </div>
                    
                    {/* Retailers */}
                    {isExpanded &&
                      distRetailers.map((retailer) => {
                        const isRetailerExpanded = expandedRetailers.has(retailer.id);
                        const retCustomers = customers.filter(
                          (c) => c.retailerId === retailer.id
                        );
                        
                        return (
                          <div key={retailer.id} className="ml-4">
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[var(--muted)] ${
                                selectedEntity?.id === retailer.id && viewMode === 'retailer'
                                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                                  : ''
                              }`}
                              onClick={() => selectEntity(retailer, 'retailer')}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRetailer(retailer.id);
                                }}
                                className="p-0.5"
                              >
                                {isRetailerExpanded ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronRight size={14} />
                                )}
                              </button>
                              <Store size={14} />
                              <span className="text-xs flex-1 truncate">
                                {retailer.name}
                              </span>
                              <span className="text-xs">{retCustomers.length}</span>
                            </div>
                            
                            {/* Customers */}
                            {isRetailerExpanded &&
                              retCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  className={`ml-4 flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[var(--muted)] ${
                                    selectedEntity?.id === customer.id &&
                                    viewMode === 'customer'
                                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                                      : ''
                                  }`}
                                  onClick={() => selectEntity(customer, 'customer')}
                                >
                                  <User size={12} className="ml-4" />
                                  <span className="text-xs truncate">{customer.name}</span>
                                </div>
                              ))}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEntity ? (
            <>
              {/* Profile Card */}
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
                      {selectedEntity.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedEntity.kycStatus === 'verified'
                            ? 'success'
                            : selectedEntity.kycStatus === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {selectedEntity.kycStatus}
                      </Badge>
                      {selectedEntity.active !== undefined && (
                        <Badge variant={selectedEntity.active ? 'success' : 'default'}>
                          {selectedEntity.active ? 'Active' : 'Suspended'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {viewMode === 'distributor' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => setShowAdjustModal(true)}
                      >
                        Adjust Commission
                      </Button>
                    )}
                    {selectedEntity.active !== undefined && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Power}
                        onClick={handleSuspend}
                      >
                        {selectedEntity.active ? 'Suspend' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      ID
                    </label>
                    <p className="text-[var(--text-color)]">{selectedEntity.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Email
                    </label>
                    <p className="text-[var(--text-color)]">{selectedEntity.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Phone
                    </label>
                    <p className="text-[var(--text-color)]">{selectedEntity.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">
                      Created
                    </label>
                    <p className="text-[var(--text-color)]">
                      {fmtDate(selectedEntity.createdAt)}
                    </p>
                  </div>
                  {viewMode === 'distributor' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Region
                        </label>
                        <p className="text-[var(--text-color)]">
                          {(selectedEntity as Distributor).region}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Commission Rate
                        </label>
                        <p className="text-[var(--text-color)]">
                          {fmtCurrency((selectedEntity as Distributor).commissionRateFixed)} +{' '}
                          {(selectedEntity as Distributor).commissionRatePercent}%
                        </p>
                      </div>
                    </>
                  )}
                  {viewMode === 'retailer' && (
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">
                        City
                      </label>
                      <p className="text-[var(--text-color)]">
                        {(selectedEntity as Retailer).city}
                      </p>
                    </div>
                  )}
                  {viewMode === 'customer' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Card Brand
                        </label>
                        <div className="mt-1">
                          <Badge variant="info">
                            {(selectedEntity as Customer).cardBrand}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Card Last 4
                        </label>
                        <p className="text-[var(--text-color)]">
                          **** {(selectedEntity as Customer).cardLast4}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
              
              {/* Stats */}
              {entityStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card
                    header="Total Transactions"
                    value={fmtNumber(entityStats.totalTransactions)}
                    subtext="All time"
                  />
                  <Card
                    header="Successful"
                    value={fmtNumber(entityStats.successfulTransactions)}
                    subtext={`${entityStats.successRate.toFixed(1)}% success rate`}
                    variant="success"
                  />
                  <Card
                    header="Total GMV"
                    value={fmtCurrency(entityStats.totalGmv)}
                    subtext="Gross merchandise value"
                  />
                  <Card
                    header="Avg Transaction"
                    value={fmtCurrency(entityStats.avgTxnAmount)}
                    subtext="Per successful transaction"
                  />
                </div>
              )}
              
              {/* Recent Transactions */}
              <Card header="Recent Transactions">
                <DataTable
                  columns={txnColumns}
                  rows={recentTransactions}
                  defaultPageSize={5}
                  compact
                />
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                Select an entity from the hierarchy to view details
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Adjust Commission Modal */}
      {showAdjustModal && selectedEntity && viewMode === 'distributor' && (
        <Modal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          title="Adjust Commission Rule"
          size="md"
        >
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            Commission adjustment feature - would integrate with Commission Management
          </div>
        </Modal>
      )}
    </div>
  );
}

