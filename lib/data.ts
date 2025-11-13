import type {
  Distributor,
  Retailer,
  Customer,
  CommissionRule,
  Transaction,
  Dispute,
  CreditCardApproval,
} from './types';

// Helper to generate dates in the past
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// 8 Distributors
export const distributors: Distributor[] = [
  {
    id: 'D001',
    name: 'Al-Riyadh Distribution Co.',
    email: 'contact@riyadh-dist.sa',
    phone: '+966-11-123-4567',
    region: 'Riyadh',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 142,
    monthGmv: 568000,
    createdAt: daysAgo(320),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D002',
    name: 'Jeddah Finance Partners',
    email: 'info@jeddah-fp.sa',
    phone: '+966-12-234-5678',
    region: 'Jeddah',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 128,
    monthGmv: 512000,
    createdAt: daysAgo(280),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D003',
    name: 'Dammam Credit Solutions',
    email: 'support@dammam-cs.sa',
    phone: '+966-13-345-6789',
    region: 'Dammam',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 98,
    monthGmv: 392000,
    createdAt: daysAgo(250),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D004',
    name: 'Mecca Financial Services',
    email: 'hello@mecca-fs.sa',
    phone: '+966-12-456-7890',
    region: 'Mecca',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 85,
    monthGmv: 340000,
    createdAt: daysAgo(220),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D005',
    name: 'Medina Cash Network',
    email: 'contact@medina-cn.sa',
    phone: '+966-14-567-8901',
    region: 'Medina',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 76,
    monthGmv: 304000,
    createdAt: daysAgo(190),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D006',
    name: 'Khobar Trading LLC',
    email: 'info@khobar-trade.sa',
    phone: '+966-13-678-9012',
    region: 'Khobar',
    kycStatus: 'verified',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 64,
    monthGmv: 256000,
    createdAt: daysAgo(160),
    active: true,
    onboardingState: 'submitted',
  },
  {
    id: 'D007',
    name: 'Tabuk Finance Hub',
    email: 'support@tabuk-fh.sa',
    phone: '+966-14-789-0123',
    region: 'Tabuk',
    kycStatus: 'pending',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 42,
    monthGmv: 168000,
    createdAt: daysAgo(90),
    active: true,
    onboardingState: 'pending',
  },
  {
    id: 'D008',
    name: 'Abha Capital Group',
    email: 'hello@abha-cg.sa',
    phone: '+966-17-890-1234',
    region: 'Abha',
    kycStatus: 'pending',
    commissionRateFixed: 5.0,
    commissionRatePercent: 1.5,
    monthVolume: 35,
    monthGmv: 140000,
    createdAt: daysAgo(60),
    active: true,
    onboardingState: 'pending',
  },
];

// Helper to generate retailer onboarding data
// Submitted state = ALL fields complete (Personal + KYC + KYB + Agreement)
// Pending state = Missing one or more required fields
const generateRetailerOnboardingData = (id: string, onboardingState: 'pending' | 'submitted') => {
  const idNum = parseInt(id.replace('R', ''));
  
  if (onboardingState === 'submitted') {
    // Complete onboarding with all required fields
    return {
      aadhaarDocument: `aadhaar_${id}.pdf`,
      panDocument: `pan_${id}.pdf`,
      businessName: `${id} Business Pvt Ltd`,
      gstNumber: `22AAAA${String(idNum).padStart(5, '0')}A1Z5`,
      businessPan: `AAAA${String(idNum).padStart(5, '0')}A`,
      commissionType: (idNum % 2 === 0 ? 'fixed' : 'percentage') as 'fixed' | 'percentage',
      commissionAmount: idNum % 2 === 0 ? 5.0 : 2.5,
      agreementDocument: `agreement_${id}.pdf`,
    };
  }
  
  // Pending state - simulate incomplete onboarding (missing some fields)
  const missingField = idNum % 5; // Vary what's missing
  return {
    // Sometimes they have some fields but not all
    ...(missingField !== 0 ? { aadhaarDocument: `aadhaar_${id}.pdf` } : {}),
    ...(missingField !== 1 ? { panDocument: `pan_${id}.pdf` } : {}),
    ...(missingField !== 2 ? { businessName: `${id} Business Pvt Ltd` } : {}),
    ...(missingField !== 3 ? { gstNumber: `22AAAA${String(idNum).padStart(5, '0')}A1Z5` } : {}),
    // Missing agreement or other critical field
  };
};

// 24 Retailers (3 per distributor)
export const retailers: Retailer[] = [
  // D001 - Riyadh
  { id: 'R001', distributorId: 'D001', name: 'Quick Cash Riyadh North', email: 'north@qc-riyadh.sa', phone: '+966-11-111-1111', city: 'Riyadh', kycStatus: 'verified', monthVolume: 52, monthGmv: 208000, createdAt: daysAgo(300), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R001', 'submitted') },
  { id: 'R002', distributorId: 'D001', name: 'Express Money Riyadh Center', email: 'center@em-riyadh.sa', phone: '+966-11-111-2222', city: 'Riyadh', kycStatus: 'verified', monthVolume: 48, monthGmv: 192000, createdAt: daysAgo(290), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R002', 'submitted') },
  { id: 'R003', distributorId: 'D001', name: 'Fast Finance Riyadh South', email: 'south@ff-riyadh.sa', phone: '+966-11-111-3333', city: 'Riyadh', kycStatus: 'verified', monthVolume: 42, monthGmv: 168000, createdAt: daysAgo(280), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R003', 'submitted') },
  
  // D002 - Jeddah
  { id: 'R004', distributorId: 'D002', name: 'Jeddah Quick Pay', email: 'info@jqp.sa', phone: '+966-12-222-1111', city: 'Jeddah', kycStatus: 'verified', monthVolume: 46, monthGmv: 184000, createdAt: daysAgo(260), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R004', 'submitted') },
  { id: 'R005', distributorId: 'D002', name: 'Coastal Cash Services', email: 'coastal@ccs.sa', phone: '+966-12-222-2222', city: 'Jeddah', kycStatus: 'verified', monthVolume: 44, monthGmv: 176000, createdAt: daysAgo(250), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R005', 'submitted') },
  { id: 'R006', distributorId: 'D002', name: 'Red Sea Finance', email: 'redsea@finance.sa', phone: '+966-12-222-3333', city: 'Jeddah', kycStatus: 'pending', monthVolume: 38, monthGmv: 152000, createdAt: daysAgo(240), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R006', 'submitted') },
  
  // D003 - Dammam
  { id: 'R007', distributorId: 'D003', name: 'Eastern Cash Point', email: 'east@cashpoint.sa', phone: '+966-13-333-1111', city: 'Dammam', kycStatus: 'verified', monthVolume: 36, monthGmv: 144000, createdAt: daysAgo(230), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R007', 'submitted') },
  { id: 'R008', distributorId: 'D003', name: 'Dammam Money Hub', email: 'hub@dammam.sa', phone: '+966-13-333-2222', city: 'Dammam', kycStatus: 'verified', monthVolume: 34, monthGmv: 136000, createdAt: daysAgo(220), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R008', 'submitted') },
  { id: 'R009', distributorId: 'D003', name: 'Gulf Finance Express', email: 'gulf@fexpress.sa', phone: '+966-13-333-3333', city: 'Dammam', kycStatus: 'verified', monthVolume: 28, monthGmv: 112000, createdAt: daysAgo(210), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R009', 'pending') },
  
  // D004 - Mecca
  { id: 'R010', distributorId: 'D004', name: 'Holy City Cash', email: 'holy@cash.sa', phone: '+966-12-444-1111', city: 'Mecca', kycStatus: 'verified', monthVolume: 32, monthGmv: 128000, createdAt: daysAgo(200), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R010', 'submitted') },
  { id: 'R011', distributorId: 'D004', name: 'Mecca Finance Center', email: 'mfc@finance.sa', phone: '+966-12-444-2222', city: 'Mecca', kycStatus: 'verified', monthVolume: 30, monthGmv: 120000, createdAt: daysAgo(190), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R011', 'submitted') },
  { id: 'R012', distributorId: 'D004', name: 'Quick Service Mecca', email: 'quick@mecca.sa', phone: '+966-12-444-3333', city: 'Mecca', kycStatus: 'pending', monthVolume: 23, monthGmv: 92000, createdAt: daysAgo(180), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R012', 'submitted') },
  
  // D005 - Medina
  { id: 'R013', distributorId: 'D005', name: 'Medina Express Cash', email: 'express@medina.sa', phone: '+966-14-555-1111', city: 'Medina', kycStatus: 'verified', monthVolume: 28, monthGmv: 112000, createdAt: daysAgo(170), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R013', 'submitted') },
  { id: 'R014', distributorId: 'D005', name: 'Prophet City Finance', email: 'pcf@medina.sa', phone: '+966-14-555-2222', city: 'Medina', kycStatus: 'verified', monthVolume: 26, monthGmv: 104000, createdAt: daysAgo(160), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R014', 'pending') },
  { id: 'R015', distributorId: 'D005', name: 'Medina Money Point', email: 'mmp@medina.sa', phone: '+966-14-555-3333', city: 'Medina', kycStatus: 'verified', monthVolume: 22, monthGmv: 88000, createdAt: daysAgo(150), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R015', 'submitted') },
  
  // D006 - Khobar
  { id: 'R016', distributorId: 'D006', name: 'Khobar Cash Express', email: 'kce@khobar.sa', phone: '+966-13-666-1111', city: 'Khobar', kycStatus: 'verified', monthVolume: 24, monthGmv: 96000, createdAt: daysAgo(140), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R016', 'submitted') },
  { id: 'R017', distributorId: 'D006', name: 'Corniche Finance', email: 'corniche@finance.sa', phone: '+966-13-666-2222', city: 'Khobar', kycStatus: 'verified', monthVolume: 22, monthGmv: 88000, createdAt: daysAgo(130), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R017', 'pending') },
  { id: 'R018', distributorId: 'D006', name: 'Khobar Quick Money', email: 'quick@khobar.sa', phone: '+966-13-666-3333', city: 'Khobar', kycStatus: 'pending', monthVolume: 18, monthGmv: 72000, createdAt: daysAgo(120), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R018', 'submitted') },
  
  // D007 - Tabuk
  { id: 'R019', distributorId: 'D007', name: 'Tabuk Fast Cash', email: 'fast@tabuk.sa', phone: '+966-14-777-1111', city: 'Tabuk', kycStatus: 'verified', monthVolume: 16, monthGmv: 64000, createdAt: daysAgo(80), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R019', 'submitted') },
  { id: 'R020', distributorId: 'D007', name: 'Northern Finance Hub', email: 'north@fhub.sa', phone: '+966-14-777-2222', city: 'Tabuk', kycStatus: 'pending', monthVolume: 14, monthGmv: 56000, createdAt: daysAgo(70), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R020', 'pending') },
  { id: 'R021', distributorId: 'D007', name: 'Tabuk Money Services', email: 'tms@tabuk.sa', phone: '+966-14-777-3333', city: 'Tabuk', kycStatus: 'pending', monthVolume: 12, monthGmv: 48000, createdAt: daysAgo(60), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R021', 'submitted') },
  
  // D008 - Abha
  { id: 'R022', distributorId: 'D008', name: 'Abha Cash Center', email: 'acc@abha.sa', phone: '+966-17-888-1111', city: 'Abha', kycStatus: 'verified', monthVolume: 13, monthGmv: 52000, createdAt: daysAgo(50), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R022', 'pending') },
  { id: 'R023', distributorId: 'D008', name: 'Southern Express Finance', email: 'sef@abha.sa', phone: '+966-17-888-2222', city: 'Abha', kycStatus: 'pending', monthVolume: 12, monthGmv: 48000, createdAt: daysAgo(40), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R023', 'submitted') },
  { id: 'R024', distributorId: 'D008', name: 'Mountain Cash Point', email: 'mcp@abha.sa', phone: '+966-17-888-3333', city: 'Abha', kycStatus: 'pending', monthVolume: 10, monthGmv: 40000, createdAt: daysAgo(30), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R024', 'submitted') },
];

// Helper to generate customer onboarding data
// Business Rule: Customer reaches "submitted" state ONLY when ALL sections are complete:
//   1. Personal Information: Name, Phone, Email, Date of Birth
//   2. Employment Details: Company Name, Designation, Salary per Annum
//   3. Document Verification: Both Aadhaar AND PAN documents uploaded
// If ANY field is missing, customer remains in "pending" state
const generateCustomerOnboardingData = (custIdx: number, onboardingState: 'pending' | 'submitted') => {
  const companyNames = ['Tech Solutions SA', 'Global Trading Co', 'Finance Corp', 'Retail Services LLC', 'Construction Group', 'Healthcare Systems', 'Education Services', 'Transport Solutions'];
  const designations = ['Manager', 'Engineer', 'Accountant', 'Sales Executive', 'Operations Lead', 'Analyst', 'Supervisor', 'Consultant'];
  
  if (onboardingState === 'submitted') {
    // SUBMITTED = Complete onboarding with ALL required fields present
    const birthYear = 1985 + (custIdx % 15);
    const birthMonth = (custIdx % 12) + 1;
    const birthDay = (custIdx % 28) + 1;
    
    return {
      // Personal Information - ALL required
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      // Employment Details - ALL required
      companyName: companyNames[custIdx % companyNames.length],
      designation: designations[custIdx % designations.length],
      salaryPerAnnum: 300000 + (custIdx * 10000) + Math.floor(Math.random() * 100000),
      // Document Verification - BOTH required
      aadhaarDocument: `aadhaar_C${String(custIdx + 1).padStart(3, '0')}.pdf`,
      panDocument: `pan_C${String(custIdx + 1).padStart(3, '0')}.pdf`,
    };
  }
  
  // PENDING = Incomplete onboarding (missing at least one required field)
  const missingField = custIdx % 6;
  const birthYear = 1985 + (custIdx % 15);
  const birthMonth = (custIdx % 12) + 1;
  const birthDay = (custIdx % 28) + 1;
  
  return {
    // Simulate partial completion - missing at least one critical field
    ...(missingField !== 0 ? { dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}` } : {}),
    ...(missingField !== 1 ? { companyName: companyNames[custIdx % companyNames.length] } : {}),
    ...(missingField !== 2 ? { designation: designations[custIdx % designations.length] } : {}),
    ...(missingField !== 3 ? { salaryPerAnnum: 300000 + (custIdx * 10000) } : {}),
    ...(missingField !== 4 ? { aadhaarDocument: `aadhaar_C${String(custIdx + 1).padStart(3, '0')}.pdf` } : {}),
    // Intentionally missing panDocument or other field to simulate pending state
  };
};

// 120 Customers (5 per retailer)
export const customers: Customer[] = [];
const cardBrands: Customer['cardBrand'][] = ['VISA', 'MASTERCARD', 'AMEX', 'RUPAY'];
const kycStatuses: Customer['kycStatus'][] = ['verified', 'verified', 'verified', 'verified', 'pending'];

retailers.forEach((retailer, rIdx) => {
  for (let i = 0; i < 5; i++) {
    const custIdx = rIdx * 5 + i;
    // 30% pending, 70% submitted
    const isPending = (custIdx % 10) < 3;
    const onboardingState = isPending ? 'pending' : 'submitted';
    
    customers.push({
      id: `C${String(custIdx + 1).padStart(3, '0')}`,
      retailerId: retailer.id,
      name: `Customer ${String(custIdx + 1).padStart(3, '0')}`,
      email: `customer${custIdx + 1}@example.sa`,
      phone: `+966-50-${String(custIdx + 1).padStart(4, '0')}`,
      cardLast4: String(1000 + custIdx).slice(-4),
      cardBrand: cardBrands[custIdx % 4],
      kycStatus: kycStatuses[i],
      createdAt: daysAgo(Math.floor(Math.random() * 200) + 30),
      active: true,
      onboardingState,
      ...generateCustomerOnboardingData(custIdx, onboardingState),
    });
  }
});

// Commission Rules
export const commissionRules: CommissionRule[] = [
  {
    id: 'CR001',
    name: 'Standard Tiered',
    appliesTo: 'distributor',
    baseFixed: 5.0,
    basePercent: 1.5,
    tiers: [
      { minVolume: 50, fixed: 4.5, percent: 1.4 },
      { minVolume: 100, fixed: 4.0, percent: 1.3 },
      { minVolume: 150, fixed: 3.5, percent: 1.2 },
    ],
    active: true,
    createdAt: daysAgo(365),
  },
  {
    id: 'CR002',
    name: 'High Volume Discount',
    appliesTo: 'distributor',
    distributorId: 'D001',
    baseFixed: 3.5,
    basePercent: 1.2,
    tiers: [
      { minVolume: 100, fixed: 3.0, percent: 1.0 },
      { minVolume: 200, fixed: 2.5, percent: 0.9 },
    ],
    active: true,
    createdAt: daysAgo(300),
  },
  {
    id: 'CR003',
    name: 'Premium Partner',
    appliesTo: 'distributor',
    distributorId: 'D002',
    baseFixed: 3.8,
    basePercent: 1.3,
    tiers: [
      { minVolume: 80, fixed: 3.3, percent: 1.1 },
      { minVolume: 150, fixed: 2.8, percent: 1.0 },
    ],
    active: true,
    createdAt: daysAgo(270),
  },
];

// 600 Transactions spread across last 90 days
export const transactions: Transaction[] = [];
const txStatuses: Transaction['status'][] = ['success', 'success', 'success', 'success', 'success', 'success', 'success', 'processing', 'pending', 'failed'];

for (let i = 0; i < 600; i++) {
  const customer = customers[i % 120];
  const retailer = retailers.find((r) => r.id === customer.retailerId)!;
  const distributor = distributors.find((d) => d.id === retailer.distributorId)!;
  
  const amount = Math.floor(Math.random() * 4500) + 500; // 500-5000
  const feeFixed = 10.0;
  const feePercent = 2.5;
  const commissionToMgmt = feeFixed + (amount * feePercent / 100) - distributor.commissionRateFixed - (amount * distributor.commissionRatePercent / 100);
  const commissionToDistributor = distributor.commissionRateFixed + (amount * distributor.commissionRatePercent / 100);
  
  const status = txStatuses[i % 10];
  const createdDaysAgo = Math.floor((i / 600) * 90);
  const createdAt = daysAgo(createdDaysAgo);
  
  transactions.push({
    id: `T${String(i + 1).padStart(6, '0')}`,
    distributorId: distributor.id,
    retailerId: retailer.id,
    customerId: customer.id,
    amount,
    cardBrand: customer.cardBrand,
    status,
    feeFixed,
    feePercent,
    commissionToMgmt,
    commissionToDistributor,
    createdAt,
    completedAt: status === 'success' ? daysAgo(createdDaysAgo - 1) : undefined,
  });
}

// Disputes
export const disputes: Dispute[] = [
  { id: 'DIS001', transactionId: 'T000042', raisedBy: 'customer', reason: 'not-credited', status: 'open', notes: 'Customer claims amount not received in debit card', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: 'DIS002', transactionId: 'T000087', raisedBy: 'retailer', reason: 'amount-mismatch', status: 'investigating', notes: 'Retailer reports discrepancy in commission', createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { id: 'DIS003', transactionId: 'T000123', raisedBy: 'customer', reason: 'duplicate', status: 'investigating', notes: 'Customer charged twice', createdAt: daysAgo(12), updatedAt: daysAgo(7) },
  { id: 'DIS004', transactionId: 'T000156', raisedBy: 'customer', reason: 'not-credited', status: 'resolved', notes: 'Issue resolved, amount credited', createdAt: daysAgo(15), updatedAt: daysAgo(10) },
  { id: 'DIS005', transactionId: 'T000189', raisedBy: 'retailer', reason: 'other', status: 'resolved', notes: 'Retailer inquiry about processing time', createdAt: daysAgo(20), updatedAt: daysAgo(18) },
  { id: 'DIS006', transactionId: 'T000234', raisedBy: 'customer', reason: 'amount-mismatch', status: 'rejected', notes: 'No evidence of mismatch found', createdAt: daysAgo(25), updatedAt: daysAgo(22) },
  { id: 'DIS007', transactionId: 'T000267', raisedBy: 'customer', reason: 'not-credited', status: 'open', notes: 'Pending bank verification', createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { id: 'DIS008', transactionId: 'T000298', raisedBy: 'retailer', reason: 'duplicate', status: 'investigating', notes: 'Checking transaction logs', createdAt: daysAgo(6), updatedAt: daysAgo(4) },
];

// Credit Card Approvals
export const cardApprovals: CreditCardApproval[] = [
  { id: 'CCA001', customerId: 'C015', cardLast4: '1015', cardBrand: 'VISA', limitRequested: 50000, documents: [{ name: 'ID_Card.pdf', url: '#' }, { name: 'Salary_Certificate.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(2) },
  { id: 'CCA002', customerId: 'C028', cardLast4: '1028', cardBrand: 'MASTERCARD', limitRequested: 75000, documents: [{ name: 'ID_Card.pdf', url: '#' }, { name: 'Bank_Statement.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(3) },
  { id: 'CCA003', customerId: 'C042', cardLast4: '1042', cardBrand: 'VISA', limitRequested: 60000, documents: [{ name: 'Passport.pdf', url: '#' }, { name: 'Employment_Letter.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(4) },
  { id: 'CCA004', customerId: 'C056', cardLast4: '1056', cardBrand: 'AMEX', limitRequested: 100000, documents: [{ name: 'National_ID.pdf', url: '#' }, { name: 'Tax_Returns.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(5) },
  { id: 'CCA005', customerId: 'C071', cardLast4: '1071', cardBrand: 'VISA', limitRequested: 55000, documents: [{ name: 'ID_Card.pdf', url: '#' }, { name: 'Utility_Bill.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(1) },
  { id: 'CCA006', customerId: 'C085', cardLast4: '1085', cardBrand: 'MASTERCARD', limitRequested: 65000, documents: [{ name: 'Passport.pdf', url: '#' }, { name: 'Salary_Slip.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(6) },
  { id: 'CCA007', customerId: 'C094', cardLast4: '1094', cardBrand: 'RUPAY', limitRequested: 45000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Income_Proof.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(7) },
  { id: 'CCA008', customerId: 'C103', cardLast4: '1103', cardBrand: 'VISA', limitRequested: 80000, documents: [{ name: 'ID_Card.pdf', url: '#' }, { name: 'Business_License.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(8) },
  { id: 'CCA009', customerId: 'C112', cardLast4: '1112', cardBrand: 'MASTERCARD', limitRequested: 70000, documents: [{ name: 'National_ID.pdf', url: '#' }, { name: 'Property_Deed.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(9) },
  { id: 'CCA010', customerId: 'C008', cardLast4: '1008', cardBrand: 'VISA', limitRequested: 52000, documents: [{ name: 'ID_Card.pdf', url: '#' }, { name: 'Salary_Certificate.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(10) },
  { id: 'CCA011', customerId: 'C019', cardLast4: '1019', cardBrand: 'AMEX', limitRequested: 90000, documents: [{ name: 'Passport.pdf', url: '#' }, { name: 'Investment_Portfolio.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(11) },
  { id: 'CCA012', customerId: 'C033', cardLast4: '1033', cardBrand: 'MASTERCARD', limitRequested: 58000, documents: [{ name: 'National_ID.pdf', url: '#' }, { name: 'Bank_Statement.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(12) },
  
  // Some approved/rejected for history
  { id: 'CCA013', customerId: 'C045', cardLast4: '1045', cardBrand: 'VISA', limitRequested: 50000, documents: [{ name: 'ID_Card.pdf', url: '#' }], status: 'approved', reviewer: 'Admin User', reviewedAt: daysAgo(15), createdAt: daysAgo(20) },
  { id: 'CCA014', customerId: 'C067', cardLast4: '1067', cardBrand: 'MASTERCARD', limitRequested: 120000, documents: [{ name: 'ID_Card.pdf', url: '#' }], status: 'rejected', reviewer: 'Admin User', reviewedAt: daysAgo(18), createdAt: daysAgo(25) },
];

