export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
        style:'currency',
        currency:'LKR',
        minimumFractionDigits:2,
    }).format(amount);
};

export const formatDate = (dateString) => {
    if(!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year:'numeric',
        month:'short',
        day:'numeric',
    });
};

export const getStatusStyle = (status) => {
    const styles = {
        Draft:    'bg-gray-500/20   text-gray-400   border-gray-500/30',
        Sent:     'bg-blue-500/20   text-blue-400   border-blue-500/30',
        Paid:     'bg-green-500/20  text-green-400  border-green-500/30',
        Overdue:  'bg-red-500/20    text-red-400    border-red-500/30',
        Active:   'bg-green-500/20  text-green-400  border-green-500/30',
        Inactive: 'bg-gray-500/20   text-gray-400   border-gray-500/30',
        Finalized:'bg-blue-500/20   text-blue-400   border-blue-500/30',
        Pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return styles[status] || styles.Draft;
};