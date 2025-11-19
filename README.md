---
# **Business Requirements Document (BRD)

Management Application – Card-to-Cash Platform**
---

## **1. Purpose**

The Management Application enables administrators to oversee the entire Card-to-Cash ecosystem: onboarding, approvals, transactions, commissions, risk, finance, disputes, and user profiles. It acts as the central control system for operational, financial, and compliance oversight.

---

## **2. In-Scope Modules**

1. **Executive Dashboard**
2. **Finance Dashboard**
3. **Risk & Control Dashboard**
4. **Operations Dashboard**
5. **Management Onboarding**
6. **Onboarding Approvals (Retailers + Customers)**
7. **Profile Management**
8. **Commission Management**
9. **Transaction Report & Transaction Management**
10. **Disputes Management**
11. **Credit Card Approvals**
12. **Settings**

---

## **3. Out of Scope**

- Actual money movement
- Real KYC verification
- Card validation against banks/networks
- Production payment gateway logic
- Backend flows
- Automated decision-making (manual review only)
- Customer-facing applications (Retailer/Distributor/Customer dashboards)

---

# **4. Screen-by-Screen Business Requirements**

---

# **4.1 Executive Dashboard**

### **Goal**

Provide high-level overview of business performance, revenue, transactions, GMV, success rate, disputes, and risk indicators.

### **Components**

- KPI Cards: GMV, Total Transactions, Net Revenue, Management Commission, Dispute Rate, Success Rate, Chargeback-prone Users
- Date Range Filters
- GMV Trend
- Transactions Trend
- GMV by Card Network
- Net Revenue vs Commission
- Disputes Trend
- Top Contributors Table
- Alerts Summary

### **Acceptance Criteria**

- All KPIs update based on filters
- Charts update smoothly
- Data is dummy but realistic
- No PII beyond allowed masked fields

---

# **4.2 Finance Dashboard**

### **Goal**

Monitor revenue, GMV, margins, commissions, profitability, and revenue contribution by partners.

### **Key Features**

- KPI Cards

  - Gross Merchandise Value
  - Total Transactions
  - Net Revenue
  - Management Commission
  - Yield

- GMV Trend
- Net Revenue Trend
- GMV by Card Network (X = GMV, Y = Network)
- Net Revenue vs Commission
- Top Contributors Table

  - Must show **Net Revenue before Management Commission**
  - Management Commission must always be **slightly less** than Net Revenue

### **Acceptance Criteria**

- Revenue numbers realistic (yield 0.5%–3%)
- Management commission 70–90% of Net Revenue
- GMV scaling must reflect proper revenue logic

---

# **4.3 Risk & Control Dashboard**

### **Goal**

Enable risk teams to monitor fraud signals, suspicious activity, disputes, risky users, and alert patterns.

### **Components**

- KPI Cards:

  - Overall Risk Score
  - High-Risk Transactions
  - Dispute Rate
  - Chargeback Ratio

- Risk Trend Chart
- High-Risk by Reason Chart
- Risk Alerts Panel
- High-Risk Customers Table
- High-Risk Partners Table
- Optional: KYC Issues, Rule Trigger Summary

### **Acceptance Criteria**

- All alerts show severity + timestamp
- High-risk entities sorted by risk score
- Risk score must be deterministic from dummy logic

---

# **4.4 Operations Dashboard**

### **Goal**

Monitor onboarding throughput, pending approvals, bottlenecks, and operational workload.

### **Core KPIs**

- Pending Retailers
- Pending Customers
- Total Approved Retailers
- Total Approved Customers
- Onboarding Funnel Completion Rate
- Average Approval Time

### **Charts**

- Retailer Onboarding Trend
- Customer Onboarding Trend
- Overall Funnel Drop-off Chart

### **Removed Components**

- Retailers Awaiting Approval Table
- Customers Awaiting Approval Table
- Card Approvals Queue Table

### **Acceptance Criteria**

- All charts reflect dummy onboarding flows
- No leftover empty grid space after table removal

---

# **4.5 Management Onboarding**

### **Goal**

Enable management to onboard distributors.

### **Fields Collected**

- Name
- Phone
- Email
- Aadhaar (masked)
- PAN (masked)
- Company Name
- City
- Address
- Documents (dummy placeholders)

### **Actions**

- View Profile
- Approve
- Reject
- Suspend
- Edit Details
- Search + Clear
- Pagination
- Cursor pointer on all actionable items

### **Acceptance Criteria**

- No checkbox column
- Actions must visibly highlight (pointer cursor)
- Consistent blue action buttons

---

# **4.6 Onboarding Approvals**

### **Goal**

Approve or reject onboarded retailers and customers.

### **Tabs**

- Retailers

  - Pending
  - Submitted

- Customers

  - Pending
  - Submitted

### **Data Rules**

- Pending = started onboarding but not completed
- Submitted = completed onboarding
- KYC Status for submitted = **Verified**
- Retailers Submitted must have dummy Indian data
- Customers Pending + Submitted must have dummy Indian data

### **Cards (always 4 in one row)**

- Pending Retailers
- Retailers Awaiting Approval
- Pending Customers
- Customers Awaiting Approval

### **Actions**

- View (Blue button)
- Review (Blue button)
- Cursor pointer on all tabs and action buttons

### **Acceptance Criteria**

- Table correctly shows new data
- View/Review always blue with border
- KYC Verified in submitted state

---

# **4.7 Profile Management**

### **Goal**

View and manage distributor, retailer, and customer profiles.

### **Features**

- Profile Table (no checkboxes)
- Distributor → Retailers → Customers hierarchy
- KYC status
- Filters: distributor, retailer, city
- Search by name/phone/email
- View details modal

### **Acceptance Criteria**

- Clean hierarchical listing
- Column alignment correct after checkbox removal

---

# **4.8 Commission Management**

### **Goal**

Set and manage commission rules for distributors and retailers.

### **Types of Commissions**

- Per Transaction
- Volume-Based (tiered)
- Distributor override
- Retailer override
- Minimum and maximum caps

### **Actions**

- Add Rule
- Edit Rule
- Disable Rule
- Review Applied Rule
- Preview commission applied on sample transaction

### **Acceptance Criteria**

- Dummy rules must match realistic fintech ranges
- Tier logic deterministic and error-free

---

# **4.9 Transactions Report & Management**

### **Goal**

View, filter, export, and analyze transactions.

### **Features**

- Date Range
- Card Network Filter
- Transaction Status Filter
- Search (transaction ID, phone, name)
- CSV Export
- Horizontal scroll (x-scroll) if needed
- Column width adjustments so titles are fully visible
- Table without top summary cards
- No checkbox column

### **Actions**

- View Transaction
- Download (dummy) receipt

### **Acceptance Criteria**

- All columns readable
- Scroll appears only when needed
- Filters + table have no gap between them

---

# **4.10 Disputes Management**

### **Goal**

Handle disputes raised by customers.

### **Statuses**

- Pending
- Processing
- Resolved
- Rejected

### **Components**

- KPI Cards (Pending = Blue background)
- Disputes Table
- Filters
- Search + Clear
- View Modal

  - Actions: Process, Resolve, Reject
  - **Do NOT show Resolve if dispute is rejected**
  - Cursor pointer on all actions and close button

### **Table Rules**

- Customer column width: 180px
- Action column width: 100px
- Remove phone & email from customer column
- Last Updated = DD/MM/YYYY only (no time)
- No x-scroll (adjust spacing to avoid overflow)
- View button left-aligned + blue button + eye icon

### **Acceptance Criteria**

- Table clean and readable
- All status filters functional
- Correct conditional visibility of Resolve button

---

# **4.11 Credit Card Approvals**

### **Goal**

Validate customer credit cards and approve/reject them.

### **Features**

- Card list
- Customer info
- Submitted timestamp (Indian format)
- View → Approve / Reject
- Moves from awaiting approval → approved list

### **Acceptance Criteria**

- Only customers have these approvals
- Retailers/Distributors do not have card approvals

---

# **4.12 Settings**

### **Goal**

Allow management to update their own profile and preferences.

### **Sections**

- Personal Info
- Contact Info
- Role
- Permissions (read-only for demo)
- Change Password
- Application Preferences

### **Acceptance Criteria**

- Settings save state locally in demo mode
- No backend calls

---

# **5. Non-Functional Requirements**

### **5.1 Performance**

- Page load < 2 seconds
- Filters update KPIs/charts < 300ms

### **5.2 Security**

- Only admin roles can access the Management app
- No unmasked Aadhaar/PAN
- No real card numbers stored

### **5.3 Design Consistency**

- Blue button variant for all actions
- Same spacing across all modules
- Consistent card layout across dashboards

### **5.4 Accessibility**

- All clickable elements must show a cursor pointer
- Text must be readable on both light mode and dark mode

### **5.5 Data**

- Dummy Indian region data used everywhere
- Dates in **DD/MM/YYYY**

---

# **6. Acceptance for Entire Management Application**

- Each module behaves according to the BRD
- All dummy data realistic and region-correct
- UI stays consistent across screens
- No broken layouts, no missing spacing
- Navigation correct, with side menu sections:

  - Executive Dashboard
  - Finance
  - Risk & Control
  - Operations
  - Management Onboarding
  - Onboarding Approvals
  - Profile Management
  - Commissions
  - Transactions
  - Disputes
  - Card Approvals
  - Settings

---
