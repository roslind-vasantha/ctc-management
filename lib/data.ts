/*
 * Seeds localized to India (IN): names, phones, Aadhaar/PAN, INR amounts, states/cities.
 * All currency values in INR (₹). Phone numbers in +91 format. Card brands prioritize RuPay.
 */

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
  // Add IST business hours (10:00-20:00) for realism
  const hour = 10 + (days % 10);
  date.setHours(hour, (days * 7) % 60, 0, 0);
  return date.toISOString();
};

// Indian states/UTs
const STATES = [
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Delhi',
  'Gujarat',
  'Kerala',
  'Uttar Pradesh',
] as const;

// Cities mapped to states
const CITIES: Record<typeof STATES[number], string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  Telangana: ['Hyderabad', 'Warangal'],
  Delhi: ['New Delhi'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
  Kerala: ['Kochi', 'Thiruvananthapuram'],
  'Uttar Pradesh': ['Lucknow', 'Noida'],
};

// Indian names pool
const firstNames = [
  'Aarav', 'Neha', 'Rohan', 'Priya', 'Arjun', 'Kavya', 'Vikram', 'Meera',
  'Aditya', 'Ananya', 'Rahul', 'Sneha', 'Karan', 'Divya', 'Siddharth', 'Pooja',
  'Raj', 'Shreya', 'Aman', 'Riya', 'Vivek', 'Anjali', 'Nikhil', 'Sanjana',
];
const lastNames = [
  'Iyer', 'Kulkarni', 'Singh', 'Nair', 'Verma', 'Reddy', 'Desai', 'Sharma',
  'Patel', 'Kumar', 'Rao', 'Gupta', 'Joshi', 'Mehta', 'Malhotra', 'Agarwal',
];

// Helper functions for Indian data
function inPhone(i: number): string {
  // +91 9XXXXXXXXX format (10 digits, starting with 6-9)
  const start = 9000000000 + (i % 100000000);
  return `+91 ${String(start).slice(0, 10)}`;
}

function samplePAN(i: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const A = letters[(i * 7) % 26];
  const B = letters[(i * 11) % 26];
  const C = letters[(i * 13) % 26];
  const D = letters[(i * 17) % 26];
  const E = letters[(i * 19) % 26];
  const num = String(1000 + (i % 9000)).padStart(4, '0');
  const last = letters[(i * 23) % 26];
  return `${A}${B}${C}${D}${E}${num}${last}`;
}

function sampleAadhaar(i: number): string {
  // 12-digit Aadhaar (starts with 7-9)
  const base = 781234567890 + (i % 100000000);
  return String(base).slice(0, 12);
}

function indianName(i: number): string {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  return `${first} ${last}`;
}

// 8 Distributors across different Indian states
export const distributors: Distributor[] = [
  {
    id: 'D001',
    name: 'Maharashtra Financial Services',
    email: 'contact@maharashtra-fs.in',
    phone: inPhone(1),
    region: 'Maharashtra',
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
    name: 'Karnataka Capital Partners',
    email: 'info@karnataka-cp.in',
    phone: inPhone(2),
    region: 'Karnataka',
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
    name: 'Tamil Nadu Credit Solutions',
    email: 'support@tn-credit.in',
    phone: inPhone(3),
    region: 'Tamil Nadu',
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
    name: 'Telangana Finance Hub',
    email: 'hello@telangana-fh.in',
    phone: inPhone(4),
    region: 'Telangana',
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
    name: 'Delhi Capital Network',
    email: 'contact@delhi-cn.in',
    phone: inPhone(5),
    region: 'Delhi',
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
    name: 'Gujarat Trading LLC',
    email: 'info@gujarat-trade.in',
    phone: inPhone(6),
    region: 'Gujarat',
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
    name: 'Kerala Finance Hub',
    email: 'support@kerala-fh.in',
    phone: inPhone(7),
    region: 'Kerala',
    kycStatus: 'verified',
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
    name: 'Uttar Pradesh Capital Group',
    email: 'hello@up-cg.in',
    phone: inPhone(8),
    region: 'Uttar Pradesh',
    kycStatus: 'verified',
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
      businessPan: samplePAN(idNum),
      commissionType: (idNum % 2 === 0 ? 'fixed' : 'percentage') as 'fixed' | 'percentage',
      commissionAmount: idNum % 2 === 0 ? 5.0 : 2.5,
      agreementDocument: `agreement_${id}.pdf`,
    };
  }
  
  // Pending state - simulate incomplete onboarding (missing some fields)
  const missingField = idNum % 5;
  return {
    ...(missingField !== 0 ? { aadhaarDocument: `aadhaar_${id}.pdf` } : {}),
    ...(missingField !== 1 ? { panDocument: `pan_${id}.pdf` } : {}),
    ...(missingField !== 2 ? { businessName: `${id} Business Pvt Ltd` } : {}),
    ...(missingField !== 3 ? { gstNumber: `22AAAA${String(idNum).padStart(5, '0')}A1Z5` } : {}),
  };
};

// 24 Retailers (3 per distributor) - Mix of pending (30%) and submitted (70%)
export const retailers: Retailer[] = [
  // D001 - Maharashtra (R001-R003: 2 submitted, 1 pending)
  { id: 'R001', distributorId: 'D001', name: 'Mumbai Quick Cash', email: 'north@mumbai-qc.in', phone: inPhone(11), city: 'Mumbai', kycStatus: 'verified', monthVolume: 52, monthGmv: 208000, createdAt: daysAgo(300), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R001', 'submitted') },
  { id: 'R002', distributorId: 'D001', name: 'Pune Express Money', email: 'center@pune-em.in', phone: inPhone(12), city: 'Pune', kycStatus: 'verified', monthVolume: 48, monthGmv: 192000, createdAt: daysAgo(290), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R002', 'submitted') },
  { id: 'R003', distributorId: 'D001', name: 'Nagpur Fast Finance', email: 'south@nagpur-ff.in', phone: inPhone(13), city: 'Nagpur', kycStatus: 'pending', monthVolume: 42, monthGmv: 168000, createdAt: daysAgo(280), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R003', 'pending') },

  // D002 - Karnataka (R004-R006: 2 submitted, 1 pending)
  { id: 'R004', distributorId: 'D002', name: 'Bengaluru Quick Pay', email: 'info@bengaluru-qp.in', phone: inPhone(21), city: 'Bengaluru', kycStatus: 'verified', monthVolume: 46, monthGmv: 184000, createdAt: daysAgo(260), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R004', 'submitted') },
  { id: 'R005', distributorId: 'D002', name: 'Mysuru Cash Services', email: 'coastal@mysuru-cs.in', phone: inPhone(22), city: 'Mysuru', kycStatus: 'verified', monthVolume: 44, monthGmv: 176000, createdAt: daysAgo(250), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R005', 'submitted') },
  { id: 'R006', distributorId: 'D002', name: 'Mangaluru Finance', email: 'redsea@mangaluru-fin.in', phone: inPhone(23), city: 'Mangaluru', kycStatus: 'pending', monthVolume: 38, monthGmv: 152000, createdAt: daysAgo(240), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R006', 'pending') },

  // D003 - Tamil Nadu (R007-R009: 2 submitted, 1 pending)
  { id: 'R007', distributorId: 'D003', name: 'Chennai Cash Point', email: 'east@chennai-cp.in', phone: inPhone(31), city: 'Chennai', kycStatus: 'verified', monthVolume: 36, monthGmv: 144000, createdAt: daysAgo(230), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R007', 'submitted') },
  { id: 'R008', distributorId: 'D003', name: 'Coimbatore Money Hub', email: 'hub@coimbatore-mh.in', phone: inPhone(32), city: 'Coimbatore', kycStatus: 'verified', monthVolume: 34, monthGmv: 136000, createdAt: daysAgo(220), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R008', 'submitted') },
  { id: 'R009', distributorId: 'D003', name: 'Madurai Finance Express', email: 'gulf@madurai-fe.in', phone: inPhone(33), city: 'Madurai', kycStatus: 'pending', monthVolume: 28, monthGmv: 112000, createdAt: daysAgo(210), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R009', 'pending') },

  // D004 - Telangana (R010-R012: 2 submitted, 1 pending)
  { id: 'R010', distributorId: 'D004', name: 'Hyderabad Cash Center', email: 'holy@hyderabad-cc.in', phone: inPhone(41), city: 'Hyderabad', kycStatus: 'verified', monthVolume: 32, monthGmv: 128000, createdAt: daysAgo(200), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R010', 'submitted') },
  { id: 'R011', distributorId: 'D004', name: 'Warangal Finance Center', email: 'mfc@warangal-fc.in', phone: inPhone(42), city: 'Warangal', kycStatus: 'verified', monthVolume: 30, monthGmv: 120000, createdAt: daysAgo(190), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R011', 'submitted') },
  { id: 'R012', distributorId: 'D004', name: 'Hyderabad Quick Service', email: 'quick@hyderabad-qs.in', phone: inPhone(43), city: 'Hyderabad', kycStatus: 'pending', monthVolume: 23, monthGmv: 92000, createdAt: daysAgo(180), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R012', 'pending') },

  // D005 - Delhi (R013-R015: 2 submitted, 1 pending)
  { id: 'R013', distributorId: 'D005', name: 'New Delhi Express Cash', email: 'express@delhi-ec.in', phone: inPhone(51), city: 'New Delhi', kycStatus: 'verified', monthVolume: 28, monthGmv: 112000, createdAt: daysAgo(170), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R013', 'submitted') },
  { id: 'R014', distributorId: 'D005', name: 'Delhi Capital Finance', email: 'pcf@delhi-cf.in', phone: inPhone(52), city: 'New Delhi', kycStatus: 'verified', monthVolume: 26, monthGmv: 104000, createdAt: daysAgo(160), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R014', 'submitted') },
  { id: 'R015', distributorId: 'D005', name: 'Noida Money Point', email: 'mmp@noida-mp.in', phone: inPhone(53), city: 'Noida', kycStatus: 'pending', monthVolume: 22, monthGmv: 88000, createdAt: daysAgo(150), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R015', 'pending') },

  // D006 - Gujarat (R016-R018: 2 submitted, 1 pending)
  { id: 'R016', distributorId: 'D006', name: 'Ahmedabad Cash Express', email: 'kce@ahmedabad-ce.in', phone: inPhone(61), city: 'Ahmedabad', kycStatus: 'verified', monthVolume: 24, monthGmv: 96000, createdAt: daysAgo(140), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R016', 'submitted') },
  { id: 'R017', distributorId: 'D006', name: 'Surat Finance Hub', email: 'corniche@surat-fh.in', phone: inPhone(62), city: 'Surat', kycStatus: 'verified', monthVolume: 22, monthGmv: 88000, createdAt: daysAgo(130), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R017', 'submitted') },
  { id: 'R018', distributorId: 'D006', name: 'Vadodara Quick Money', email: 'quick@vadodara-qm.in', phone: inPhone(63), city: 'Vadodara', kycStatus: 'pending', monthVolume: 18, monthGmv: 72000, createdAt: daysAgo(120), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R018', 'pending') },

  // D007 - Kerala (R019-R021: 1 submitted, 2 pending)
  { id: 'R019', distributorId: 'D007', name: 'Kochi Fast Cash', email: 'fast@kochi-fc.in', phone: inPhone(71), city: 'Kochi', kycStatus: 'verified', monthVolume: 16, monthGmv: 64000, createdAt: daysAgo(80), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R019', 'submitted') },
  { id: 'R020', distributorId: 'D007', name: 'Thiruvananthapuram Finance Hub', email: 'north@tvm-fh.in', phone: inPhone(72), city: 'Thiruvananthapuram', kycStatus: 'pending', monthVolume: 14, monthGmv: 56000, createdAt: daysAgo(70), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R020', 'pending') },
  { id: 'R021', distributorId: 'D007', name: 'Kochi Money Services', email: 'tms@kochi-ms.in', phone: inPhone(73), city: 'Kochi', kycStatus: 'pending', monthVolume: 0, monthGmv: 0, createdAt: daysAgo(30), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R021', 'pending') },

  // D008 - Uttar Pradesh (R022-R024: 1 submitted, 2 pending)
  { id: 'R022', distributorId: 'D008', name: 'Lucknow Cash Center', email: 'acc@lucknow-cc.in', phone: inPhone(81), city: 'Lucknow', kycStatus: 'verified', monthVolume: 13, monthGmv: 52000, createdAt: daysAgo(50), active: true, onboardingState: 'submitted', ...generateRetailerOnboardingData('R022', 'submitted') },
  { id: 'R023', distributorId: 'D008', name: 'Noida Express Finance', email: 'sef@noida-ef.in', phone: inPhone(82), city: 'Noida', kycStatus: 'pending', monthVolume: 0, monthGmv: 0, createdAt: daysAgo(40), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R023', 'pending') },
  { id: 'R024', distributorId: 'D008', name: 'Lucknow Money Point', email: 'mcp@lucknow-mp.in', phone: inPhone(83), city: 'Lucknow', kycStatus: 'pending', monthVolume: 10, monthGmv: 40000, createdAt: daysAgo(30), active: true, onboardingState: 'pending', ...generateRetailerOnboardingData('R024', 'pending') },
];

// Helper to generate customer onboarding data
// Business Rule: Customer reaches "submitted" state ONLY when ALL sections are complete:
//   1. Personal Information: Name, Phone, Email, Date of Birth
//   2. Employment Details: Company Name, Designation, Salary per Annum
//   3. Document Verification: Both Aadhaar AND PAN documents uploaded
// If ANY field is missing, customer remains in "pending" state
const generateCustomerOnboardingData = (custIdx: number, onboardingState: 'pending' | 'submitted') => {
  const companyNames = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'ICICI Bank', 'HDFC Bank', 'Axis Bank'];
  const designations = ['Software Engineer', 'Operations Manager', 'Accountant', 'Sales Executive', 'Business Analyst', 'Project Manager', 'Team Lead', 'Consultant'];
  
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
      salaryPerAnnum: 300000 + (custIdx * 10000) + ((custIdx * 7) % 100000), // Deterministic
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
// Prioritize RuPay for Indian market
const cardBrands: Customer['cardBrand'][] = ['RUPAY', 'RUPAY', 'VISA', 'MASTERCARD', 'RUPAY', 'VISA', 'AMEX', 'RUPAY'];
const kycStatuses: Customer['kycStatus'][] = ['verified', 'verified', 'verified', 'verified', 'verified'];

retailers.forEach((retailer, rIdx) => {
  for (let i = 0; i < 5; i++) {
    const custIdx = rIdx * 5 + i;
    // 30% pending, 70% submitted
    const isPending = (custIdx % 10) < 3;
    const onboardingState = isPending ? 'pending' : 'submitted';
    
    customers.push({
      id: `C${String(custIdx + 1).padStart(3, '0')}`,
      retailerId: retailer.id,
      name: indianName(custIdx),
      email: `${indianName(custIdx).toLowerCase().replace(' ', '.')}@example.in`,
      phone: inPhone(100 + custIdx),
      cardLast4: String(1000 + custIdx).slice(-4),
      cardBrand: cardBrands[custIdx % cardBrands.length],
      kycStatus: kycStatuses[i],
      createdAt: daysAgo(Math.floor((custIdx * 7) % 200) + 30), // Deterministic
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

// 600 Transactions spread across last 90 days (INR amounts)
export const transactions: Transaction[] = [];
const txStatuses: Transaction['status'][] = ['success', 'success', 'success', 'success', 'success', 'success', 'success', 'processing', 'pending', 'failed'];

for (let i = 0; i < 600; i++) {
  const customer = customers[i % 120];
  const retailer = retailers.find((r) => r.id === customer.retailerId)!;
  const distributor = distributors.find((d) => d.id === retailer.distributorId)!;

  // INR amounts: 1,000-50,000 (deterministic)
  const amount = 1000 + ((i * 13) % 49000);
  const feeFixed = 10 + ((i * 3) % 40); // 10-50 INR
  const feePercent = 1.5 + ((i * 7) % 10) / 10; // 1.5-2.5%
  const commissionToMgmt = feeFixed + (amount * feePercent / 100) - (distributor.commissionRateFixed || 0) - (amount * (distributor.commissionRatePercent || 0) / 100);
  const commissionToDistributor = (distributor.commissionRateFixed || 0) + (amount * (distributor.commissionRatePercent || 0) / 100);

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
  { id: 'DIS001', transactionId: 'T000042', raisedBy: 'customer', reason: 'not-credited', status: 'pending', notes: 'Customer claims amount not received in card account', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: 'DIS002', transactionId: 'T000087', raisedBy: 'customer', reason: 'amount-mismatch', status: 'processing', notes: 'Customer reports discrepancy in charged amount', createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { id: 'DIS003', transactionId: 'T000123', raisedBy: 'customer', reason: 'duplicate', status: 'processing', notes: 'Customer charged twice', createdAt: daysAgo(12), updatedAt: daysAgo(7) },
  { id: 'DIS004', transactionId: 'T000156', raisedBy: 'customer', reason: 'not-credited', status: 'resolved', notes: 'Issue resolved, amount credited', createdAt: daysAgo(15), updatedAt: daysAgo(10) },
  { id: 'DIS005', transactionId: 'T000189', raisedBy: 'customer', reason: 'other', status: 'resolved', notes: 'Customer inquiry about processing time', createdAt: daysAgo(20), updatedAt: daysAgo(18) },
  { id: 'DIS006', transactionId: 'T000234', raisedBy: 'customer', reason: 'amount-mismatch', status: 'rejected', notes: 'No evidence of mismatch found', createdAt: daysAgo(25), updatedAt: daysAgo(22) },
  { id: 'DIS007', transactionId: 'T000267', raisedBy: 'customer', reason: 'not-credited', status: 'pending', notes: 'Pending bank verification', createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { id: 'DIS008', transactionId: 'T000298', raisedBy: 'customer', reason: 'duplicate', status: 'processing', notes: 'Customer flagged suspected duplicate swipe', createdAt: daysAgo(6), updatedAt: daysAgo(4) },
];

// Credit Card Approvals (prioritize RuPay)
export const cardApprovals: CreditCardApproval[] = [
  { id: 'CCA001', customerId: 'C015', cardLast4: '1015', cardBrand: 'RUPAY', limitRequested: 50000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Salary_Certificate.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(2) },
  { id: 'CCA002', customerId: 'C028', cardLast4: '1028', cardBrand: 'VISA', limitRequested: 75000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Bank_Statement.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(3) },
  { id: 'CCA003', customerId: 'C042', cardLast4: '1042', cardBrand: 'RUPAY', limitRequested: 60000, documents: [{ name: 'PAN.pdf', url: '#' }, { name: 'Employment_Letter.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(4) },
  { id: 'CCA004', customerId: 'C056', cardLast4: '1056', cardBrand: 'MASTERCARD', limitRequested: 100000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Tax_Returns.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(5) },
  { id: 'CCA005', customerId: 'C071', cardLast4: '1071', cardBrand: 'RUPAY', limitRequested: 55000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Utility_Bill.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(1) },
  { id: 'CCA006', customerId: 'C085', cardLast4: '1085', cardBrand: 'VISA', limitRequested: 65000, documents: [{ name: 'PAN.pdf', url: '#' }, { name: 'Salary_Slip.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(6) },
  { id: 'CCA007', customerId: 'C094', cardLast4: '1094', cardBrand: 'RUPAY', limitRequested: 45000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Income_Proof.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(7) },
  { id: 'CCA008', customerId: 'C103', cardLast4: '1103', cardBrand: 'VISA', limitRequested: 80000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Business_License.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(8) },
  { id: 'CCA009', customerId: 'C112', cardLast4: '1112', cardBrand: 'MASTERCARD', limitRequested: 70000, documents: [{ name: 'PAN.pdf', url: '#' }, { name: 'Property_Deed.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(9) },
  { id: 'CCA010', customerId: 'C008', cardLast4: '1008', cardBrand: 'RUPAY', limitRequested: 52000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Salary_Certificate.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(10) },
  { id: 'CCA011', customerId: 'C019', cardLast4: '1019', cardBrand: 'MASTERCARD', limitRequested: 90000, documents: [{ name: 'PAN.pdf', url: '#' }, { name: 'Investment_Portfolio.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(11) },
  { id: 'CCA012', customerId: 'C033', cardLast4: '1033', cardBrand: 'RUPAY', limitRequested: 58000, documents: [{ name: 'Aadhaar.pdf', url: '#' }, { name: 'Bank_Statement.pdf', url: '#' }], status: 'pending', createdAt: daysAgo(12) },

  // Some approved/rejected for history
  { id: 'CCA013', customerId: 'C045', cardLast4: '1045', cardBrand: 'RUPAY', limitRequested: 50000, documents: [{ name: 'Aadhaar.pdf', url: '#' }], status: 'approved', reviewer: 'Admin User', reviewedAt: daysAgo(15), createdAt: daysAgo(20) },
  { id: 'CCA014', customerId: 'C067', cardLast4: '1067', cardBrand: 'VISA', limitRequested: 120000, documents: [{ name: 'PAN.pdf', url: '#' }], status: 'rejected', reviewer: 'Admin User', reviewedAt: daysAgo(18), createdAt: daysAgo(25) },
];
