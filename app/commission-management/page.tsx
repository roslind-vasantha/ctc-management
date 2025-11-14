'use client';

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { useStore } from '@/lib/store';
import { fmtCurrency, fmtDate } from '@/lib/format';
import type { ColumnDef, CommissionRule } from '@/lib/types';
import { Plus, Edit, Calculator } from 'lucide-react';

export default function CommissionManagementPage() {
  const { commissionRules, distributors, addCommissionRule, updateCommissionRule } = useStore();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    distributorId: '',
    baseFixed: '5.0',
    basePercent: '1.5',
    tiers: [{ minVolume: 50, fixed: 4.5, percent: 1.4 }],
  });
  
  const [simData, setSimData] = useState({
    monthlyTxns: '100',
    avgAmount: '2000',
    selectedRule: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ruleData: CommissionRule = {
      id: editingRule?.id || `CR${String(commissionRules.length + 1).padStart(3, '0')}`,
      name: formData.name,
      appliesTo: 'distributor',
      distributorId: formData.distributorId || undefined,
      baseFixed: parseFloat(formData.baseFixed),
      basePercent: parseFloat(formData.basePercent),
      tiers: formData.tiers.filter((t) => t.minVolume > 0),
      active: true,
      createdAt: editingRule?.createdAt || new Date().toISOString(),
    };
    
    if (editingRule) {
      updateCommissionRule(editingRule.id, ruleData);
      showToast('Commission rule updated successfully', 'success');
    } else {
      addCommissionRule(ruleData);
      showToast('Commission rule created successfully', 'success');
    }
    
    setIsModalOpen(false);
    setEditingRule(null);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      distributorId: '',
      baseFixed: '5.0',
      basePercent: '1.5',
      tiers: [{ minVolume: 50, fixed: 4.5, percent: 1.4 }],
    });
  };
  
  const handleEdit = (rule: CommissionRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      distributorId: rule.distributorId || '',
      baseFixed: String(rule.baseFixed),
      basePercent: String(rule.basePercent),
      tiers: rule.tiers as any || [{ minVolume: 50, fixed: 4.5, percent: 1.4 }],
    });
    setIsModalOpen(true);
  };
  
  const addTier = () => {
    setFormData({
      ...formData,
      tiers: [...formData.tiers, { minVolume: 0, fixed: 0, percent: 0 }],
    });
  };
  
  const removeTier = (index: number) => {
    setFormData({
      ...formData,
      tiers: formData.tiers.filter((_, i) => i !== index),
    });
  };
  
  const updateTier = (index: number, field: string, value: number) => {
    const newTiers = [...formData.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({ ...formData, tiers: newTiers });
  };
  
  // Simulation calculation
  const simulationResult = () => {
    const monthlyTxns = parseInt(simData.monthlyTxns) || 0;
    const avgAmount = parseFloat(simData.avgAmount) || 0;
    const rule = commissionRules.find((r) => r.id === simData.selectedRule);
    
    if (!rule) return null;
    
    // Find applicable tier
    let fixed = rule.baseFixed;
    let percent = rule.basePercent;
    
    if (rule.tiers) {
      for (const tier of rule.tiers.sort((a, b) => b.minVolume - a.minVolume)) {
        if (monthlyTxns >= tier.minVolume) {
          fixed = tier.fixed ?? fixed;
          percent = tier.percent ?? percent;
          break;
        }
      }
    }
    
    const distributorCommission = monthlyTxns * (fixed + (avgAmount * percent) / 100);
    const totalFees = monthlyTxns * (10 + (avgAmount * 2.5) / 100); // Assuming standard fees
    const mgmtCommission = totalFees - distributorCommission;
    
    return {
      distributorCommission,
      mgmtCommission,
      totalFees,
      effectiveRate: ((distributorCommission / (monthlyTxns * avgAmount)) * 100).toFixed(2),
    };
  };
  
  const columns: ColumnDef<CommissionRule>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Rule Name', sortable: true },
    {
      key: 'distributorId',
      label: 'Applies To',
      render: (row) => {
        if (!row.distributorId) return <Badge>All Distributors</Badge>;
        const dist = distributors.find((d) => d.id === row.distributorId);
        return dist?.name || '-';
      },
    },
    {
      key: 'baseFixed',
      label: 'Base Fixed',
      sortable: true,
      render: (row) => fmtCurrency(row.baseFixed),
    },
    {
      key: 'basePercent',
      label: 'Base %',
      sortable: true,
      render: (row) => `${row.basePercent}%`,
    },
    {
      key: 'tiers',
      label: 'Tiers',
      render: (row) => (row.tiers ? `${row.tiers.length} tiers` : 'No tiers'),
    },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'default'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (row) => fmtDate(row.createdAt, 'short'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Edit}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];
  
  return (
    <div className="min-h-screen bg-[#F5F6FA] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Commission Management
            </h1>
            <p className="text-gray-600">
              Create and manage commission rules for distributors
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={Calculator}
              onClick={() => setShowSimulator(true)}
            >
              Simulator
            </Button>
            <Button
              icon={Plus}
              onClick={() => {
                setEditingRule(null);
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Create Rule
            </Button>
          </div>
        </div>

        {/* Rules Table */}
        <Card>
          <DataTable
            columns={columns}
            rows={commissionRules}
            searchKeys={['name', 'id']}
            filters={[
              {
                key: 'active',
                label: 'Status',
                options: [
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ],
              },
            ]}
            defaultPageSize={10}
          />
        </Card>
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        title={editingRule ? 'Edit Commission Rule' : 'Create Commission Rule'}
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRule(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Rule Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            helperText="e.g., Standard Tiered, High Volume Discount"
          />
          
          <Select
            label="Apply to Distributor (Optional)"
            value={formData.distributorId}
            onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
            options={[
              { value: '', label: 'All Distributors' },
              ...distributors.map((d) => ({ value: d.id, label: d.name })),
            ]}
            fullWidth
            helperText="Leave blank to apply to all distributors by default"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Fixed Commission"
              type="number"
              step="0.01"
              value={formData.baseFixed}
              onChange={(e) => setFormData({ ...formData, baseFixed: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Base Percent Commission"
              type="number"
              step="0.01"
              value={formData.basePercent}
              onChange={(e) => setFormData({ ...formData, basePercent: e.target.value })}
              required
              fullWidth
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-color)]">
                Volume Tiers
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={addTier}>
                Add Tier
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <Input
                    label="Min Volume"
                    type="number"
                    value={tier.minVolume}
                    onChange={(e) =>
                      updateTier(index, 'minVolume', parseFloat(e.target.value))
                    }
                    fullWidth
                  />
                  <Input
                    label="Fixed"
                    type="number"
                    step="0.01"
                    value={tier.fixed}
                    onChange={(e) => updateTier(index, 'fixed', parseFloat(e.target.value))}
                    fullWidth
                  />
                  <Input
                    label="Percent"
                    type="number"
                    step="0.01"
                    value={tier.percent}
                    onChange={(e) =>
                      updateTier(index, 'percent', parseFloat(e.target.value))
                    }
                    fullWidth
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTier(index)}
                    disabled={formData.tiers.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
      
      {/* Simulator Modal */}
      <Modal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        title="Commission Simulator"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Select Commission Rule"
              value={simData.selectedRule}
              onChange={(e) => setSimData({ ...simData, selectedRule: e.target.value })}
              options={[
                { value: '', label: 'Select a rule' },
                ...commissionRules.map((r) => ({ value: r.id, label: r.name })),
              ]}
              fullWidth
            />
            
            <Input
              label="Monthly Transaction Count"
              type="number"
              value={simData.monthlyTxns}
              onChange={(e) => setSimData({ ...simData, monthlyTxns: e.target.value })}
              fullWidth
            />
            
            <Input
              label="Average Transaction Amount"
              type="number"
              step="0.01"
              value={simData.avgAmount}
              onChange={(e) => setSimData({ ...simData, avgAmount: e.target.value })}
              fullWidth
            />
          </div>
          
          {simData.selectedRule && simulationResult() && (
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                Simulation Results
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  header="Total Fees Collected"
                  value={fmtCurrency(simulationResult()!.totalFees)}
                  subtext="From customers"
                />
                <Card
                  header="Distributor Commission"
                  value={fmtCurrency(simulationResult()!.distributorCommission)}
                  subtext={`Effective rate: ${simulationResult()!.effectiveRate}%`}
                  variant="info"
                />
                <Card
                  header="Management Commission"
                  value={fmtCurrency(simulationResult()!.mgmtCommission)}
                  subtext="Net revenue"
                  variant="success"
                />
                <Card
                  header="Commission Split"
                  value={`${(
                    (simulationResult()!.distributorCommission /
                      simulationResult()!.totalFees) *
                    100
                  ).toFixed(1)}% / ${(
                    (simulationResult()!.mgmtCommission / simulationResult()!.totalFees) *
                    100
                  ).toFixed(1)}%`}
                  subtext="Distributor / Management"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
      </div>
    </div>
  );
}

