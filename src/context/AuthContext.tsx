import type { User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ensureAndFetchUserProfile,
  getSupabaseClient,
  signOutUser,
  type UserProfile,
} from '../lib/supabase';

interface DemoSessionInput {
  provider: 'google' | 'phone';
  email?: string;
  phone?: string;
  fullName?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isDemoSession: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  startDemoSession: (input: DemoSessionInput) => void;
  updateDemoProfile: (patch: Partial<UserProfile>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isDemoSession: false,
  loading: false,
  refreshProfile: async () => {},
  startDemoSession: () => {},
  updateDemoProfile: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDemoSession, setIsDemoSession] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfileForUser = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const fetched = await ensureAndFetchUserProfile(currentUser);
    setProfile(fetched);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && !isDemoSession) {
      await loadProfileForUser(user);
    }
  }, [user, isDemoSession, loadProfileForUser]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      if (sessionUser) {
        setIsDemoSession(false);
        setUser(sessionUser);
        await loadProfileForUser(sessionUser);
      }
      if (active) setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;
        const sessionUser = session?.user ?? null;
        if (sessionUser) {
          setIsDemoSession(false);
          setUser(sessionUser);
          await loadProfileForUser(sessionUser);
        } else if (!isDemoSession) {
          setUser(null);
          setProfile(null);
        }
        if (active) setLoading(false);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileForUser, isDemoSession]);

  const startDemoSession = useCallback((input: DemoSessionInput) => {
    const demoId = 'demo-farmer-preview';
    const demoUser = {
      id: demoId,
      email: input.email,
      phone: input.phone,
      app_metadata: { provider: input.provider },
      user_metadata: { full_name: input.fullName || 'Rajesh Sawant' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const demoProfile: UserProfile = {
      id: demoId,
      auth_provider: input.provider,
      email: input.email ?? null,
      phone: input.phone ?? null,
      full_name: input.fullName || 'Rajesh Sawant',
      village: 'Lanja',
      fpo_name: 'Ratnagiri Agro FPC',
      preferred_language: 'Marathi',
    };

    setIsDemoSession(true);
    setUser(demoUser);
    setProfile(demoProfile);
    setLoading(false);
  }, []);

  const updateDemoProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const signOut = useCallback(async () => {
    if (!isDemoSession) {
      await signOutUser();
    }
    setIsDemoSession(false);
    setUser(null);
    setProfile(null);
  }, [isDemoSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isDemoSession,
        loading,
        refreshProfile,
        startDemoSession,
        updateDemoProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
