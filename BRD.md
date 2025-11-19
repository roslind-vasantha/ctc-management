This BRD reflects:

- Real Indian regulatory environment (RBI rules, KYC, AML, MDR, PG norms)
- Real settlement flows (T+1/T+2)
- Real risk controls
- Real operational constraints
- Real revenue & commission models
- Production-quality acceptance criteria
- No dummy-app assumptions
- No shortcuts

It is formatted in **clean Markdown**, ready for GitHub/Notion, and convertible to PDF or DOCX.

---

# **Business Requirements Document (BRD)**

## **Management Application – Card-to-Cash Platform (Production Version)**

---

# **1. Purpose**

The Management Application is the **central command system** for operating a production-grade Card-to-Cash fintech platform in India. It enables the management team to oversee:

- onboarding
- risk & fraud monitoring
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
- Robust risk engine indicators
- Revenue & commission engine
- Audit logging
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
2. **Management Admin**
3. **Risk Team**
4. **Finance Team**
5. **Compliance Team**
6. **Operations Team**
7. **Auditor (Read-only)**

Each role has separate permissions via RBAC.

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
14. Audit Logs
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
- Risk Score
- Active Distributors / Retailers / Customers
- Settlement Outstanding Amount
- Chargeback Exposure

### **Charts**

- GMV Trend
- Transaction Volume Trend
- Revenue Trend
- Risk Score Trend
- Disputes Open vs Closed
- Settlement Status Trend

### **Compliance Metrics**

- KYC completion %
- Suspicious user count
- PAN/Aadhaar match failures
- Velocity breach attempts

### **Acceptance Criteria**

- Dashboard loads under 2 seconds
- All metrics accurate to backend calculations
- Timezone: IST
- Filters: 24h, 7d, 30d, 90d, Custom

---

# **5.2 Finance Dashboard**

### **Purpose**

Enable finance team to track revenue, profitability, commissions, settlements, and cost leakages.

### **KPI Widgets**

- Total GMV
- Total Settled Amount
- Net Revenue
- Total MDR Fees
- Total Payout Cost
- Pending Settlements
- Yield %
- Partner-specific earnings

### **Production Rules**

- Net Revenue = GMV – (MDR + PG fees + settlement fees + partner commissions + tax components)
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

Monitor fraud, anomalies, sanction violations, misuse, and high-risk flows.

### **KPIs**

- High-risk transactions
- Suspicious users
- Chargeback ratio
- Dispute rate
- Reversal rate
- Fraud rule triggers
- Device/geo anomaly count

### **Risk Rules (Production-Ready)**

- PAN/Aadhaar mismatch
- Velocity breaches (amount, count, geo, IP, device)
- Withdrawals above threshold
- Credit card BIN blacklists
- Repeat disputes
- Cardholder name mismatch
- High chargeback score

### **Charts**

- Risk Trend (aggregated risk score)
- Rule Trigger Frequency
- Disputes Open vs Resolved
- High-Risk by Reason

### **Acceptance Criteria**

- All risk rules configurable
- 100% audit trail for decisions
- Alerts delivered to Risk Team instantly

---

# **5.4 Operations Dashboard**

### **Purpose**

Monitor onboarding funnel, workload, SLA adherence, and partner performance.

### **KPIs**

- Pending Retailers
- Pending Customers
- Approval turnaround time
- KYC completion rate
- Document rejection causes
- Operational SLA breaches

### **Funnel Visualization**

- Start → Document Upload → Verification → Approval

### **Acceptance Criteria**

- Accurate SLA timers
- Realistic dropped-off counts
- Filterable by state/city

---

# **5.5 Management Onboarding**

### **Purpose**

Allow management to onboard distributors with full compliance requirements.

### **Required Fields**

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
- Blue action buttons with border
- Full audit logging of all actions

---

# **5.7 Profile Management**

### **Purpose**

Hierarchy visibility: Distributor → Retailer → Customer

### **Elements**

- KYC Status
- Activity timeline
- Total GMV
- Success rate
- Dispute history
- Fraud risk score
- Mapped hierarchy

### **Acceptance Criteria**

- No PII beyond masked values
- All subordinate relationships accurate
- All actions logged

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

### **Acceptance Criteria**

- No missing columns
- Column widths always readable
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
- PG/MDR fees
- Payouts
- Discrepancy handling
- T+1/T+2 status
- Bank reference number

### **Acceptance Criteria**

- All settlement numbers match ledger
- Reconciliation section must exist

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

### **Production Logic**

- Auto-assign to analyst
- SLA timer
- Chargeback sync with card network (when integrated)

### **Acceptance Criteria**

- Resolve action hidden if dispute already rejected
- Audit log mandatory

---

# **5.12 Credit Card Approvals**

### **Production Rules**

- Validate card scheme rules
- Validate BIN blocks
- Validate customer-does-not-own-multiple-high-risk-cards

### **Acceptance Criteria**

- Indian card format validations
- Submission date in Indian format

---

# **5.13 Settings & Access Control**

### **Includes**

- Profile settings
- Password update
- MFA toggle
- Access logs
- Notification preferences

### **RBAC**

- Strict permission mapping for every route/screen/action

---

# **5.14 Audit Logs**

### **Capture**

- Actions
- Actor
- Timestamp
- Payload delta
- IP / Device
- Module

### **Must be immutable.**

---

# **5.15 Alerts & Notifications**

### **Triggers**

- High-risk transactions
- Fraud rules
- KYC failures
- Operational delays
- Settlement delays

### **Delivery**

- In-app
- Email
- (Future) Webhooks

---

# **6. Non-Functional Requirements (NFRs)**

### **6.1 Performance**

- Dashboard < 2 seconds load
- API responses < 300 ms
- Table pagination < 200 ms

### **6.2 Security**

- PCI DSS compliant
- Aadhaar masked
- PAN masked
- Full encryption at rest
- JWT + MFA support

### **6.3 Scalability**

- Support 1–5M transactions/day
- Horizontal scale for dashboards
- Caching for metrics

### **6.4 Accuracy**

- All financial numbers match ledger
- IST timezone everywhere
- No floating-point errors (use integer paise)

### **6.5 Reliability**

- 99.9% uptime
- Graceful fallback if risk or KYC service fails

### **6.6 Logging & Monitoring**

- Structured logs
- Error tracking
- Audit logs immutable
- Alerting for anomalies

---

# **7. Acceptance Criteria (Entire Management System)**

- All dashboards accurate to backend data
- Risk decisions logged
- Commission engine consistent
- Settlement numbers reconcile
- No unmasked sensitive fields
- UI responsive across devices
- Strict RBAC enforcement
- All actions auditable
- No broken flows

---
