// Whimsical multi-currency system for the Fae World

export type CurrencyType = 'KSH' | 'KES' | 'SOL' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'ZAR' | 'TZS';

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  KSH: 'KSh',
  KES: 'KSh',
  SOL: '☀️',
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: 'GH₵',
  ZAR: 'R',
  TZS: 'TSh'
};

export const CURRENCY_NAMES: Record<CurrencyType, string> = {
  KSH: 'Kenyan Shilling (KSh)',
  KES: 'Kenyan Shilling (KES)',
  SOL: 'Celestial Sol Coins (☀️)',
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'British Pound (£)',
  NGN: 'Nigerian Naira (₦)',
  GHS: 'Ghanaian Cedi (GH₵)',
  ZAR: 'South African Rand (R)',
  TZS: 'Tanzanian Shilling (TSh)'
};

// Exchange rates (relative to Kenyan Shilling / KES as base 1.0)
export const EXCHANGE_RATES: Record<CurrencyType, number> = {
  KSH: 1.0,
  KES: 1.0,
  SOL: 0.01,     // 1 Sol = 100 KSh
  USD: 0.0077,   // 1 USD = 130 KSh
  EUR: 0.007,    // 1 EUR = 140 KSh
  GBP: 0.006,
  NGN: 12.5,
  GHS: 0.095,
  ZAR: 0.14,
  TZS: 20.2
};

export function getSelectedCurrency(): CurrencyType {
  const active = localStorage.getItem('sol_currency') || localStorage.getItem('sol_active_currency');
  return (active as CurrencyType) || 'KES';
}

/**
 * Converts an amount from KSh (base) to a target currency.
 */
export function convertFromKsh(amountInKsh: number, targetCurrency: CurrencyType): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return amountInKsh * rate;
}

/**
 * Converts an amount from a target currency back to KSh (base).
 */
export function convertToKsh(amount: number, sourceCurrency: CurrencyType): number {
  const rate = EXCHANGE_RATES[sourceCurrency] || 1.0;
  return amount / rate;
}

/**
 * Formats a price value dynamically based on the globally active currency.
 * If targetCurrency is provided, it formats in that specific currency.
 */
export function formatPrice(amountInKsh: number, targetCurrency?: CurrencyType): string {
  const currency = targetCurrency || getSelectedCurrency();
  const converted = convertFromKsh(amountInKsh, currency);

  if (currency === 'SOL') {
    return `${converted.toFixed(2)} ☀️`;
  }

  try {
    const cleanCurrencyCode = currency === 'KSH' ? 'KES' : currency;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cleanCurrencyCode,
      minimumFractionDigits: (currency === 'NGN' || currency === 'TZS') ? 0 : 2,
      maximumFractionDigits: (currency === 'NGN' || currency === 'TZS') ? 0 : 2
    });
    return formatter.format(converted);
  } catch (e) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol} ${converted.toFixed(2)}`;
  }
}

/**
 * Legacy compatibility helper. It delegates directly to formatPrice
 * so that any existing file using formatKsh automatically adapts to
 * the newly selected active currency.
 */
export function formatKsh(amount: number): string {
  return formatPrice(amount);
}
export { formatPrice as formatCurrency };
