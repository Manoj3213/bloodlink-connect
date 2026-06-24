import { supabase } from './supabase';
import type {
  Profile, Donor, BloodRequest, Donation, Notification,
  DonorWithProfile, BloodRequestWithRequester, DashboardStats,
  ApiResponse, PaginatedResponse, BloodGroup, Gender
} from '../types';

// Error handling wrapper
function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// ============================================
// Authentication APIs
// ============================================

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: 'donor' | 'recipient',
  phone?: string
): Promise<ApiResponse<Profile>> {
  try {
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return { error: authError.message };

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Failed to create account.' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userData.user.id, full_name: fullName, email, role, phone: phone ?? null })
      .select()
      .single();

    if (profileError) return { error: profileError.message };
    return { data: profile as Profile };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<Profile>> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Failed to get user.' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data: profile as Profile };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function logoutUser(): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<Profile>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data: profile as Profile };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function updateProfile(
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<ApiResponse<Profile>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as Profile };
  } catch (error) {
    return { error: handleError(error) };
  }
}

// ============================================
// Donor Management APIs
// ============================================

export async function createDonorProfile(
  data: {
    blood_group: BloodGroup;
    city: string;
    date_of_birth?: string;
    weight_kg?: number;
    medical_conditions?: string;
    age?: number;
    gender?: Gender;
    phone?: string;
  }
): Promise<ApiResponse<Donor>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    if (data.age && (data.age < 18 || data.age > 65)) {
      return { error: 'Age must be between 18 and 65' };
    }

    if (data.weight_kg && data.weight_kg < 50) {
      return { error: 'Weight must be at least 50kg to donate' };
    }

    const { data: donor, error } = await supabase
      .from('donors')
      .insert({ id: user.id, ...data, availability: true })
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: donor as Donor };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function updateDonorProfile(
  updates: Partial<Pick<Donor, 'blood_group' | 'city' | 'availability' | 'weight_kg' | 'medical_conditions' | 'age' | 'gender' | 'phone'>>
): Promise<ApiResponse<Donor>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    if (updates.age && (updates.age < 18 || updates.age > 65)) {
      return { error: 'Age must be between 18 and 65' };
    }

    const { data, error } = await supabase
      .from('donors')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as Donor };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function getDonorProfile(): Promise<ApiResponse<Donor>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return { error: error.message };
    return { data: data as Donor };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function deleteDonorProfile(): Promise<ApiResponse<null>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('donors')
      .delete()
      .eq('id', user.id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function searchDonors(
  filters?: {
    blood_group?: BloodGroup;
    city?: string;
    available_only?: boolean;
    verified_only?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResponse<DonorWithProfile>> {
  try {
    let query = supabase
      .from('donors')
      .select('*, profile:profiles(*)', { count: 'exact' })
      .order('verified', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.blood_group) query = query.eq('blood_group', filters.blood_group);
    if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters?.available_only !== false) query = query.eq('availability', true);
    if (filters?.verified_only) query = query.eq('verified', true);

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data as DonorWithProfile[]) ?? [],
      total: count ?? 0,
      pagination: { limit, offset, count: data?.length ?? 0 }
    };
  } catch (error) {
    console.error('Error searching donors:', error);
    return { data: [], total: 0, pagination: { limit: 50, offset: 0, count: 0 } };
  }
}

// ============================================
// Blood Request APIs
// ============================================

export async function createBloodRequest(
  data: {
    patient_name: string;
    blood_group: BloodGroup;
    units_required: number;
    hospital_name: string;
    city: string;
    contact_person: string;
    contact_phone: string;
    urgency?: 'normal' | 'urgent' | 'critical';
    description?: string;
  }
): Promise<ApiResponse<BloodRequest>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    if (data.units_required < 1 || data.units_required > 20) {
      return { error: 'Units required must be between 1 and 20' };
    }

    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    if (!phoneRegex.test(data.contact_phone)) {
      return { error: 'Invalid phone number format' };
    }

    const { data: request, error } = await supabase
      .from('blood_requests')
      .insert({ requester_id: user.id, ...data })
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: request as BloodRequest };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function getBloodRequests(
  filters?: {
    blood_group?: BloodGroup;
    city?: string;
    urgency?: 'normal' | 'urgent' | 'critical';
    status?: 'open' | 'fulfilled' | 'closed';
    requester_id?: string;
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResponse<BloodRequestWithRequester>> {
  try {
    let query = supabase
      .from('blood_requests')
      .select('*, requester:profiles!blood_requests_requester_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.blood_group) query = query.eq('blood_group', filters.blood_group);
    if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters?.urgency) query = query.eq('urgency', filters.urgency);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.requester_id) query = query.eq('requester_id', filters.requester_id);

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data as BloodRequestWithRequester[]) ?? [],
      total: count ?? 0,
      pagination: { limit, offset, count: data?.length ?? 0 }
    };
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    return { data: [], total: 0, pagination: { limit: 50, offset: 0, count: 0 } };
  }
}

export async function updateBloodRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'closed'
): Promise<ApiResponse<BloodRequest>> {
  try {
    const updates: Record<string, unknown> = { status };
    if (status === 'fulfilled') updates.fulfilled_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('blood_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as BloodRequest };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function deleteBloodRequest(
  requestId: string
): Promise<ApiResponse<null>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('blood_requests')
      .delete()
      .eq('id', requestId)
      .eq('requester_id', user.id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

// ============================================
// Donations APIs
// ============================================

export async function recordDonation(
  requestId?: string,
  notes?: string
): Promise<ApiResponse<Donation>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: donation, error } = await supabase
      .from('donations')
      .insert({ donor_id: user.id, request_id: requestId ?? null, notes })
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase
      .from('donors')
      .update({ last_donation_date: new Date().toISOString().split('T')[0] })
      .eq('id', user.id);

    return { data: donation as Donation };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function getDonationHistory(
  limit?: number
): Promise<ApiResponse<Donation[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', user.id)
      .order('donated_at', { ascending: false })
      .limit(limit ?? 10);

    if (error) return { error: error.message };
    return { data: data as Donation[] };
  } catch (error) {
    return { error: handleError(error) };
  }
}

// ============================================
// Notifications APIs
// ============================================

export async function getNotifications(
  options?: { unread_only?: boolean; limit?: number; offset?: number }
): Promise<ApiResponse<{ notifications: Notification[]; total: number; unread_count: number }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (options?.unread_only) query = query.eq('read', false);

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return { error: error.message };

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return {
      data: {
        notifications: (data as Notification[]) ?? [],
        total: count ?? 0,
        unread_count: unreadCount ?? 0
      }
    };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function markNotificationRead(
  notificationId: string
): Promise<ApiResponse<null>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function markAllNotificationsRead(): Promise<ApiResponse<null>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

// ============================================
// Admin APIs
// ============================================

export async function getAdminStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { error: 'Forbidden - Admin access required' };
    }

    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) return { error: error.message };
    return { data: data as DashboardStats };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function adminGetAllDonors(
  options?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<DonorWithProfile>> {
  try {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await supabase
      .from('donors')
      .select('*, profile:profiles(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data as DonorWithProfile[]) ?? [],
      total: count ?? 0,
      pagination: { limit, offset, count: data?.length ?? 0 }
    };
  } catch (error) {
    console.error('Error fetching all donors:', error);
    return { data: [], total: 0, pagination: { limit: 100, offset: 0, count: 0 } };
  }
}

export async function adminVerifyDonor(
  donorId: string,
  verified: boolean
): Promise<ApiResponse<Donor>> {
  try {
    const { data, error } = await supabase
      .from('donors')
      .update({ verified })
      .eq('id', donorId)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as Donor };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function adminGetAllRequests(
  options?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<BloodRequestWithRequester>> {
  try {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await supabase
      .from('blood_requests')
      .select('*, requester:profiles!blood_requests_requester_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data as BloodRequestWithRequester[]) ?? [],
      total: count ?? 0,
      pagination: { limit, offset, count: data?.length ?? 0 }
    };
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return { data: [], total: 0, pagination: { limit: 100, offset: 0, count: 0 } };
  }
}

export async function adminDeleteUser(
  userId: string
): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function adminUpdateRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'closed'
): Promise<ApiResponse<BloodRequest>> {
  return updateBloodRequestStatus(requestId, status);
}
