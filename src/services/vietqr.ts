import type { BankInfo } from '../types';

const VIETQR_API = 'https://api.vietqr.io/v2';

export async function fetchBanks(): Promise<BankInfo[]> {
  const res = await fetch(`${VIETQR_API}/banks`);
  const data = await res.json();
  if (data.code === '00') {
    return data.data.filter((b: BankInfo) => b.transferSupported === 1);
  }
  throw new Error('Failed to fetch banks');
}

export function generateQRUrl(
  bankBin: string,
  accountNo: string,
  amount: number,
  description: string,
  template: string = 'compact2'
): string {
  const params = new URLSearchParams();
  if (amount > 0) params.set('amount', amount.toString());
  if (description) params.set('addInfo', description);
  params.set('accountName', '');
  
  return `https://img.vietqr.io/image/${bankBin}-${accountNo}-${template}.png?${params.toString()}`;
}
