<div align="center">
  <a href="https://hsclogic.com">
    <img src="src/assets/logo.png" alt="HSClogic Logo" width="80" />
  </a>
  <h1>HSClogic Finance Management System</h1>
  <p>A production-grade financial operations frontend built for HSClogic Pvt. Ltd.</p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
  ![License](https://img.shields.io/badge/License-Private-red?style=flat-square)
</div>

---

## Overview

The **HSClogic Finance Management System (FMS)** is a fully responsive, dark-themed web application designed to manage the core financial operations of HSClogic — including invoice generation, employee salary structures, and monthly payroll processing.

This project was developed as a technical internship assignment, implementing all functional requirements defined in the provided SRS and FRS documentation. The implementation covers the complete frontend/UI layer with mock data, structured for seamless backend integration in future phases.

---

## Features

### Dashboard
- Financial summary cards — total revenue, invoice counts, overdue alerts
- Revenue vs Payroll trend chart (6-month area chart)
- Invoice status distribution (donut chart)
- Recent invoice activity feed
- Payroll summary with per-employee breakdown

### Invoice Management
- Full CRUD — create, view, edit, delete invoices
- Dynamic line item rows with real-time auto-calculation
- Invoice status lifecycle — Draft → Sent → Paid → Overdue
- Search by client name or invoice number
- Filter by status with live count badges
- Form validation with clear error messages
- Confirmation dialog before deletion
- PDF export for each invoice

### Employee Management
- Employee records with full profile fields
- Auto-generated employee IDs
- Active / Inactive status management
- Search and department filtering

### Salary Management
- Per-employee salary structure definition
- Multiple allowance and deduction components
- Auto-calculated net salary
