'use client';

import { useState, useEffect } from 'react';
import type {
  Distributor,
  Retailer,
  Customer,
  CommissionRule,
  Transaction,
  Dispute,
  CreditCardApproval,
  UserPreferences,
  ManagementUser,
} from './types';
import {
  distributors as initialDistributors,
  retailers as initialRetailers,
  customers as initialCustomers,
  commissionRules as initialCommissionRules,
  transactions as initialTransactions,
  disputes as initialDisputes,
  cardApprovals as initialCardApprovals,
} from './data';

// In-memory store
let storeData = {
  distributors: [...initialDistributors],
  retailers: [...initialRetailers],
  customers: [...initialCustomers],
  commissionRules: [...initialCommissionRules],
  transactions: [...initialTransactions],
  disputes: [...initialDisputes],
  cardApprovals: [...initialCardApprovals],
};

// Hook to access and update store
export const useStore = () => {
  const [data, setData] = useState(storeData);
  
  const updateDistributor = (id: string, updates: Partial<Distributor>) => {
    storeData.distributors = storeData.distributors.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    );
    setData({ ...storeData });
  };
  
  const addDistributor = (distributor: Distributor) => {
    storeData.distributors = [...storeData.distributors, distributor];
    setData({ ...storeData });
  };
  
  const updateRetailer = (id: string, updates: Partial<Retailer>) => {
    storeData.retailers = storeData.retailers.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    setData({ ...storeData });
  };
  
  const addRetailer = (retailer: Retailer) => {
    storeData.retailers = [...storeData.retailers, retailer];
    setData({ ...storeData });
  };
  
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    storeData.customers = storeData.customers.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setData({ ...storeData });
  };
  
  const addCustomer = (customer: Customer) => {
    storeData.customers = [...storeData.customers, customer];
    setData({ ...storeData });
  };
  
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    storeData.transactions = storeData.transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setData({ ...storeData });
  };
  
  const updateDispute = (id: string, updates: Partial<Dispute>) => {
    storeData.disputes = storeData.disputes.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    setData({ ...storeData });
  };
  
  const updateCardApproval = (id: string, updates: Partial<CreditCardApproval>) => {
    storeData.cardApprovals = storeData.cardApprovals.map((ca) =>
      ca.id === id ? { ...ca, ...updates } : ca
    );
    setData({ ...storeData });
  };
  
  const updateCommissionRule = (id: string, updates: Partial<CommissionRule>) => {
    storeData.commissionRules = storeData.commissionRules.map((cr) =>
      cr.id === id ? { ...cr, ...updates } : cr
    );
    setData({ ...storeData });
  };
  
  const addCommissionRule = (rule: CommissionRule) => {
    storeData.commissionRules = [...storeData.commissionRules, rule];
    setData({ ...storeData });
  };
  
  return {
    ...data,
    updateDistributor,
    addDistributor,
    updateRetailer,
    addRetailer,
    updateCustomer,
    addCustomer,
    updateTransaction,
    updateDispute,
    updateCardApproval,
    updateCommissionRule,
    addCommissionRule,
  };
};

// Preferences in localStorage
export const usePreferences = (): [UserPreferences, (prefs: Partial<UserPreferences>) => void] => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    compactTables: false,
    defaultDateRange: 30,
  });
  
  useEffect(() => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);
  
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
  };
  
  return [preferences, updatePreferences];
};

// Management user in localStorage
export const useManagementUser = (): [ManagementUser, (user: Partial<ManagementUser>) => void] => {
  const [user, setUser] = useState<ManagementUser>({
    id: 'MGMT001',
    name: 'Admin User',
    email: 'admin@ctc-management.sa',
    phone: '+966-11-000-0000',
    role: 'admin',
  });
  
  useEffect(() => {
    const stored = localStorage.getItem('managementUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);
  
  const updateUser = (updates: Partial<ManagementUser>) => {
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('managementUser', JSON.stringify(newUser));
  };
  
  return [user, updateUser];
};

