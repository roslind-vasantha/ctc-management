export type ID = string;

export type Role = 'management' | 'distributor' | 'retailer' | 'customer';

export type OnboardingState = 'pending' | 'submitted';

export type Distributor = {
  id: ID;
  name: string;
  email: string;
  phone: string;
  region?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  // KYC Documents
  aadhaarDoc?: string;
  panDoc?: string;
  // KYB Details
  businessName?: string;
  gstNumber?: string;
  businessPan?: string;
  // Commission
  commissionType?: 'fixed' | 'percentage';
  commissionValue?: number;
  // Legacy fields (for backward compatibility)
  commissionRateFixed?: number;
  commissionRatePercent?: number;
  // Agreement
  agreementDoc?: string;
  monthVolume: number;
  monthGmv: number;
  createdAt: string;
  active: boolean;
  onboardingState: OnboardingState;
};

export type Retailer = {
  id: ID;
  distributorId: ID;
  name: string;
  email: string;
  phone: string;
  city?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  // KYC Documents
  aadhaarDocument?: string;
  panDocument?: string;
  // KYB (Know Your Business)
  businessName?: string;
  gstNumber?: string;
  businessPan?: string;
  // Commission
  commissionType?: 'fixed' | 'percentage';
  commissionAmount?: number;
  // Agreement
  agreementDocument?: string;
  // Extended onboarding metadata
  shopName?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  submittedAt?: string;
  status?: OnboardingState;
  monthVolume: number;
  monthGmv: number;
  createdAt: string;
  active: boolean;
  onboardingState: OnboardingState;
};

export type Customer = {
  id: ID;
  retailerId: ID;
  name: string; // Name as per Aadhaar
  email?: string;
  phone: string;
  // Personal Information
  dateOfBirth?: string;
  // Employment Details
  companyName?: string;
  designation?: string;
  salaryPerAnnum?: number;
  // Document Verification
  aadhaarDocument?: string;
  panDocument?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  submittedAt?: string;
  status?: OnboardingState;
  // Card Details
  cardLast4?: string;
  cardBrand?: 'RUPAY' | 'VISA' | 'MASTERCARD' | 'AMEX';
  kycStatus?: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  active: boolean;
  onboardingState: OnboardingState;
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

export type DisputeStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export type Dispute = {
  id: ID;
  transactionId: ID;
  raisedBy: 'customer';
  reason: 'not-credited' | 'amount-mismatch' | 'duplicate' | 'other';
  status: DisputeStatus;
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
  width?: number;
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

// Profile Management Types
export type UserType = 'Distributor' | 'Retailer' | 'Customer';
export type ProfileStatus = 'Active' | 'Suspended' | 'Pending KYC';
export type KYCStatus = 'Verified' | 'Pending' | null;

export type UnifiedProfile = {
  id: ID;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  status: ProfileStatus;
  kycStatus: KYCStatus;
  onboardedBy: {
    id: string;
    name: string;
    type: UserType;
  } | 'Admin';
  created: string;
  totalTransactions: number;
  gmv: number;
};

export type SummaryMetrics = {
  totalTxns: number;
  successfulTxns: number;
  gmv: number;
  avgTicket: number;
  successRate: number;
};

export type Document = {
  id: string;
  type: string;
  number: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  uploadedAt: string;
  url?: string;
};

export type ProfileRelationship = {
  id: string;
  name: string;
  type: UserType;
  status: ProfileStatus;
  onboarded: string;
  txns: number;
  gmv: number;
};
