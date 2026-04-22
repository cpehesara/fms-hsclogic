import { createContext, useContext, useState } from "react";
import { mockEmployees } from "../data/mockEmployees";
import { calcNetSalary } from "../utils/calculations";

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(mockEmployees);

  const getNextId = (current) => {
    const nums = current.map(e => parseInt(e.id.replace("EMP-", ""), 10));
    const max = nums.length ? Math.max(...nums) : 0;
    return `EMP-${String(max + 1).padStart(3, "0")}`;
  };

  const addEmployee = (data) => {
    const newEmp = {
      ...data,
      id: getNextId(employees),
      status: "Active",
      salary: data.salary ?? { basic: 0, allowances: [], deductions: [] },
    };
    setEmployees(prev => [newEmp, ...prev]);
    return newEmp;
  };

  const updateEmployee = (id, data) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, ...data } : e)
    );
  };

  const deactivateEmployee = (id) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, status: "Inactive" } : e)
    );
  };

  const activateEmployee = (id) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, status: "Active" } : e)
    );
  };

  const updateSalary = (id, salary) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, salary } : e)
    );
  };

  const getEmployee = (id) => employees.find(e => e.id === id);

  const activeEmployees = employees.filter(e => e.status === "Active");

  return (
    <EmployeeContext.Provider value={{
      employees,
      activeEmployees,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      activateEmployee,
      updateSalary,
      getEmployee,
      calcNetSalary,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployees must be used inside EmployeeProvider");
  return ctx;
}
