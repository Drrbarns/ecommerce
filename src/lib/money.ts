/**
 * Money utilities for minor unit handling
 * All money in the system should be stored as minor units (pesewas for GHS)
 */

export const CURRENCY_CONFIG = {
    GHS: { code: 'GHS', symbol: '₵', name: 'Ghana Cedi', minorUnit: 100 },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', minorUnit: 100 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', minorUnit: 100 },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', minorUnit: 100 },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;

/**
 * Convert major units (e.g., 25.00) to minor units (e.g., 2500)
 */
export function toMinorUnits(amount: number, currency: CurrencyCode = 'GHS'): number {
    const multiplier = CURRENCY_CONFIG[currency].minorUnit;
    return Math.round(amount * multiplier);
}

/**
 * Convert minor units (e.g., 2500) to major units (e.g., 25.00)
 */
export function toMajorUnits(amountMinor: number, currency: CurrencyCode = 'GHS'): number {
    const divisor = CURRENCY_CONFIG[currency].minorUnit;
    return amountMinor / divisor;
}

/**
 * Alias for toMajorUnits - converts minor units to major units
 */
export const fromMinorUnits = toMajorUnits;


/**
 * Format minor units as currency string (e.g., 2500 -> "₵25.00")
 */
export function formatMoney(amountMinor: number, currency: CurrencyCode = 'GHS'): string {
    const config = CURRENCY_CONFIG[currency];
    const major = toMajorUnits(amountMinor, currency);
    return `${config.symbol}${major.toFixed(2)}`;
}

/**
 * Format minor units as number string without symbol (e.g., 2500 -> "25.00")
 */
export function formatMoneyValue(amountMinor: number, currency: CurrencyCode = 'GHS'): string {
    const major = toMajorUnits(amountMinor, currency);
    return major.toFixed(2);
}

/**
 * Parse a string amount to minor units
 */
export function parseToMinorUnits(value: string, currency: CurrencyCode = 'GHS'): number {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleaned) || 0;
    return toMinorUnits(amount, currency);
}

/**
 * Calculate percentage discount in minor units
 */
export function calculatePercentageDiscount(
    subtotalMinor: number,
    percentage: number,
    maxDiscountMinor?: number
): number {
    const discount = Math.round((subtotalMinor * percentage) / 100);
    if (maxDiscountMinor !== undefined && discount > maxDiscountMinor) {
        return maxDiscountMinor;
    }
    return discount;
}

/**
 * Calculate order totals
 */
export interface OrderTotals {
    subtotalMinor: number;
    shippingMinor: number;
    discountMinor: number;
    taxMinor: number;
    totalMinor: number;
}

export function calculateOrderTotals(
    subtotalMinor: number,
    shippingMinor: number = 0,
    discountMinor: number = 0,
    taxRate: number = 0, // As percentage (e.g., 12.5 for 12.5%)
    taxIncluded: boolean = true
): OrderTotals {
    const afterDiscount = Math.max(0, subtotalMinor - discountMinor);

    let taxMinor = 0;
    if (taxRate > 0) {
        if (taxIncluded) {
            // Tax is already included in price, calculate for display
            taxMinor = Math.round((afterDiscount * taxRate) / (100 + taxRate));
        } else {
            // Tax needs to be added
            taxMinor = Math.round((afterDiscount * taxRate) / 100);
        }
    }

    const totalMinor = taxIncluded
        ? afterDiscount + shippingMinor
        : afterDiscount + shippingMinor + taxMinor;

    return {
        subtotalMinor,
        shippingMinor,
        discountMinor,
        taxMinor,
        totalMinor,
    };
}

/**
 * Validate amount matches (for payment verification)
 */
export function amountsMatch(
    expected: number,
    actual: number,
    toleranceMinor: number = 0
): boolean {
    return Math.abs(expected - actual) <= toleranceMinor;
}
