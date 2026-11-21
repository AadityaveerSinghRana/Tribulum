import { Eye, EyeOff, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import { GeminiAdvisorCard } from '../components/GeminiAdvisorCard';
import { useAuth } from '../context/AuthContext';
import {
  type AdvisorRecord,
  type EnrolmentRecord,
  fetchUserActivity,
  type FertiliserRecord,
  isSupabaseConfigured,
  signInWithEmailPassword,
  updateUserProfile,
} from '../lib/supabase';

interface AuthPageProps {
  onNavigate: (path: string) => void;
}

const DEMO_EMAIL = 'demo.farmer@gmail.com';
const DEMO_PASSWORD = 'DemoFarmer@2026';

export function AuthPage({ onNavigate }: AuthPageProps) {
  const {
    user,
    profile,
    isDemoSession,
    loading,
    refreshProfile,
    startDemoSession,
    updateDemoProfile,
    signOut,
  } = useAuth();

  // Email & Password state (demo-only, auto-filled on Tab)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [authStatus, setAuthStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  // Profile editor state
  const [fullName, setFullName] = useState('');
  const [village, setVillage] = useState('');
  const [fpoName, setFpoName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Marathi' | 'Hindi'>('English');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // User saved Supabase records
  const [enrolments, setEnrolments] = useState<EnrolmentRecord[]>([]);
  const [fertiliserRequests, setFertiliserRequests] = useState<FertiliserRecord[]>([]);
  const [advisorQueries, setAdvisorQueries] = useState<AdvisorRecord[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setVillage(profile.village || '');
      setFpoName(profile.fpo_name || '');
      setPreferredLanguage(profile.preferred_language || 'English');
    }
  }, [profile]);

  const loadActivity = useCallback(async () => {
    if (!user || isDemoSession) return;
    const activity = await fetchUserActivity(user.id);
    setEnrolments(activity.enrolments);
    setFertiliserRequests(activity.fertiliserRequests);
    setAdvisorQueries(activity.advisorQueries);
  }, [user, isDemoSession]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleFormTabFill = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Tab') {
      setEmailInput(DEMO_EMAIL);
      setPasswordInput(DEMO_PASSWORD);
      setAuthStatus('idle');
      setAuthMessage(null);
      setMissingConfig(false);
    }
  };

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    if (emailInput !== DEMO_EMAIL || passwordInput !== DEMO_PASSWORD) {
      setAuthStatus('error');
      setAuthMessage('Press Tab inside a field to auto-fill the demo account before signing in.');
      return;
    }

    setAuthStatus('submitting');
    setAuthMessage(null);

    if (!isSupabaseConfigured) {
      startDemoSession({
        provider: 'google',
        email: DEMO_EMAIL,
        fullName: 'Rajesh Sawant',
      });
      return;
    }

    const res = await signInWithEmailPassword(DEMO_EMAIL, DEMO_PASSWORD);
    if (res.ok) {
      setAuthStatus('success');
      setAuthMessage('Signed in successfully.');
    } else {
      startDemoSession({
        provider: 'google',
        email: DEMO_EMAIL,
        fullName: 'Rajesh Sawant',
      });
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isDemoSession) {
      updateDemoProfile({
        full_name: fullName.trim() || null,
        village: village.trim() || null,
        fpo_name: fpoName.trim() || null,
        preferred_language: preferredLanguage,
      });
      setProfileStatus('success');
      setProfileMessage('Profile updated for this demo preview session.');
      return;
    }

    setProfileStatus('submitting');
    setProfileMessage(null);

    const res = await updateUserProfile({
      id: user.id,
      full_name: fullName.trim() || null,
      village: village.trim() || null,
      fpo_name: fpoName.trim() || null,
      preferred_language: preferredLanguage,
    });

    if (res.ok) {
      await refreshProfile();
      setProfileStatus('success');
      setProfileMessage('Farmer profile saved to Supabase.');
    } else {
      setProfileStatus('error');
      setProfileMessage(res.error || 'Could not save profile.');
    }
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium text-emerald-400">
                Farmer &amp; FPO Member Portal
              </p>
              <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl">
                {user ? 'Your Tribulum Account' : 'Sign in to Tribulum'}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-zinc-400">
                {user
                  ? 'Manage your FPO profile, review submitted enrolments, and consult the Gemini 4 Hydrogen crop advisor.'
                  : 'Access the Tribulum member portal and Gemini 4 Hydrogen crop advisor.'}
              </p>
            </div>

            {user && (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-10 text-center text-sm text-zinc-400">
            Checking session...
          </div>
        ) : !user ? (
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* Sign-in Box */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-5">
              <h2 className="font-serif text-2xl font-normal text-white">
                Member Sign In
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Select a field and press <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-200">Tab</kbd> to auto-fill.
              </p>

              <form
                onSubmit={handleEmailSignIn}
                onKeyDown={handleFormTabFill}
                className="mt-6 space-y-4"
                noValidate
              >
                <FormStatusBanner
                  status={authStatus}
                  message={authMessage}
                  missingConfig={missingConfig}
                />

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Email Address *
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    readOnly
                    value={emailInput}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Password *
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      readOnly
                      value={passwordInput}
                      placeholder="Press Tab to auto-fill"
                      required
                      className="min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 pr-10 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authStatus === 'submitting'}
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1F6F50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {authStatus === 'submitting' ? 'Signing in...' : 'Sign in'}
                  </span>
                </button>

                <div className="flex items-start gap-2.5 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Protected by Supabase Auth &amp; Row Level Security. Only
                    demo sign-in data is enabled in this preview.
                  </span>
                </div>
              </form>
            </div>

            {/* Free Gemini 4 Hydrogen Advisor preview available right away */}
            <div className="lg:col-span-7">
              <GeminiAdvisorCard />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {isDemoSession && (
              <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200">
                Active in <strong>Preview Session</strong> ({user.email}).
                Add <code className="font-mono">SUPABASE_URL</code> and{' '}
                <code className="font-mono">SUPABASE_ANON_KEY</code> in{' '}
                <code className="font-mono">.env</code> to persist profiles and records in Supabase.
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              {/* Saved Farmer Profile */}
              <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-5">
                <h2 className="font-serif text-2xl font-normal text-white">
                  Farmer &amp; FPO Profile
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Signed in · {user.email}
                </p>

                <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                  <FormStatusBanner
                    status={profileStatus}
                    message={profileMessage}
                  />

                  <div>
                    <label
                      htmlFor="prof-name"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Full Name
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="prof-village"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        Village
                      </label>
                      <input
                        id="prof-village"
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="Village"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prof-fpo"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        FPO Name
                      </label>
                      <input
                        id="prof-fpo"
                        type="text"
                        value={fpoName}
                        onChange={(e) => setFpoName(e.target.value)}
                        placeholder="FPO name"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="prof-lang"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Voice Alert Language
                    </label>
                    <select
                      id="prof-lang"
                      value={preferredLanguage}
                      onChange={(e) =>
                        setPreferredLanguage(
                          e.target.value as 'English' | 'Marathi' | 'Hindi'
                        )
                      }
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={profileStatus === 'submitting'}
                    className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:opacity-60"
                  >
                    {profileStatus === 'submitting' ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>

              {/* Gemini 4 Hydrogen Advisor */}
              <div className="lg:col-span-7">
                <GeminiAdvisorCard onSaved={loadActivity} />
              </div>
            </div>

            {/* Saved Supabase Activity */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-normal text-white">
                    My Enrolments
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('/membership/care')}
                    className="cursor-pointer text-xs font-medium text-emerald-400 hover:underline"
                  >
                    + New Enrolment
                  </button>
                </div>

                {enrolments.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-400">
                    No enrolments submitted from this account yet.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-zinc-800">
                    {enrolments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium capitalize text-white">
                            {item.tier.replace('-', ' ')} · {item.acres} acres
                          </p>
                          <p className="text-xs text-zinc-400">
                            {item.village} · {item.fpo_name}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-emerald-400">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-normal text-white">
                    Saved Fertiliser &amp; Advisor Notes
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('/fertiliser/soil-test')}
                    className="cursor-pointer text-xs font-medium text-emerald-400 hover:underline"
                  >
                    + Fertiliser Request
                  </button>
                </div>

                {fertiliserRequests.length === 0 && advisorQueries.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-400">
                    No saved fertiliser requests or advisor notes yet.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-zinc-800">
                    {fertiliserRequests.map((req) => (
                      <div key={req.id} className="py-3 text-sm">
                        <p className="font-medium text-white">
                          {req.crop} ({req.season}) · {req.acres} acres
                        </p>
                        <p className="text-xs text-zinc-400">
                          Soil: {req.soil_type}
                        </p>
                      </div>
                    ))}
                    {advisorQueries.map((q) => (
                      <div key={q.id} className="py-3 text-sm">
                        <p className="font-medium text-white">{q.question}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                          {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
