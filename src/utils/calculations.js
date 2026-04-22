export const calcLineTotal = (quantity, unitPrice) => {
    return (Number(quantity) || 0) * (Number(unitPrice) || 0);
};

export const calcInvoiceTotal = (items) => {
    if(!items || items.length === 0) return 0;
    return items.reduce((total,item) => {
        return total + calcLineTotal(item.quantity, item.unitPrice);
    }, 0);
};

export const calcNetSalary = (salary) => {
    if(!salary) return 0;
    const totalAllowances = salary.allowances?.reduce(
        (sum, a) => sum + (Number(a.amount) || 0), 0
    ) || 0;
    const totalDeductions = salary.deductions?.reduce(
        (sum, d) => sum + (Number(d.amount) || 0), 0 
    ) || 0;
    return salary.basic + totalAllowances - totalDeductions;
}

export const isOverdue = (dueDate, status) => {
    if(status === 'Paid') return false;
    return new Date(dueDate) < new Date();
};