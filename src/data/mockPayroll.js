const EMP_ALLOWANCES = {
  "EMP-001": [{ name: "Transport Allowance", amount: 8000 }, { name: "Meal Allowance", amount: 5000 }],
  "EMP-002": [{ name: "Transport Allowance", amount: 8000 }, { name: "Meal Allowance", amount: 5000 }],
  "EMP-003": [{ name: "Transport Allowance", amount: 6000 }, { name: "Meal Allowance", amount: 4000 }],
  "EMP-004": [{ name: "Transport Allowance", amount: 8000 }, { name: "Meal Allowance", amount: 5000 }, { name: "Professional Allowance", amount: 10000 }],
};
const EMP_DEDUCTIONS = {
  "EMP-001": [{ name: "EPF (8%)", amount: 9600 }, { name: "ETF (3%)", amount: 3600 }],
  "EMP-002": [{ name: "EPF (8%)", amount: 7600 }, { name: "ETF (3%)", amount: 2850 }],
  "EMP-003": [{ name: "EPF (8%)", amount: 6000 }, { name: "ETF (3%)", amount: 2250 }],
  "EMP-004": [{ name: "EPF (8%)", amount: 8800 }, { name: "ETF (3%)", amount: 3300 }],
};
const EMP_DESIGNATIONS = {
  "EMP-001": "Senior Software Engineer",
  "EMP-002": "UI/UX Designer",
  "EMP-003": "3D Print Technician",
  "EMP-004": "Finance Manager",
};
const EMP_DEPARTMENTS = {
  "EMP-001": "Engineering",
  "EMP-002": "Design",
  "EMP-003": "Production",
  "EMP-004": "Finance",
};

const makeRecord = (id, name, basic, allowances, deductions, net) => ({
  employeeId: id,
  employeeName: name,
  designation: EMP_DESIGNATIONS[id],
  department: EMP_DEPARTMENTS[id],
  basic,
  allowances,
  deductions,
  net,
  allowanceDetails: EMP_ALLOWANCES[id],
  deductionDetails: EMP_DEDUCTIONS[id],
});

export const mockPayroll = [
  {
    id: "PAY-2026-03",
    period: "March 2026",
    month: 3,
    year: 2026,
    status: "Finalized",
    processedDate: "2026-03-31",
    totalPayout: 512000,
    employeeCount: 4,
    records: [
      makeRecord("EMP-001", "Ashan Perera",      120000, 13000, 13200, 119800),
      makeRecord("EMP-002", "Nimasha Fernando",  95000,  13000, 10450, 97550),
      makeRecord("EMP-003", "Kasun Jayawardena", 75000,  10000, 8250,  76750),
      makeRecord("EMP-004", "Dilani Rathnayake", 110000, 23000, 12100, 120900),
    ],
  },
  {
    id: "PAY-2026-02",
    period: "February 2026",
    month: 2,
    year: 2026,
    status: "Finalized",
    processedDate: "2026-02-28",
    totalPayout: 508000,
    employeeCount: 4,
    records: [
      makeRecord("EMP-001", "Ashan Perera",      120000, 13000, 13200, 119800),
      makeRecord("EMP-002", "Nimasha Fernando",  95000,  13000, 10450, 97550),
      makeRecord("EMP-003", "Kasun Jayawardena", 75000,  10000, 8250,  76750),
      makeRecord("EMP-004", "Dilani Rathnayake", 110000, 23000, 12100, 120900),
    ],
  },
  {
    id: "PAY-2026-01",
    period: "January 2026",
    month: 1,
    year: 2026,
    status: "Finalized",
    processedDate: "2026-01-31",
    totalPayout: 508000,
    employeeCount: 4,
    records: [
      makeRecord("EMP-001", "Ashan Perera",      120000, 13000, 13200, 119800),
      makeRecord("EMP-002", "Nimasha Fernando",  95000,  13000, 10450, 97550),
      makeRecord("EMP-003", "Kasun Jayawardena", 75000,  10000, 8250,  76750),
      makeRecord("EMP-004", "Dilani Rathnayake", 110000, 23000, 12100, 120900),
    ],
  },
];