export type ID = string;

export type Role = 'management' | 'distributor' | 'retailer' | 'customer';

export type Distributor = {
  id: ID;
  name: string;
  email: string;
  phone: string;
  region: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  commissionRateFixed: number;
  commissionRatePercent: number;
  monthVolume: number;
  monthGmv: number;
  createdAt: string;
  active: boolean;
};

export type Retailer = {
  id: ID;
  distributorId: ID;
  name: string;
  email: string;
  phone: string;
  city: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  monthVolume: number;
  monthGmv: number;
  createdAt: string;
  active: boolean;
};

export type Customer = {
  id: ID;
  retailerId: ID;
  name: string;
  email: string;
  phone: string;
  cardLast4: string;
  cardBrand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'RUPAY';
  kycStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  active: boolean;
};

export type CommissionRule = {
  id: ID;
  name: string;
  appliesTo: 'distributor';
  distributorId?: ID;
  baseFixed: number;
  basePercent: number;
  tiers?: Array<{ minVolume: number; fixed?: number; percent?: number }>;
  active: boolean;
  createdAt: string;
};

export type Transaction = {
  id: ID;
  distributorId: ID;
  retailerId: ID;
  customerId: ID;
  amount: number;
  cardBrand: Customer['cardBrand'];
  status: 'pending' | 'processing' | 'success' | 'failed' | 'reversed';
  feeFixed: number;
  feePercent: number;
  commissionToMgmt: number;
  commissionToDistributor: number;
  createdAt: string;
  completedAt?: string;
};

export type Dispute = {
  id: ID;
  transactionId: ID;
  raisedBy: 'customer' | 'retailer';
  reason: 'not-credited' | 'amount-mismatch' | 'duplicate' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreditCardApproval = {
  id: ID;
  customerId: ID;
  cardLast4: string;
  cardBrand: Customer['cardBrand'];
  limitRequested: number;
  documents: Array<{ name: string; url: string }>;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

export type FilterOption = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export type DateRange = {
  start: string;
  end: string;
};

export type UserPreferences = {
  compactTables: boolean;
  defaultDateRange: 30 | 90;
};

export type ManagementUser = {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'analyst';
};

