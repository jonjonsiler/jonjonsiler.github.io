import React from 'react';
import moment from 'moment';
import { getMondayFridayDates } from '@utilities';

export interface WeekDateRangeHeaderProps {
  /**
   * Optional starting date. If not provided, defaults to today.
   * The component will determine the Monday-Friday range based on this date.
   */
  startingDate?: Date;
  /**
   * Optional format string for the date range.
   * Defaults to "MMM. D" which produces format like "Apr. 15"
   */
  format?: string;
}

/**
 * A component that generates a Monday-Friday date range string based on a given date.
 * The component is time-agnostic and only deals with date absolutes.
 * 
 * @example
 * // With default date (today)
 * <WeekDateRangeHeader />
 * 
 * @example
 * // With specific date
 * <WeekDateRangeHeader startingDate={new Date('2024-04-15')} />
 * 
 * @example
 * // With custom format
 * <WeekDateRangeHeader format="MMM D, YYYY" />
 */
export const WeekDateRangeHeader: React.FC<WeekDateRangeHeaderProps> = ({
  startingDate = new Date(),
  format = "MMM. D"
}) => {
  // Always use only the date parts (year, month, day) to avoid timezone issues
  const localDate = new Date(
    startingDate.getFullYear(),
    startingDate.getMonth(),
    startingDate.getDate()
  );
  localDate.setHours(0, 0, 0, 0);

  // For Saturday/Sunday, use next week (offset=1), else current week (offset=0)
  const day = localDate.getDay();
  const offset = (day === 6 || day === 0) ? 1 : 0;
  const [mondayStr, fridayStr] = getMondayFridayDates(offset, localDate);

  // Format the date range, using month number to determine period after abbreviation
  const formatDate = (dateStr: string) => {
    const date = moment(dateStr);
    // Only add period if not May (month 5)
    format = format === "MMM. D" && date.month() === 4 ? "MMM D" : format;
    return date.format(format);
  };

  const result = `${formatDate(mondayStr)} - ${formatDate(fridayStr)}`;
  return <>{result}</>;
}; 