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

export interface WheelPrize {
  id: number;
  name: string;
  description: string;
  total_quantity: number;
  remaining_quantity: number;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface WheelSpin {
  id: number;
  prize_id: number | null;
  prize_name: string;
  prize_description: string;
  prize_color: string;
  phone?: string | null;
  spin_date?: string | null;
  created_at: string;
  segment_index?: number;
}

export interface WheelReward {
  id: number;
  prize_id: number | null;
  prize_name: string;
  prize_description: string;
  prize_color: string;
  phone?: string | null;
  spin_date?: string | null;
  created_at: string;
  claim?: WheelClaim | null;
}

export interface WheelSettings {
  max_daily_spins_per_phone: number;
  updated_at?: string;
}

export interface WheelClaim {
  id: number;
  spin_id?: number;
  prize_id?: number | null;
  phone: string;
  prize_name: string;
  prize_description: string;
  prize_color: string;
  status: 'issued' | 'redeemed';
  issued_at: string;
  redeemed_at?: string | null;
  redeemed_by?: number | null;
  redeemed_by_username?: string | null;
  token?: string;
  qr_payload?: string;
}

export interface WheelRecentWinner {
  id: number;
  phone: string;
  prize_name: string;
  prize_color: string;
  redeemed_at: string;
}

export const STORAGE_KEY = 'anvy_default_info';
