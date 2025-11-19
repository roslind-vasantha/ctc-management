---
# **Business Requirements Document (BRD)**

## **Management Application – Card-to-Cash Platform (Production Version)**
---

# **1. Purpose**

The Management Application is the **central command system** for operating a production-grade Card-to-Cash fintech platform in India. It enables the management team to oversee:

- onboarding
- risk & compliance monitoring
- transactions
- settlements
- commissions
- compliance
- user hierarchy
- operational workflows

The objective is to ensure **secure**, **compliant**, **scalable**, and **profitable** operations.

---

# **2. Scope**

### **In Scope**

- Multi-role user hierarchy management
- End-to-end onboarding + KYC verification
- Production-ready transaction reporting
- Real dispute lifecycle
- Revenue & commission engine
- Regulatory compliance (RBI, PCI DSS)
- Security controls
- Observability (logs, alerts, analytics)

### **Out of Scope**

- Customer-facing apps (handled in separate BRDs)
- Bank integrations (documented separately)
- Acquiring gateway settlement logic
- Ledger system (covered in core backend BRD)

---

# **3. User Roles**

1. **Super Admin**

We only have admin in our appplication

---

# **4. High-Level Modules**

1. Executive Dashboard
2. Finance Dashboard
3. Risk & Control Dashboard
4. Operations Dashboard
5. Management Onboarding
6. Onboarding Approvals
7. Profile Management
8. Commission Management
9. Transaction Management
10. Settlement Management
11. Disputes Management
12. Credit Card Approvals
13. Settings & Access Control
14. System Alerts & Notifications

---

# **5. Detailed Business Requirements**

---

# **5.1 Executive Dashboard (Production)**

### **Purpose**

Provide top-level visibility into platform health, revenue, profitability, risk exposure, and operational KPI compliance.

### **Core KPIs**

- Gross Merchandise Value (GMV)
- Total Transactions
- Net Revenue
- Management Commission
- Yield %
- Success Rate
- Dispute Rate
- Active Distributors / Retailers / Customers
- Settlement Outstanding Amount
- Chargeback Exposure

### **Charts**

- GMV Trend
- Transaction Volume Trend
- Revenue Trend
- Disputes Open vs Closed
- Settlement Status Trend

### **Acceptance Criteria**

- All metrics accurate to backend calculations
- Timezone: IST
- Filters: 24h, 7d, 30d, Custom

---

# **5.2 Finance Dashboard**

### **Purpose**

Enable finance team to track revenue, profitability, commissions, settlements, and cost leakages.

### **KPI Widgets**

- Total GMV
- Total Settled Amount
- Net Revenue
- Pending Settlements
- Yield %
- Partner-specific earnings

### **Production Rules**

- Net Revenue = GMV – (PG fees + distributor commission + retailer commissions + tax components)
- Commission must always be <= Net Revenue
- GMV must map to actual daily settlement batches

### **Tables**

- Top Contributors (Distributor/Retailer)
- Settlement Batches (T+1 / T+2)
- Wallet Movements
- Revenue Leakages (failed/refund costs)

### **Acceptance Criteria**

- All calculations must be backend-driven
- No mismatches between Finance dashboard and ledger system
- Filters must support instant refresh

---

# **5.3 Risk & Control Dashboard**

### **Purpose**

Monitor disputes and chargeback

### **KPIs**

- Chargeback ratio
- Dispute rate

### **Charts**

- Disputes Open vs Resolved

---

# **5.4 Operations Dashboard**

### **Purpose**

Monitor onboarding funnel, workload, SLA adherence, and partner performance.

### **KPIs**

- Pending Retailers
- Pending Customers
- KYC completion rate

---

# **5.5 Management Onboarding**

### **Purpose**

Allow management to onboard distributors with full compliance requirements.

### **Required Fields**

- Name
- Email
- Phone
- PAN + Aadhaar (mandatory validation)
- GST (if applicable)
- Bank Account (Penny Drop Verification)
- Company Details
- Contact Details
- Address proof
- POA/POI document upload

### **Production Logic**

- Perform background checks via external APIs (KYC/AML)
- Validate phone/email uniqueness
- Validate PAN name match

### **Acceptance Criteria**

- All data stored encrypted
- All validations run before approval
- Approval log must include user, timestamp, reason

---

# **5.6 Onboarding Approvals (Retailers & Customers)**

### **Pending State**

- OTP verified but onboarding not completed
- No KYC yet

### **Submitted State**

- Full onboarding details submitted
- All docs uploaded
- KYC verification triggered automatically
- KYC result returned in **Verified**, **Rejected**, or **Needs Review**

### **Production Rules**

- Aadhaar masked except last 4 digits
- PAN masked except first 3 & last 1
- Phone + Email verified
- Check if user linked to correct retailer/distributor

### **Acceptance Criteria**

- Review screen must show submitted KYC results

---

# **5.7 Profile Management**

### **Purpose**

Hierarchy visibility: Distributor → Retailer → Customer

### **Elements**

- KYC Status
- Total GMV
- Success rate
- Dispute history
- Mapped hierarchy

### **Acceptance Criteria**

- No PII beyond masked values
- All subordinate relationships accurate

---

# **5.8 Commission Management**

### **Production Rules**

- Tier-based commission
- Volume-based slabs
- Distributor override
- Retailer override
- Hard caps per txn
- Minimum earnings protection
- Rules effective by date and partner

### **Acceptance Criteria**

- Commission computation must match backend engine
- Rule update only allowed by authorized roles
- Validation for overlapping slabs

---

# **5.9 Transaction Management**

### **Purpose**

Provide full visibility into end-to-end transaction lifecycle.

### **Data Shown**

- Transaction ID
- Card Network
- Card BIN (masked)
- Customer details (masked)
- Distributor
- Retailer
- Amount
- Status
- Timestamps
- Settlement ID
- Fees breakdown
- Source device/IP (optional)

### **Filters**

- Cash-in and cash-out
- Date filter
- Search by CRN

### **Acceptance Criteria**

- Sorting + filtering real-time
- Export CSV for finance team

---

# **5.10 Settlement Management**

### **Purpose**

Track settlement cycles.

### **Data**

- Batch ID
- Date
- Total Amount
- Payouts
- Status
- Bank reference number

### **Acceptance Criteria**

- All settlement numbers match ledger

---

# **5.11 Disputes Management**

### **Statuses**

- Pending
- Processing
- Resolved
- Rejected

### **Required Views**

- Customer info
- Transaction info
- Evidence documents
- Timeline of dispute
- Actions (Process/Resolve/Reject)
- Chargeback flag

### **Acceptance Criteria**

- Resolve action hidden if dispute already rejected

---

# **5.13 Settings & Access Control**

### **Includes**

- Profile settings
- Password update
- Notification preferences

---

<!-- # **5.15 Alerts & Notifications**

### **Triggers**

- Fraud rules
- KYC failures
- Operational delays
- Settlement delays

### **Delivery**

- In-app
- Email
- (Future) Webhooks -->

---

# **7. Acceptance Criteria (Entire Management System)**

- All dashboards accurate to backend data
- Commission engine consistent
- Settlement numbers reconcile
- No unmasked sensitive fields
- UI responsive across devices
- No broken flows

---
