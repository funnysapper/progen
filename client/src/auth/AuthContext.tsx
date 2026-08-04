import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokenStore } from '../api/client';
import { authApi, type UserProfile } from '../api/endpoints';

interface AuthValue {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(Boolean(tokenStore.access));
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load the profile (for the avatar/menu) whenever we become authenticated.
  async function loadUser() {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    }
  }

  // On first load, if we already have a token, fetch the profile.
  useEffect(() => {
    if (tokenStore.access) loadUser();
  }, []);

  // When the API client can't recover a session (refresh failed), it fires
  // 'auth:logout'. Dropping authed state makes the protected route redirect
  // the user to /login automatically.
  useEffect(() => {
    const onForcedLogout = () => {
      setAuthed(false);
      setUser(null);
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      isAuthenticated: authed,
      user,
      async login(email, password) {
        const { tokens } = await authApi.login(email, password);
        tokenStore.set(tokens);
        setAuthed(true);
        await loadUser();
      },
      async register(name, email, password) {
        await authApi.register(name, email, password);
        // Auto sign-in after registering for a smooth first experience.
        const { tokens } = await authApi.login(email, password);
        tokenStore.set(tokens);
        setAuthed(true);
        await loadUser();
      },
      async loginWithGoogle(idToken) {
        const tokens = await authApi.google(idToken);
        tokenStore.set(tokens);
        setAuthed(true);
        await loadUser();
      },
      async logout() {
        const refresh = tokenStore.refresh;
        if (refresh) {
          try {
            await authApi.logout(refresh);
          } catch {
            /* best-effort */
          }
        }
        tokenStore.clear();
        setAuthed(false);
        setUser(null);
      },
    }),
    [authed, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
