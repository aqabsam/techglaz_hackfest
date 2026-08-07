/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { allowedLoginEmail, allowedLoginPassword } from '../lib/firebase';
import { fetchTeacherCredentials, saveTeacherCredentials } from '../services/realtimeDb';
const LOCAL_SESSION_KEY = 'attenzo-local-session';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  className?: string | null;
  section?: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function ensureAllowed(email: string) {
  return email.trim().toLowerCase() === allowedLoginEmail;
}

function writeLocalSession(email: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_SESSION_KEY, email);
}

function clearLocalSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const localSessionEmail =
      typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_SESSION_KEY) : null;

    if (localSessionEmail && ensureAllowed(localSessionEmail)) {
      return {
        uid: localSessionEmail,
        email: localSessionEmail,
        displayName: 'Teacher',
        className: null,
        section: null,
      };
    }

    return null;
  });
  const loading = false;
  const authReady = true;

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      authReady,
      signIn: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!ensureAllowed(normalizedEmail)) {
          throw new Error(`Only ${allowedLoginEmail} can access this app.`);
        }

        const databaseCredential = await fetchTeacherCredentials();
        if (
          databaseCredential?.email?.trim().toLowerCase() === normalizedEmail &&
          databaseCredential.password === password
        ) {
          writeLocalSession(normalizedEmail);
          setUser({
            uid: normalizedEmail,
            email: normalizedEmail,
            displayName: databaseCredential.name || 'Teacher',
            className: databaseCredential.className || null,
            section: databaseCredential.section || null,
          });
          return;
        }

        if (normalizedEmail === allowedLoginEmail && password === allowedLoginPassword) {
          await saveTeacherCredentials({
            email: normalizedEmail,
            password,
            name: 'Teacher',
            className: '',
            section: '',
          });

          writeLocalSession(normalizedEmail);
          setUser({
            uid: normalizedEmail,
            email: normalizedEmail,
            displayName: 'Teacher',
            className: '',
            section: '',
          });
          return;
        }

        throw new Error('Teacher credentials were not found. Check your sign-in details.');
      },
      signUp: async (name, email, password) => {
        if (!ensureAllowed(email)) {
          throw new Error(`Account created, but only ${allowedLoginEmail} is allowed to use the app.`);
        }

        await saveTeacherCredentials({
          email: email.trim().toLowerCase(),
          name,
          password,
        });

        writeLocalSession(email.trim().toLowerCase());
        setUser({
          uid: email.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          displayName: name || 'Teacher',
          className: '',
          section: '',
        });
      },
      logout: async () => {
        clearLocalSession();
        setUser(null);
      },
    };
  }, [authReady, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
