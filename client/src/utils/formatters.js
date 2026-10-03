export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  
  const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateFormatted = d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return `${dayName}, ${dateFormatted}`;
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTicketNo = (ticketNo) => {
  if (!ticketNo) return '#00000';
  if (ticketNo.startsWith('#')) return ticketNo;
  const match = ticketNo.match(/\d+$/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `#${String(num).padStart(5, '0')}`;
  }
  return `#${ticketNo}`;
};
