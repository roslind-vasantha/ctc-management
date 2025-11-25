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
7. Credit Card Approvals
8. Settlements Approvals
9. Profile Management
10. Commission Management
11. Transaction Management
12. Settlement Management
13. Disputes Management
14. Settings & Access Control
15. System Alerts & Notifications

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

Allow management to onboard distributors, retailers, and customers with full compliance requirements.

---

## **5.5.1 Distributor Onboarding**

### **Required Fields**

- Name (Full Legal Name)
- Email (Unique, verified)
- Phone (Unique, verified with OTP)
- PAN + Aadhaar (mandatory validation)
- GST (if applicable)
- Bank Account (Penny Drop Verification)
- Company Details
  - Company Name
  - Company Type (Proprietorship/Partnership/Private Limited/LLP)
  - Registration Number
  - Registration Date
- Contact Details
  - Alternate Phone
  - Business Address
- Address Proof
- POA/POI Document Upload
  - Aadhaar Card (Front & Back)
  - PAN Card
  - Bank Statement (last 3 months)
  - Company Registration Certificate
  - GST Certificate (if applicable)
  - Cancelled Cheque

### **Production Logic**

- Perform background checks via external APIs (KYC/AML)
- Validate phone/email uniqueness across all user types
- Validate PAN name match with legal name
- Penny drop verification for bank account
- Auto-generate unique Distributor ID

### **Acceptance Criteria**

- All data stored encrypted
- All validations run before approval
- Approval log must include user, timestamp, reason
- System must prevent duplicate PAN/Aadhaar/Phone/Email

---

## **5.5.2 Retailer Onboarding**

### **Required Fields**

- Name (Full Legal Name)
- Email (Unique, verified)
- Phone (Unique, verified with OTP)
- PAN + Aadhaar (mandatory validation)
- GST (if applicable)
- Bank Account (Penny Drop Verification)
- Distributor Assignment (Mandatory - must link to active distributor)
- Business Details
  - Shop/Business Name
  - Business Type
  - Business Address
  - Years in Business
- Contact Details
  - Alternate Phone
  - Business Address
- Address Proof
- POA/POI Document Upload
  - Aadhaar Card (Front & Back)
  - PAN Card
  - Bank Statement (last 3 months)
  - Shop/Business Proof (Rent Agreement/Ownership Deed)
  - GST Certificate (if applicable)
  - Cancelled Cheque
  - Business License/Trade License

### **Production Logic**

- Perform background checks via external APIs (KYC/AML)
- Validate phone/email uniqueness across all user types
- Validate PAN name match with legal name
- Penny drop verification for bank account
- Validate distributor exists and is active
- Auto-generate unique Retailer ID
- Link retailer to assigned distributor in hierarchy

### **Acceptance Criteria**

- All data stored encrypted
- All validations run before approval
- Approval log must include user, timestamp, reason
- System must prevent duplicate PAN/Aadhaar/Phone/Email
- Retailer must be linked to exactly one distributor
- Distributor can have multiple retailers

---

## **5.5.3 Customer Onboarding**

### **Required Fields**

- Name (Full Legal Name)
- Email (Unique, verified)
- Phone (Unique, verified with OTP)
- PAN + Aadhaar (mandatory validation)
- Bank Account (Penny Drop Verification)
- Retailer Assignment (Mandatory - must link to active retailer)
- Personal Details
  - Date of Birth
  - Gender
  - Occupation
- Contact Details
  - Alternate Phone (optional)
  - Current Address
  - Permanent Address
- Address Proof
- POA/POI Document Upload
  - Aadhaar Card (Front & Back)
  - PAN Card
  - Bank Statement (last 3 months)
  - Address Proof (Utility Bill/Rent Agreement/Aadhaar)
  - Cancelled Cheque
  - Passport Size Photo

### **Production Logic**

- Perform background checks via external APIs (KYC/AML)
- Validate phone/email uniqueness across all user types
- Validate PAN name match with legal name
- Validate DOB from Aadhaar
- Penny drop verification for bank account
- Validate retailer exists and is active
- Auto-generate unique Customer ID
- Link customer to assigned retailer in hierarchy

### **Acceptance Criteria**

- All data stored encrypted
- All validations run before approval
- Approval log must include user, timestamp, reason
- System must prevent duplicate PAN/Aadhaar/Phone/Email
- Customer must be linked to exactly one retailer
- Retailer can have multiple customers
- Age verification: Customer must be 18+ years old

---

# **5.6 Onboarding Approvals**

### **Purpose**

Review and approve/reject onboarding requests for Distributors, Retailers, and Customers with comprehensive KYC verification.

---

## **5.6.1 Distributor Approval**

### **Pending State**

- Basic details submitted
- Documents uploaded
- Awaiting management review

### **Submitted State**

- Full onboarding details submitted
- All docs uploaded
- KYC verification triggered automatically via external API
- PAN verification completed
- Aadhaar verification completed
- Bank account verification (Penny Drop) completed
- KYC result returned in **Verified**, **Rejected**, or **Needs Review**

### **Approval Screen Shows**

- Distributor Name (masked)
- Email & Phone (verified status)
- PAN (masked: XXX####X)
- Aadhaar (masked: XXXX XXXX ####)
- Bank Account Details (masked)
- Company Details
- All uploaded documents (viewable/downloadable)
- KYC verification status
- Background check results
- Approval Actions: **Approve** / **Reject** / **Request More Info**
- Comments field (mandatory for rejection)

### **Production Rules**

- Aadhaar masked except last 4 digits
- PAN masked except first 3 & last 1
- Phone + Email verified
- All documents must be viewable in approval screen
- Management must provide reason for rejection
- Approval creates distributor account and sends credentials

### **Acceptance Criteria**

- Review screen must show all submitted KYC results
- Approval log must include approver name, timestamp, action, comments
- Email/SMS notification sent to distributor on approval/rejection
- Rejected distributors can resubmit with corrections

---

## **5.6.2 Retailer Approval**

### **Pending State**

- OTP verified but onboarding not completed
- No KYC yet

### **Submitted State**

- Full onboarding details submitted
- All docs uploaded (including business documents)
- Distributor linkage verified
- KYC verification triggered automatically
- KYC result returned in **Verified**, **Rejected**, or **Needs Review**

### **Approval Screen Shows**

- Retailer Name (masked)
- Email & Phone (verified status)
- PAN (masked: XXX####X)
- Aadhaar (masked: XXXX XXXX ####)
- Bank Account Details (masked)
- Business Details (Shop name, address, license)
- Linked Distributor (name and ID)
- All uploaded documents (viewable/downloadable)
- KYC verification status
- Approval Actions: **Approve** / **Reject** / **Request More Info**
- Comments field (mandatory for rejection)

### **Production Rules**

- Aadhaar masked except last 4 digits
- PAN masked except first 3 & last 1
- Phone + Email verified
- Check if retailer linked to correct and active distributor
- Business license validation
- Management must provide reason for rejection

### **Acceptance Criteria**

- Review screen must show submitted KYC results
- Distributor must be active for retailer approval
- Approval log must include approver name, timestamp, action, comments
- Email/SMS notification sent to retailer on approval/rejection

---

## **5.6.3 Customer Approval**

### **Pending State**

- OTP verified but onboarding not completed
- No KYC yet

### **Submitted State**

- Full onboarding details submitted
- All docs uploaded
- Retailer linkage verified
- KYC verification triggered automatically
- Age verification completed
- KYC result returned in **Verified**, **Rejected**, or **Needs Review**

### **Approval Screen Shows**

- Customer Name (masked)
- Email & Phone (verified status)
- PAN (masked: XXX####X)
- Aadhaar (masked: XXXX XXXX ####)
- Bank Account Details (masked)
- Date of Birth & Age
- Linked Retailer (name and ID)
- Linked Distributor (via retailer)
- All uploaded documents (viewable/downloadable)
- KYC verification status
- Approval Actions: **Approve** / **Reject** / **Request More Info**
- Comments field (mandatory for rejection)

### **Production Rules**

- Aadhaar masked except last 4 digits
- PAN masked except first 3 & last 1
- Phone + Email verified
- Check if customer linked to correct and active retailer
- Age must be 18+ years
- Management must provide reason for rejection

### **Acceptance Criteria**

- Review screen must show submitted KYC results
- Retailer must be active for customer approval
- Email/SMS notification sent to customer on approval/rejection

---

# **5.7 Credit Card Approvals**

### **Purpose**

Review and approve/reject credit card registration requests from customers for cash-in/cash-out transactions. Ensures cards meet compliance requirements and fraud prevention criteria.

---

## **5.7.1 Credit Card Registration Request**

### **Pending State**

- Customer submitted card details
- Card number encrypted and stored
- Awaiting management review
- Initial fraud check completed

### **Submitted State**

- Customer details (KYC approved customer)
- Card details (masked)
- Card type (Visa/Mastercard/RuPay/Amex)
- Bank name (auto-detected from BIN)
- Card holder name
- Expiry date
- CVV verification completed
- Initial fraud score from payment gateway
- Customer's transaction history (if existing)
- Risk assessment result

### **Approval Screen Shows**

- Customer Name & ID
- Customer KYC Status
- Linked Retailer & Distributor
- Card Number (masked: #### #### #### ####, show last 4)
- Card Type & Network
- Issuing Bank
- Card Holder Name
- Expiry Date
- Card BIN (Bank Identification Number)
- Fraud Risk Score (Low/Medium/High)
- Previous Cards Linked (if any)
- Customer Transaction History
  - Total transactions
  - Success rate
  - Dispute history
  - Average transaction value
- Approval Actions: **Approve** / **Reject** / **Flag for Investigation**
- Comments field (mandatory for rejection)

### **Production Rules**

- Card number fully encrypted in database
- Show only last 4 digits in UI
- CVV never stored (only validated during registration)
- Verify card not already registered by another customer
- Check card against fraud database
- Validate expiry date is future date
- Auto-flag high-risk cards based on:
  - BIN blacklist
  - Multiple registration attempts
  - Customer fraud history
  - Unusual card patterns

### **Risk Assessment Criteria**

- **Low Risk**: Clean BIN, verified customer, no dispute history
- **Medium Risk**: New customer, first card, or moderate transaction history
- **High Risk**: Blacklisted BIN, customer with disputes, multiple failed attempts

### **Acceptance Criteria**

- Review screen must show complete card and customer context
- SMS/Email notification sent to customer on approval/rejection
- Approved card immediately available for transactions
- Card verification with payment gateway before approval

---

## **5.7.2 Card Status Management**

### **Card Statuses**

- **Pending**: Awaiting approval
- **Approved**: Active for transactions
- **Rejected**: Not approved for use
- **Suspended**: Temporarily disabled (fraud alert)
- **Blocked**: Permanently blocked (fraud confirmed)
- **Expired**: Card expiry date passed

### **Actions Available**

- View card details (masked)
- View transaction history for specific card
- Suspend card (temporary)
- Block card (permanent)
- Unblock card (if wrongly flagged)
- View fraud alerts related to card

### **Acceptance Criteria**

- Status changes must be logged with reason
- Customer notified on any status change
- Suspended/Blocked cards cannot process transactions
- Auto-suspend card after 3 failed transaction attempts in 1 hour

---

# **5.8 Settlements Approvals**

### **Purpose**

Review and approve settlement batches before disbursing funds to distributors, retailers, or customers. Ensures accuracy, prevents fraud, and maintains financial control.

---

## **5.8.1 Settlement Batch Review**

### **Pending State**

- Settlement batch generated automatically (T+1 or T+2)
- All transactions reconciled
- Commission calculated
- Awaiting management approval before payout

### **Submitted State**

- Settlement Batch ID
- Settlement Period (From Date - To Date)
- Settlement Type (Distributor/Retailer/Customer)
- Total transactions included
- Total settlement amount
- Commission breakdown
- All transactions validated

### **Approval Screen Shows**

- Batch ID & Creation Date
- Settlement Period
- Payee Type (Distributor/Retailer/Customer)
- Payee Details
  - Name
  - Bank Account (masked)
  - IFSC Code
- Settlement Summary
  - Total Transactions Count
  - Total Fees Deducted
  - Net Settlement Amount
  - Commission Amount (if applicable)
- Transaction Breakdown
  - Success Count
  - Failed Count
  - Refund Count
  - Dispute Count
- Previous Settlement History
- Approval Actions: **Approve** / **Reject** / **Hold for Investigation**
- Comments field (mandatory for rejection/hold)

### **Production Rules**

- Settlement amount must match reconciliation
- Cannot approve if gateway settlement not received
- Flag if settlement amount > ₹50,000 for additional review
- Flag if dispute rate > 2% in settlement period
- Verify bank account details match registered account
- Check for sufficient balance in management wallet
- Auto-hold settlement if payee has pending disputes

### **Approval Workflow**

1. **Auto-Generated**: System creates settlement batch based on schedule
2. **Reconciliation**: Auto-match with gateway settlement
3. **Validation**: Check all transactions reconciled
4. **Review**: Management reviews batch
5. **Approval**: Management approves/rejects
6. **Processing**: If approved, initiate bank transfer
7. **Confirmation**: Update status on bank confirmation
8. **Notification**: Notify payee of settlement status

### **Settlement Filters**

- Date range
- Settlement type (Distributor/Retailer/Customer)
- Status (Pending/Approved/Rejected/Processing/Completed/Failed)
- Amount range
- Payee name/ID search

### **Acceptance Criteria**

- Review screen shows complete settlement context
- Cannot approve without successful reconciliation
- Email/SMS notification sent to payee on approval/rejection/completion
- Rejected settlements must be regenerated after correction
- System must prevent duplicate settlement for same period
- Settlement status updated in real-time
- Failed bank transfers must auto-retry with notification

---

## **5.8.2 Settlement Discrepancy Management**

### **Purpose**

Handle cases where settlement amounts don't match expected values.

### **Discrepancy Types**

- **Over Settlement**: Calculated amount > Gateway amount
- **Under Settlement**: Calculated amount < Gateway amount
- **Missing Transactions**: Transactions in system but not in gateway settlement
- **Extra Transactions**: Transactions in gateway but not in system

### **Discrepancy Screen Shows**

- Discrepancy ID
- Settlement Batch ID
- Discrepancy Type
- Expected Amount vs Actual Amount
- Difference Amount
- Affected Transactions List
- Root Cause (if identified)
- Resolution Actions
- Status (Open/Investigating/Resolved/Closed)

### **Actions Available**

- View detailed transaction comparison
- Mark for investigation
- Adjust settlement amount (with approval)
- Split settlement (partial approval)
- Reject entire batch
- Add manual adjustment entry

### **Acceptance Criteria**

- All discrepancies must be resolved before final approval
- Adjustments require senior management approval
- Complete audit trail of all discrepancy resolutions
- Automatic alerts for discrepancies > ₹1,000

---

# **5.9 Profile Management**

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

# **5.10 Commission Management**

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

# **5.11 Transaction Management**

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

# **5.12 Settlement Management**

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

# **5.13 Disputes Management**

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

# **5.14 Settings & Access Control**

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
