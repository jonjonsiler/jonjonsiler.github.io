import moment from "moment";

/**
 * get previous or current monday and friday dates in YYYY-MM-DD format
 * @param offset number week offset instance -1 is starting a week ago from today
 * @param startDate date to calculate from (default: today)
 * @returns string[] with 0 index == monday and 1 index == friday
 */
export const getMondayFridayDates = (offset = 0, startDate?: Date) => {
  const baseDate = moment(startDate || new Date());
  
  // Apply Friday noon logic only when calculating current week (offset=0, no startDate)
  if (offset === 0 && !startDate) {
    const dayOfWeek = baseDate.isoWeekday();
    const isAfterNoon = baseDate.hour() >= 12;
    
    // On Friday after noon or weekends, show the next week
    // On weekdays (Mon-Thu) or Friday before noon, show the current week
    if ((dayOfWeek === 5 && isAfterNoon) || dayOfWeek >= 6) {
      baseDate.add(1, 'week');
    }
  } else {
    baseDate.add(offset, 'week');
  }

  const monday = baseDate.startOf('isoWeek');
  return [monday.format('YYYY-MM-DD'), monday.clone().add(4, 'days').format('YYYY-MM-DD')];
};
