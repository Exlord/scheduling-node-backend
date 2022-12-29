export const getDayInFuture = (days: number, date: Date = new Date()): Date => {
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
