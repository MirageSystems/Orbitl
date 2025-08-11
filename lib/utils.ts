import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length = 4): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatBalance(balance: string | number, decimals = 4): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;
  
  // Validate input
  if (!isFinite(num) || isNaN(num) || num < 0) return "0";
  
  // Handle very small positive amounts
  const threshold = Math.pow(10, -decimals);
  if (num < threshold && num > 0) {
    return `< ${threshold.toFixed(decimals)}`;
  }
  
  // Format with specified decimals, remove trailing zeros
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function isValidSeiAddress(address: string): boolean {
  if (!address?.trim()) return false;
  const seiAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return seiAddressRegex.test(address.trim());
}

export function isValidEmailWalletFormat(input: string): boolean {
  if (!input?.trim()) return false;
  const emailWalletRegex = /^email:.+@.+\..+:(sei-wallet|smartwallet)$/;
  return emailWalletRegex.test(input.trim());
}

export function isValidRecipient(recipient: string): boolean {
  return isValidSeiAddress(recipient) || isValidEmailWalletFormat(recipient);
}

export function isValidAmount(amount: string): boolean {
  if (!amount?.trim()) return false;
  const amountRegex = /^[0-9]*\.?[0-9]{0,6}$/;
  if (!amountRegex.test(amount.trim())) return false;
  const num = parseFloat(amount.trim());
  return isFinite(num) && num > 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^\w\s@.:]/g, '');
}
