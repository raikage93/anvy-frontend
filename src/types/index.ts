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

export interface EyewearProduct {
  id: number;
  name: string;
  brand: string;
  frame_type: string;
  price: number;
  description: string;
  image_url: string;
  quantity: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PatientRecord {
  id: number;
  patient_profile_id?: number;
  full_name: string;
  birth_year: number | null;
  exam_date: string;
  phone: string;
  address: string;
  quick_medical_assessment: string;
  va_unaided_mp: string;
  va_unaided_mt: string;
  va_unaided_binocular: string;
  va_old_mp: string;
  va_old_mt: string;
  va_old_binocular: string;
  va_new_mp: string;
  va_new_mt: string;
  va_new_binocular: string;
  sphere_old_mp: number | null;
  cylinder_old_mp: number | null;
  axis_old_mp: number | null;
  sphere_old_mt: number | null;
  cylinder_old_mt: number | null;
  axis_old_mt: number | null;
  sphere_new_mp: number | null;
  cylinder_new_mp: number | null;
  axis_new_mp: number | null;
  sphere_new_mt: number | null;
  cylinder_new_mt: number | null;
  axis_new_mt: number | null;
  next_appointment_date?: string | null;
  clinical_diagnosis: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
}

export interface PatientExamResult {
  id: number;
  patient_profile_id: number;
  exam_date: string;
  quick_medical_assessment: string;
  va_unaided_mp: string;
  va_unaided_mt: string;
  va_unaided_binocular: string;
  va_old_mp: string;
  va_old_mt: string;
  va_old_binocular: string;
  va_new_mp: string;
  va_new_mt: string;
  va_new_binocular: string;
  sphere_old_mp: number | null;
  cylinder_old_mp: number | null;
  axis_old_mp: number | null;
  sphere_old_mt: number | null;
  cylinder_old_mt: number | null;
  axis_old_mt: number | null;
  sphere_new_mp: number | null;
  cylinder_new_mp: number | null;
  axis_new_mp: number | null;
  sphere_new_mt: number | null;
  cylinder_new_mt: number | null;
  axis_new_mt: number | null;
  next_appointment_date?: string | null;
  clinical_diagnosis: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
}

export interface PatientProfile {
  id: number;
  full_name: string;
  birth_year: number | null;
  phone: string;
  phone_digits: string;
  address: string;
  latest_exam_date: string | null;
  result_count: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  results?: PatientExamResult[];
}

export interface EyewearSearchResponse {
  items: EyewearProduct[];
  pagination: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
  facets: {
    brands: string[];
    frame_types: string[];
    price: {
      min: number;
      max: number;
    };
  };
}

export const STORAGE_KEY = 'anvy_default_info';
