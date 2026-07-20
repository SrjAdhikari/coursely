//* src/utils/date.ts

/** Shared duration constants (milliseconds). */
const MINUTE_MS = 60 * 1000;

export const FIFTEEN_MINUTES_MS = 15 * MINUTE_MS;
export const SEVEN_DAYS_MS = 7 * 24 * 60 * MINUTE_MS;
export const ONE_HOUR_MS = 60 * MINUTE_MS;
export const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;

export const sevenDaysFromNow = () => new Date(Date.now() + SEVEN_DAYS_MS);
