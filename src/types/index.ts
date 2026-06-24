export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserRole = 'donor' | 'recipient' | 'admin';
export type RequestUrgency = 'normal' | 'urgent' | 'critical';
export type RequestStatus = 'open' | 'fulfilled' | 'closed';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  blood_group: BloodGroup;
  city: string;
  availability: boolean;
  last_donation_date: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  medical_conditions: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
  age: number | null;
  gender: Gender | null;
  phone: string | null;
  profile?: Profile;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  city: string;
  contact_person: string;
  contact_phone: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  description: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
  requester?: Profile;
}

export interface Donation {
  id: string;
  donor_id: string;
  request_id: string | null;
  donated_at: string;
  notes: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface DonorWithProfile extends Donor {
  profile: Profile;
}

export interface BloodRequestWithRequester extends BloodRequest {
  requester: Profile;
}

export interface DashboardStats {
  total_donors: number;
  verified_donors: number;
  available_donors: number;
  total_recipients: number;
  total_requests: number;
  open_requests: number;
  critical_requests: number;
  fulfilled_requests: number;
  total_donations: number;
  donors_by_blood_group: Record<BloodGroup, number>;
  requests_by_city: Record<string, number>;
  recent_requests: Array<{
    id: string;
    patient_name: string;
    blood_group: BloodGroup;
    urgency: RequestUrgency;
    status: RequestStatus;
    created_at: string;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say'];

export const COMPATIBLE_RECIPIENTS: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

export const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export const BLOOD_GROUP_INFO: Record<BloodGroup, { percentage: string; canDonateTo: string; canReceiveFrom: string }> = {
  'A+': { percentage: '35.7%', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-' },
  'A-': { percentage: '6.3%', canDonateTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-' },
  'B+': { percentage: '8.5%', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-' },
  'B-': { percentage: '1.5%', canDonateTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-' },
  'AB+': { percentage: '3.4%', canDonateTo: 'AB+', canReceiveFrom: 'Everyone (Universal Recipient)' },
  'AB-': { percentage: '0.6%', canDonateTo: 'AB+, AB-', canReceiveFrom: 'A-, B-, AB-, O-' },
  'O+': { percentage: '37.4%', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-' },
  'O-': { percentage: '6.6%', canDonateTo: 'Everyone (Universal Donor)', canReceiveFrom: 'O-' },
};
