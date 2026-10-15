/**
 * Indian Rupee (INR / ₹) Currency Utility for VELNIX.WEAR
 */

export const formatINR = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
};

export const CURRENCY_SYMBOL = '₹';
