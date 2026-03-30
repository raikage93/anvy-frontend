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

export interface AppointmentPayload {
  phone: string;
  appointment_time: string;
  notes: string;
}

export interface Appointment {
  id: number;
  phone: string;
  appointment_time: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface AvailabilitySetting {
  weekday: number;
  label: string;
  enabled: boolean;
  start_time: string | null;
  end_time: string | null;
}

export const STORAGE_KEY = 'anvy_default_info';
