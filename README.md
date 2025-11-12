# Card-to-Cash Management Platform

A comprehensive UI-only demo for managing a Card-to-Cash financial services platform built with Next.js, TypeScript, and TailwindCSS.

## Features

### 🎯 Core Pages

1. **Dashboard** - KPIs, top distributors, time-series charts, and insights
2. **Management Onboarding** - Create and manage distributors
3. **Onboarding Approval** - Review and approve retailer/customer applications
4. **Profile Management** - 3-level hierarchical view (Distributors → Retailers → Customers)
5. **Commission Management** - Create commission rules with tier system and simulator
6. **Transactions** - Comprehensive transaction management with filters and bulk actions
7. **Disputes** - Manage transaction disputes with timeline and resolution workflows
8. **Credit Card Approvals** - Review credit limit requests with risk assessment
9. **Settings** - User profile and application preferences

### 🎨 UI Components

- **Layout**: Responsive TopBar and collapsible SideNav
- **Data Display**: DataTable with search, sort, filter, pagination, and CSV export
- **Charts**: AreaSpark, BarMini, and LineSeries using Recharts
- **Forms**: Input, Select, Button, Modal, Tabs
- **Feedback**: Toast notifications, Badge, Card components

### 📊 Data & State

- **Deterministic seed data**: 8 distributors, 24 retailers, 120 customers, 600 transactions
- **In-memory state management**: All changes stored locally
- **LocalStorage integration**: Preferences and user data persist across sessions
- **Relational integrity**: All IDs properly linked across entities

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with CSS variables
- **Icons**: lucide-react
- **Charts**: Recharts
- **State**: React hooks + LocalStorage

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx          # Header with branding and actions
│   │   └── SideNav.tsx         # Responsive navigation sidebar
│   ├── ui/
│   │   ├── Card.tsx            # Stat card with variants
│   │   ├── Badge.tsx           # Status badge component
│   │   ├── Button.tsx          # Button with icon support
│   │   ├── Input.tsx           # Labeled input with validation
│   │   ├── Select.tsx          # Dropdown select component
│   │   ├── Tabs.tsx            # Accessible tab component
│   │   ├── Modal.tsx           # Modal with focus trap
│   │   ├── Toast.tsx           # Toast notification system
│   │   └── DataTable.tsx       # Full-featured data table
│   └── charts/
│       ├── AreaSpark.tsx       # Sparkline with trend indicator
│       ├── BarMini.tsx         # Horizontal bar chart
│       └── LineSeries.tsx      # Time-series line chart
├── page.tsx                    # Dashboard
├── management-onboarding/page.tsx
├── onboarding-approval/page.tsx
├── profile-management/page.tsx
├── commission-management/page.tsx
├── transactions/page.tsx
├── disputes/page.tsx
├── credit-card-approvals/page.tsx
├── settings/page.tsx
├── layout.tsx                  # Root layout with providers
└── globals.css                 # CSS variables and theme

lib/
├── types.ts                    # TypeScript type definitions
├── data.ts                     # Seed data with relational integrity
├── format.ts                   # Currency, date, number formatters
├── filters.ts                  # Filter and sort utilities
├── pagination.ts               # Pagination helpers
└── store.ts                    # In-memory state management
```

## CSS Variables

The application uses CSS variables for theming with automatic dark mode support:

- `--background`, `--foreground`: Main colors
- `--text-color`, `--muted`, `--muted-foreground`: Text colors
- `--card-bg`, `--input-bg`, `--border`: Component backgrounds
- `--success-bg/text/border`: Success states
- `--warning-bg/text/border`: Warning states
- `--danger-bg/text/border`: Error/danger states
- `--info-bg/text/border`: Info states

## Key Features

### DataTable Component
- **Search**: Text search across multiple fields
- **Sort**: Click column headers to sort
- **Filter**: Faceted filters (status, region, brand, etc.)
- **Pagination**: Adjustable page size with navigation
- **CSV Export**: Download current view as CSV

### Charts
- **AreaSpark**: Inline sparkline with trend percentage
- **BarMini**: Horizontal bars for top contributors
- **LineSeries**: Time-series with toggleable date ranges (30/90 days)
- All charts use CSS variables for theming

### Filters & Search
- **Date Range**: Start/end date pickers
- **Entity Filters**: Filter by distributor, retailer, customer
- **Status Filters**: Filter by transaction/dispute/approval status
- **Card Brand**: Filter by VISA, MASTERCARD, AMEX, RUPAY
- **URL Params**: Filters sync with URL for shareable links

### State Management
- **useStore**: Central hook for all data with update methods
- **usePreferences**: User preferences in localStorage
- **useManagementUser**: Current user profile in localStorage
- All mutations update in-memory state and trigger re-renders

## Data Model

### Entities
- **Distributor**: Regional partners with commission rules
- **Retailer**: Linked to distributors, serve customers
- **Customer**: End users with card information
- **Transaction**: Card-to-cash conversion records
- **Dispute**: Transaction dispute records
- **CreditCardApproval**: Credit limit requests
- **CommissionRule**: Tiered commission structures

### Relationships
```
Distributor (1) → (*) Retailer (1) → (*) Customer (1) → (*) Transaction
                                                         └→ (*) Dispute
CommissionRule → Distributor (optional specific assignment)
CreditCardApproval → Customer
```

## Accessibility

- Keyboard navigation throughout
- ARIA labels and roles
- Focus management in modals
- Proper heading hierarchy
- Color contrast ratios meet WCAG AA

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- No Internet Explorer support
- Responsive design: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)

## Development

### Adding a New Page

1. Create page file: `app/my-page/page.tsx`
2. Add route to `SideNav.tsx`
3. Use existing components and hooks
4. Follow established patterns for filters and state

### Adding a New Component

1. Create component in `app/components/ui/`
2. Use TypeScript for props
3. Apply CSS variables for theming
4. Export from component file

### Modifying Data

Edit `lib/data.ts` to adjust seed data. Maintain relational integrity by ensuring all IDs reference valid entities.

## Limitations

- **No Backend**: All data is client-side only
- **No Persistence**: Data resets on page refresh (except localStorage preferences)
- **No Authentication**: Single demo user
- **No Real API Calls**: All operations are local state mutations

## Production Checklist

If adapting for production:

- [ ] Add authentication/authorization
- [ ] Integrate real API endpoints
- [ ] Add data persistence (database)
- [ ] Implement server-side validation
- [ ] Add error boundaries
- [ ] Set up monitoring and logging
- [ ] Add comprehensive testing
- [ ] Implement proper security measures
- [ ] Add rate limiting and protection
- [ ] Set up CI/CD pipeline

## License

This is a demo project. Adapt as needed for your use case.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
