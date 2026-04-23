# HSClogic Finance Management System (FMS)

## Project Overview

HSClogic FMS is a web-based Finance Management System developed for HSClogic, a technology and consultancy company offering software development and 3D printing services. The system centralises and automates core financial operations including invoice management, employee records, salary structure definition, and monthly payroll processing. It replaces manual, fragmented workflows with a unified, role-aware digital platform accessible from both desktop and mobile devices.

---

## Table of Contents

1. [Project Objectives](#1-project-objectives)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Functional Modules](#4-functional-modules)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [User Interface Design](#6-user-interface-design)
7. [PDF Generation](#7-pdf-generation)
8. [Data Management](#8-data-management)
9. [Key Business Rules and Validations](#9-key-business-rules-and-validations)
10. [Project Structure](#10-project-structure)
11. [Setup and Running the Project](#11-setup-and-running-the-project)
12. [Demo Accounts](#12-demo-accounts)
13. [Known Limitations and Future Enhancements](#13-known-limitations-and-future-enhancements)

---

## 1. Project Objectives

- Provide a single platform for managing invoices, employees, salary structures, and payroll
- Enforce strict role-based access so each user type (Admin, Finance Manager, Employee) sees only what is relevant to them
- Automate payroll calculation from salary structures to reduce manual arithmetic errors
- Generate professional, branded PDF documents (invoices, payslips, payroll reports, salary reports) at the click of a button
- Deliver a fully responsive UI that works on mobile phones (375px and above) as well as desktop browsers
- Automatically detect and flag overdue invoices without requiring manual intervention

---

## 2. System Architecture

HSClogic FMS is a single-page application (SPA) built entirely on the frontend. There is no backend server or database in the current implementation; all state is managed in-memory using React Context API and seeded from static mock data files. `localStorage` is used to persist the authenticated user session across page reloads.

```
Browser (SPA)
│
├── React Router v7          — Client-side routing with protected and role-guarded routes
│
├── React Context Stores
│   ├── AuthContext           — User session, login/logout, role permission checks
│   ├── InvoiceContext        — Invoice CRUD + live overdue detection via useMemo
│   ├── EmployeeContext       — Employee CRUD + salary structure management
│   ├── PayrollContext        — Payroll processing, finalization, deletion
│   └── ThemeContext          — Light/dark mode toggle
│
├── Feature Pages
│   ├── DashboardPage         — Role-branched: management view vs employee personal view
│   ├── InvoicesPage          — Full invoice lifecycle management
│   ├── EmployeesPage         — Employee directory and profile management
│   ├── SalaryPage            — Salary structure editor and report
│   ├── PayrollPage           — Monthly payroll processing and payslip viewer
│   └── LoginPage             — Credential-based authentication
│
├── Shared UI Components
│   └── Card, Modal, Badge, Button, Input, ConfirmDialog, Layout, Sidebar, Topbar
│
└── Utility Layer
    ├── formatters.js          — formatCurrency (LKR), formatDate
    ├── calculations.js        — calcLineTotal, calcInvoiceTotal, calcNetSalary, isOverdue
    └── pdfGenerator.js        — generateInvoicePDF, generatePayslipPDF, generateSalaryReportPDF
```

### State Management Pattern

Each domain (invoices, employees, payroll) has its own Context Provider that encapsulates the initial seeded state, all CRUD operations exposed to consumer components, and derived computed state (such as overdue invoice detection using `useMemo`).

---

## 3. Technology Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.4 |
| Build Tool | Vite | 8.0.4 |
| Routing | React Router DOM | 7.14.1 |
| Styling | Tailwind CSS | 3.4.19 |
| Charts | Recharts | 3.8.1 |
| PDF Generation | jsPDF | 4.2.1 |
| HTML-to-Canvas | html2canvas | 1.4.1 |
| Icons | Lucide React | 1.8.0 |
| Notifications | React Hot Toast | 2.6.0 |
| Form Utilities | React Hook Form | 7.72.1 |
| Language | JavaScript (ESM) | ES2022 |
| CSS Post-processing | PostCSS + Autoprefixer | 8.5 / 10.5 |
| Linting | ESLint | 9.39.4 |

### Technology Justifications

**React 19 + Vite 8** — The fastest local development server available, ES module-native bundling, and minimal configuration overhead. Vite's hot module replacement makes UI iteration nearly instant.

**Tailwind CSS 3** — Utility-first classes combined with CSS custom property theming enable full light/dark mode without any JavaScript overhead or additional style sheets.

**React Router 7** — Nested route layouts allow the sidebar and topbar shell to wrap all authenticated pages through a single `Layout` route, eliminating duplication.

**Recharts** — Composable, SVG-based charts that integrate naturally with React state and re-render automatically when context data changes.

**jsPDF** — Runs entirely in the browser with no server round-trip required for document generation. All four PDF types (invoice, payslip, payroll report, salary report) are produced client-side.

---

## 4. Functional Modules

### 4.1 Authentication

- Email and password login validated against a mock user store
- Session persisted to `localStorage` so it survives page refresh
- Automatic redirect to `/login` for unauthenticated route access
- Automatic redirect to `/dashboard` if already authenticated and visiting `/login`
- Inline login error display

### 4.2 Dashboard

The dashboard renders a completely different view depending on the logged-in user's role.

**Admin and Finance Manager view:**

- Total Revenue derived from all paid invoices
- Invoice summary showing total count, paid count, pending count, and overdue count
- Overdue count with contextual attention indicator
- Active employee count relative to total headcount
- Total salary disbursed across all finalized payrolls
- Number of employees included in the latest payroll run
- Count of payroll records awaiting finalization
- Revenue vs Payroll area chart covering the last 6 months, populated from live context data
- Invoice status distribution pie/donut chart
- Recent invoices table (latest 5)
- Latest payroll card with per-employee net pay breakdown

**Employee view (role-specific personal dashboard):**

- Personal profile card showing name, designation, department, employee ID, and join date
- Four summary stats: latest net pay, gross earnings for latest period, deductions for latest period, and total earned across all payrolls
- Earnings history area chart (net vs gross pay) for the last 6 months of the employee's own payroll records
- Latest payslip card with full itemised breakdown: basic salary, each named allowance, each named deduction, and net pay
- Complete payroll history table showing every finalized period: gross, deductions, net, and status

### 4.3 Invoice Management

- Create invoices with: client name, service type (Software / 3D Printing / Others), issue date, due date, line items, and notes
- Line items: description, quantity, unit price — line total and invoice total are auto-calculated in real time
- Invoice numbering via auto-generated sequential identifiers (e.g. `INV-001`)
- Status lifecycle: Draft → Sent → Paid → Overdue
- Overdue detection is automatic — any invoice in Draft or Sent status whose due date has passed is flagged as Overdue on every render via a `useMemo` derived value in `InvoiceContext`, requiring no manual step
- Status change popover: click the status badge in the table row to change it inline without opening a modal
- Invoice duplication: creates a new Draft invoice pre-populated with the same line items as the selected invoice
- Bulk PDF export: exports all currently filtered invoices as individual PDF files sequentially
- Search by client name or invoice number
- Filter by status (All / Draft / Sent / Paid / Overdue)
- Finance Manager access: can view all invoices and export PDFs but cannot create, edit, duplicate, delete, or change invoice status

### 4.4 Employee Management

- Full employee record fields: full name, auto-generated employee ID, designation (free-text with datalist suggestions), department (dropdown from predefined list), date of joining, email, phone, and status
- Activate and Deactivate employees — soft deletion that retains all records
- Search by name, employee ID, or designation
- Filter by status (All / Active / Inactive)
- Dual view modes: table view for dense data scanning, card grid view for profile-style browsing
- CSV export of the current filtered employee list
- Admin-only actions: Add Employee, Edit Employee, Activate/Deactivate

### 4.5 Salary Structures

- Per-employee salary structure: basic salary + multiple named allowances + multiple named deductions
- Net salary formula: **Net = Basic + Sum(Allowances) − Sum(Deductions)**
- Allowances and deductions are individually named (examples: "Transport Allowance", "Meal Allowance", "EPF (8%)", "ETF (3%)")
- Salary changes do not retroactively affect processed payroll records — each payroll run takes a snapshot of the current salary structure at the time of processing
- Active employee detail cards show the full breakdown itemised with individual component values
- Salary structure report PDF exportable as a full summary of all employees with department, basic, allowances, deductions, and net columns

### 4.6 Payroll Processing

- Monthly payroll run: Admin selects month and year, system processes all active employees using their current salary structures
- System prevents duplicate payroll runs for a month/year combination that already has a record
- Payroll status lifecycle: Pending → Finalized
- Finalization permanently locks the payroll record — it cannot be edited or deleted after finalization
- Per-payroll detail modal showing employee-level breakdown of basic, allowances, deductions, and net pay
- Payroll report PDF covering all employees in the run with a total payout summary row
- Individual payslip PDF per employee with fully itemised earnings and deductions
- Payroll history filterable by year
- Employee role restriction: employees can only see finalized payrolls that contain their own record; other employees' data is never exposed
- Admin can delete Pending payroll records; Finalized records are protected from deletion

---

## 5. Role-Based Access Control

### Permission Matrix

| Feature | Admin | Finance Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard — management view | Yes | Yes | No |
| Dashboard — personal payslip view | No | No | Yes |
| View Invoices | Yes | Yes | No |
| Create / Edit / Delete Invoices | Yes | Yes | No |
| Change Invoice Status | Yes | Yes | No |
| Export Invoice PDF | Yes | Yes | No |
| View All Employees | Yes | No | No |
| Add / Edit Employees | Yes | No | No |
| Activate / Deactivate Employees | Yes | No | No |
| View Salary Structures | Yes | No | No |
| Edit Salary Structures | Yes | No | No |
| Export Salary Report PDF | Yes | No | No |
| View All Payroll Records | Yes | Yes | No |
| View Own Payroll Records Only | Yes | Yes | Yes |
| Process Monthly Payroll | Yes | No | No |
| Finalize Payroll | Yes | No | No |
| Delete Pending Payroll | Yes | No | No |
| Download Own Payslip PDF | Yes | Yes | Yes |
| Download Payroll Report PDF | Yes | Yes | No |

### Enforcement Architecture

Access control is enforced at two independent layers to ensure security even when URLs are typed directly:

**Route level** — The `RoleRoute` component in `AppRouter.jsx` wraps each sensitive route. It checks `user.role` against the allowed roles array and issues a `<Navigate to="/dashboard" replace />` for any unauthorized access attempt, regardless of how the user reached the URL.

**UI level** — The `can(action)` function from `AuthContext` returns a boolean based on a permission map for each role. Individual buttons, form submissions, action menus, and data sections are wrapped in conditional rendering (`{canManage && <button>...}`) so that even if a component renders, the write actions are not exposed to unauthorized roles.

---

## 6. User Interface Design

### Design System

The UI uses a custom Tailwind CSS theme built on CSS custom properties, enabling seamless light and dark mode switching with a single class toggle on the root element:

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--bg` | #f8f9fb | #0d0f14 | Page background |
| `--surface` | #ffffff | #13161e | Card and panel background |
| `--raised` | #f1f3f7 | #1a1d27 | Elevated element background |
| `--border` | #e5e7eb | #252836 | All border colours |
| `--text` | #111827 | #e8eaf0 | Primary text colour |
| `--sub` | #6b7280 | #7a8195 | Secondary and muted text |
| `--green` | #16a34a | #00cc44 | Brand accent, success states |
| `--red` | #dc2626 | #e53935 | Error, danger, deduction values |

### Responsive Design Strategy

The application is fully responsive from 375px (iPhone SE) and wider.

**Sidebar navigation** — Fixed 224px drawer on desktop (md breakpoint and above). On mobile it is translated off-screen by default and slides in when the hamburger button in the topbar is tapped. A semi-transparent backdrop overlay dismisses it on tap outside. All navigation links call the `onClose` handler so the drawer closes automatically after navigating.

**Modal dialogs** — Standard centered dialog with rounded corners on desktop. On mobile the modal slides up from the bottom as a bottom sheet with a visual drag handle bar at the top, matching native mobile UI conventions.

**Data tables** — All tables are wrapped in `overflow-x-auto` containers with explicit `min-w` values to allow horizontal scrolling on small screens. Less important columns (such as Service Type, Issue Date, Email, Designation) are hidden progressively using `hidden sm:table-cell` and `hidden md:table-cell` classes, keeping the most critical data always visible.

**Stat card grids** — Use `grid-cols-2 md:grid-cols-4` so they arrange as a 2×2 grid on mobile and a single horizontal row on desktop.

**Toolbars** — Search inputs are full-width on their own row. Filter selects and action buttons wrap below in a `flex-wrap` row, ensuring they never overflow on narrow screens.

### Theme Toggle

Light and dark themes can be switched at any time via the button in the topbar when authenticated, or in the top-right corner of the login page. The preference is applied immediately via a class on the root `<html>` element.

---

## 7. PDF Generation

All PDFs are generated entirely in the browser using jsPDF. No server is involved. Four document types are produced:

### Invoice PDF

Filename: `INV-XXXX.pdf`

Contents: HSClogic branding with green accent header strip, client name and service type, invoice number and status, issue date and due date, line items table with quantity and unit price columns, auto-calculated line totals, subtotal row, tax row (0%), and total due highlighted in a green summary box. Notes section appended if present. Footer includes system name and generation date.

### Payslip PDF

Filename: `Payslip-EMP-XXX-Month-YYYY.pdf`

Contents: Employee name, designation, department, employee ID, and pay period header. Earnings section listing basic salary and each named allowance individually with a gross earnings subtotal. Deductions section listing each named deduction in red with a total deductions subtotal. Net salary displayed in a branded green highlight box showing the calculation formula (Gross − Deductions = Net).

### Payroll Report PDF

Filename: `Payroll-Month-YYYY.pdf`

Contents: Period, employee count, status, processed date, and total payout in a metadata block. Per-employee table rows showing basic, allowances (green), deductions (red in parentheses), and net pay. Total payout in a green summary footer row.

### Salary Structure Report PDF

Filename: `Salary-Report-YYYY-MM-DD.pdf`

Contents: Active employee count and total monthly payroll in a summary header. Per-employee table: department, basic, allowances (green), deductions (red), net pay. Total monthly payroll in a green footer row. Supports automatic page breaks for large employee lists.

---

## 8. Data Management

### Context Providers

| Context | File | Responsibilities |
|---|---|---|
| AuthContext | `src/context/AuthContext.jsx` | User session, login, logout, role-based permission checks via `can(action)` |
| InvoiceContext | `src/context/InvoiceContext.jsx` | Invoice CRUD, auto-overdue detection via `useMemo` derived state |
| EmployeeContext | `src/context/EmployeeContext.jsx` | Employee CRUD, salary structure updates, net salary calculation |
| PayrollContext | `src/context/PayrollContext.jsx` | Payroll processing, status finalization, deletion |
| ThemeContext | `src/context/ThemeContext.jsx` | Light/dark mode toggle with `localStorage` persistence |

### Mock Data

| File | Contents |
|---|---|
| `src/data/mockInvoices.js` | 10 seeded invoices across multiple clients, service types, and statuses |
| `src/data/mockEmployees.js` | 4 employees with full profiles and salary structures |
| `src/data/mockPayroll.js` | 3 finalized payroll runs (January–March 2026) with per-employee records including named allowance and deduction details |

### Automatic Overdue Detection

Invoice overdue status is not stored as a static value. `InvoiceContext` uses a `useMemo` derived state that re-evaluates on every render cycle:

```javascript
const invoicesWithOverdue = useMemo(() =>
  invoices.map(inv => ({
    ...inv,
    status: isOverdue(inv.dueDate, inv.status) ? "Overdue" : inv.status,
  })),
  [invoices]
);
```

`isOverdue` returns true when `dueDate < today` and the invoice status is not `"Paid"`. This means overdue status updates automatically as time passes with no manual intervention required.

### Salary Snapshot on Payroll Run

When payroll is processed, the system reads each active employee's current salary structure and stores a complete snapshot (basic, named allowances, named deductions, computed net) in the payroll record. Subsequent edits to salary structures do not alter historical payroll records, preserving audit integrity for past periods.

---

## 9. Key Business Rules and Validations

### Invoice Validations

- Client name is required and must not be blank
- Issue date is required
- Due date is required and must be on or after the issue date
- Each line item must have a non-empty description
- Quantity per line item must be greater than zero
- Unit price per line item must be zero or greater

### Employee Validations

- Full name, designation, department, date of joining, email, and phone are all required
- Email must match standard format (user@domain.tld)

### Salary Validations

- Basic salary must be greater than zero
- All allowance and deduction entries must have names and non-negative amounts

### Payroll Business Rules

- Cannot process payroll if there are no active employees
- Cannot run payroll for a month and year combination that already has an existing record
- Finalized payroll records cannot be edited or deleted under any circumstances
- Pending payroll records can be deleted by Admin only
- Employees can only view and download their own payslips — no cross-employee data is exposed

---

## 10. Project Structure

```
fms-hsclogic/
├── public/
├── src/
│   ├── assets/
│   │   └── logo.png                   HSClogic brand logo
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx             Root authenticated shell (sidebar + topbar + page outlet)
│   │   │   ├── Sidebar.jsx            Collapsible navigation drawer with role-filtered links
│   │   │   └── Topbar.jsx             Header with hamburger button, page title, theme toggle
│   │   └── ui/
│   │       ├── Badge.jsx              Status badge colour-coded by status string
│   │       ├── Button.jsx             Variant button (primary / secondary / ghost / danger)
│   │       ├── Card.jsx               Surface container with optional padding prop
│   │       ├── ConfirmDialog.jsx      Destructive-action confirmation modal
│   │       ├── Input.jsx              Labelled input field with error state display
│   │       └── Modal.jsx              Responsive modal (centered desktop, bottom-sheet mobile)
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── EmployeeContext.jsx
│   │   ├── InvoiceContext.jsx
│   │   ├── PayrollContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   ├── mockEmployees.js
│   │   ├── mockInvoices.js
│   │   └── mockPayroll.js
│   ├── features/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx      Branches by role: management view vs employee view
│   │   ├── employees/
│   │   │   └── EmployeesPage.jsx      Employee directory, profile view, add/edit (Admin only)
│   │   ├── invoices/
│   │   │   └── InvoicesPage.jsx       Invoice CRUD, status management, PDF export
│   │   ├── payroll/
│   │   │   └── PayrollPage.jsx        Payroll processing, finalization, payslip viewer
│   │   └── salary/
│   │       └── SalaryPage.jsx         Salary structure editor, report PDF export
│   ├── router/
│   │   └── AppRouter.jsx              Routes with ProtectedRoute, GuestRoute, RoleRoute guards
│   ├── utils/
│   │   ├── calculations.js            calcLineTotal, calcInvoiceTotal, calcNetSalary, isOverdue
│   │   ├── formatters.js              formatCurrency (LKR locale), formatDate
│   │   └── pdfGenerator.js            generateInvoicePDF, generatePayslipPDF, generateSalaryReportPDF
│   ├── App.jsx                        Root app with all context providers composed
│   ├── index.css                      Tailwind directives and CSS custom property theme tokens
│   └── main.jsx                       React DOM entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 11. Setup and Running the Project

### Prerequisites

- Node.js version 18 or higher
- npm version 9 or higher

### Installation

```bash
cd fms-hsclogic
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement. Changes to any source file reflect in the browser instantly.

### Production Build

```bash
npm run build
```

Output is placed in the `dist/` folder. The build completes with zero errors. A chunk size warning is shown for the jsPDF bundle — this is expected and non-blocking.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for final verification before deployment.

### Linting

```bash
npm run lint
```

---

## 12. Demo Accounts

Three pre-configured accounts are available on the login page. Clicking any account button auto-fills the credentials.

| Role | Email | Password | Access Summary |
|---|---|---|---|
| Admin | admin@hsclogic.com | admin123 | Full access to all modules and all data |
| Finance Manager | dilani.r@hsclogic.com | finance123 | Invoices (full CRUD), payroll viewing, own payslips |
| Employee | ashan.perera@hsclogic.com | emp123 | Personal dashboard only, own payslips |

### Pre-loaded Seed Data

**Invoices (10 records):** Clients include TechVision Lanka, EduSpark Institute, Bright Minds Academy, Robonautics Lab. Statuses cover Draft, Sent, Paid, and Overdue. Service types include Software, 3D Printing, and Others.

**Employees (4 records):**

| Employee ID | Name | Designation | Department |
|---|---|---|---|
| EMP-001 | Ashan Perera | Senior Software Engineer | Engineering |
| EMP-002 | Nimasha Fernando | UI/UX Designer | Design |
| EMP-003 | Kasun Jayawardena | 3D Print Technician | Production |
| EMP-004 | Dilani Rathnayake | Finance Manager | Finance |

**Payroll records (3 finalized runs):** January 2026, February 2026, March 2026 — each containing per-employee records with itemised allowances (Transport Allowance, Meal Allowance, Professional Allowance) and deductions (EPF 8%, ETF 3%).

---

## 13. Known Limitations and Future Enhancements

### Current Limitations

| Area | Detail |
|---|---|
| No backend or database | All data is in-memory and resets on page refresh (authenticated session is the only persistent state) |
| No real authentication security | Credentials are stored in a mock array in plain text — not suitable for a production deployment |
| No email or notification system | No automated reminders for overdue invoices or upcoming payroll processing dates |
| Single currency | All monetary values are in Sri Lankan Rupee (LKR) only |
| No audit log | Record changes are not tracked with timestamps or user attribution |
| Payroll filter | History is filterable by year only — no search by employee name within payroll records |

### Recommended Future Enhancements

**Backend integration** — A REST API or GraphQL backend with a relational database (PostgreSQL recommended) and JWT-based authentication with token refresh.

**Data persistence** — Replace in-memory mock state with real CRUD operations backed by a database, with optimistic UI updates and error handling.

**Email notifications** — Automated overdue invoice reminders to clients, payslip distribution to employees on payroll finalization, and payroll due-date alerts to admins.

**Tax calculations** — APIT (Advance Personal Income Tax) computation per employee based on Sri Lanka's annual income tax brackets, automatically applied during payroll processing.

**Leave management** — Integration with an approved leave record to prorate net pay for employees with unpaid leave days in the pay period.

**Partial invoice payments** — Record partial payments against invoices with payment date and remaining balance tracking.

**Audit trail** — Immutable log of all create, update, and delete operations with actor identity, timestamp, and before/after field values for compliance purposes.

**Multi-format exports** — CSV and Excel (XLSX) export options in addition to PDF for payroll and salary reports.

**Multi-company support** — Allow a single deployment to manage multiple entities under one admin account with entity-level data isolation.

---

## Summary

HSClogic FMS delivers a complete financial operations platform covering the full lifecycle from client invoicing through employee record management, salary structure configuration, and monthly payroll processing. The system enforces strict data boundaries between all three role types, generates professional branded PDF documents entirely on the client side, and presents a consistent, mobile-responsive interface from a 375px phone screen to a full desktop display. The architecture is deliberately frontend-only for this implementation phase, making it straightforward to demonstrate all functional requirements and extend with a real backend in a subsequent development phase.

---

*Document version: 1.0*
*Date: April 2026*
*Prepared by: Pehesara Munasinghe*
*System: HSClogic Finance Management System*
