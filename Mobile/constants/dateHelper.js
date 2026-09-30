const MONTHS = [
  { short: "JAN", long: "JANUARY", title: "January", days: 31 },
  { short: "FEB", long: "FEBRUARY", title: "February", days: 28 }, // NOT LEAP YEAR
  { short: "MAR", long: "MARCH", title: "March", days: 31 },
  { short: "APR", long: "APRIL", title: "April", days: 30 },
  { short: "MAY", long: "MAY", title: "May", days: 31 },
  { short: "JUN", long: "JUNE", title: "June", days: 30 },
  { short: "JUL", long: "JULY", title: "July", days: 31 },
  { short: "AUG", long: "AUGUST", title: "August", days: 31 },
  { short: "SEP", long: "SEPTEMBER", title: "September", days: 30 },
  { short: "OCT", long: "OCTOBER", title: "October", days: 31 },
  { short: "NOV", long: "NOVEMBER", title: "November", days: 30 },
  { short: "DEC", long: "DECEMBER", title: "December", days: 31 },
];

export const format = (month, year, days) => {
  const data = MONTHS.find(m => m.short === month.toUpperCase());
  return data? `${data.long} ${year}: ${days}/${data.days} DAYS CAPTURED`: "UNKNOWN";
};

export const oneMonthFormat = (month, year) => {
  const data = MONTHS.find(m => m.short === month.toUpperCase());
  return data? `${data.title} ${year}` : "UNKNOWN";
};