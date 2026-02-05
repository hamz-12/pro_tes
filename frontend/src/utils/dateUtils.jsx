export const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

export const getDateRange = (range) => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'all':
      startDate.setFullYear(2000);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate),
  };
};