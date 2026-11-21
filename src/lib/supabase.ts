import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();

const hasValidUrl =
  supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://');

export const isSupabaseConfigured = Boolean(
  hasValidUrl && supabaseAnonKey && supabaseAnonKey.length > 10
);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}

export interface SubmitResult {
  ok: boolean;
  missingConfig?: boolean;
  error?: string;
}

export const MISSING_SUPABASE_MESSAGE =
  'Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file and run supabase/schema.sql in your Supabase SQL Editor.';

async function insertRow<T extends object>(
  table: string,
  payload: T
): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      missingConfig: true,
      error: MISSING_SUPABASE_MESSAGE,
    };
  }

  try {
    const { error } = await client.from(table).insert(payload);
    if (error) {
      return {
        ok: false,
        error: error.message || 'Unable to submit right now. Please try again.',
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Network error while connecting to Supabase.',
    };
  }
}

export interface UserProfile {
  id: string;
  auth_provider: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  village: string | null;
  fpo_name: string | null;
  preferred_language: 'English' | 'Marathi' | 'Hindi';
  updated_at?: string;
}

export async function signInWithGoogle(): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, missingConfig: true, error: MISSING_SUPABASE_MESSAGE };
  }
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth`,
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, missingConfig: true, error: MISSING_SUPABASE_MESSAGE };
  }
  const { error: signInErr } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (!signInErr) {
    return { ok: true };
  }
  const { error: signUpErr } = await client.auth.signUp({
    email: email.trim(),
    password,
  });
  if (signUpErr) {
    return { ok: false, error: signInErr.message || signUpErr.message };
  }
  return { ok: true };
}

export async function sendPhoneOtp(phone10Digits: string): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, missingConfig: true, error: MISSING_SUPABASE_MESSAGE };
  }
  const { error } = await client.auth.signInWithOtp({
    phone: `+91${phone10Digits}`,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function verifyPhoneOtp(
  phone10Digits: string,
  token: string
): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, missingConfig: true, error: MISSING_SUPABASE_MESSAGE };
  }
  const { error } = await client.auth.verifyOtp({
    phone: `+91${phone10Digits}`,
    token: token.trim(),
    type: 'sms',
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

export async function ensureAndFetchUserProfile(
  user: User
): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: existing, error: selectErr } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!selectErr && existing) {
    return existing as UserProfile;
  }

  const provider =
    (user.app_metadata?.provider as string | undefined) ||
    (user.phone ? 'phone' : 'google');
  const fullNameFromMeta =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    null;

  const newProfile: UserProfile = {
    id: user.id,
    auth_provider: provider,
    email: user.email ?? null,
    phone: user.phone ?? null,
    full_name: fullNameFromMeta,
    village: null,
    fpo_name: null,
    preferred_language: 'English',
  };

  const { data: inserted } = await client
    .from('user_profiles')
    .upsert(newProfile, { onConflict: 'id' })
    .select('*')
    .maybeSingle();

  return (inserted as UserProfile | null) ?? newProfile;
}

export async function updateUserProfile(
  profile: Partial<UserProfile> & { id: string }
): Promise<SubmitResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, missingConfig: true, error: MISSING_SUPABASE_MESSAGE };
  }
  const { error } = await client
    .from('user_profiles')
    .upsert(
      {
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export interface EnrolmentRecord {
  id: string;
  tier: string;
  acres: number;
  village: string;
  fpo_name: string;
  status: string;
  created_at: string;
}

export interface FertiliserRecord {
  id: string;
  crop: string;
  season: string;
  acres: number;
  soil_type: string;
  created_at: string;
}

export interface AdvisorRecord {
  id: string;
  language: string;
  question: string;
  answer: string;
  created_at: string;
}

export async function fetchUserActivity(userId: string): Promise<{
  enrolments: EnrolmentRecord[];
  fertiliserRequests: FertiliserRecord[];
  advisorQueries: AdvisorRecord[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { enrolments: [], fertiliserRequests: [], advisorQueries: [] };
  }

  const [enrolRes, fertRes, advRes] = await Promise.all([
    client
      .from('enrolments')
      .select('id, tier, acres, village, fpo_name, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    client
      .from('fertiliser_requests')
      .select('id, crop, season, acres, soil_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    client
      .from('advisor_queries')
      .select('id, language, question, answer, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    enrolments: (enrolRes.data as EnrolmentRecord[] | null) ?? [],
    fertiliserRequests: (fertRes.data as FertiliserRecord[] | null) ?? [],
    advisorQueries: (advRes.data as AdvisorRecord[] | null) ?? [],
  };
}

export function saveAdvisorQuery(payload: {
  language: 'English' | 'Marathi' | 'Hindi';
  question: string;
  answer: string;
}): Promise<SubmitResult> {
  return insertRow('advisor_queries', payload);
}

export interface EnrolmentPayload {
  tier: 'watch' | 'scout' | 'care' | 'full-care';
  acres: number;
  name: string;
  phone: string;
  village: string;
  fpo_name: string;
  status: string;
}

export function submitEnrolment(payload: EnrolmentPayload): Promise<SubmitResult> {
  return insertRow('enrolments', payload);
}

export interface FpoApplicationPayload {
  fpo_name: string;
  contact_name: string;
  phone: string;
  district: string;
  member_count: number;
  total_acres: number;
  pricing_tier: 'solo_fpo' | 'cluster' | 'full_konkan';
}

export function submitFpoApplication(
  payload: FpoApplicationPayload
): Promise<SubmitResult> {
  return insertRow('fpo_applications', payload);
}

export interface VillageApplicationPayload {
  village: string;
  pack_size: 'gaon_50' | 'gaon_100' | 'gaon_200';
  contact_name: string;
  phone: string;
  district: string;
}

export function submitVillageApplication(
  payload: VillageApplicationPayload
): Promise<SubmitResult> {
  return insertRow('village_applications', payload);
}

export interface FertiliserRequestPayload {
  crop: string;
  season: string;
  acres: number;
  soil_type: string;
  n: number | null;
  p: number | null;
  k: number | null;
  ph: number | null;
  phone: string;
}

export function submitFertiliserRequest(
  payload: FertiliserRequestPayload
): Promise<SubmitResult> {
  return insertRow('fertiliser_requests', payload);
}

export interface ContactMessagePayload {
  type: 'team' | 'fpo_partnership' | 'field_support';
  name: string;
  phone: string;
  message: string;
}

export function submitContactMessage(
  payload: ContactMessagePayload
): Promise<SubmitResult> {
  return insertRow('contact_messages', payload);
}

export interface CallbackRequestPayload {
  name: string;
  phone: string;
  preferred_slot: string;
}

export function submitCallbackRequest(
  payload: CallbackRequestPayload
): Promise<SubmitResult> {
  return insertRow('callback_requests', payload);
}

export function validateIndianPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()+]/g, '');
  const normalized =
    digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return null;
  }
  return normalized;
}
