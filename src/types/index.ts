export interface BankInfo {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export interface DefaultInfo {
  bankBin: string;
  bankName: string;
  bankLogo: string;
  accountNo: string;
  description: string;
}

export const STORAGE_KEY = 'anvy_default_info';
