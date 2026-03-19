import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format number as USD with commas (e.g. $77,015.07). */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

/** Format integer with commas (e.g. 1,234). */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}
