import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { tokenStore } from '../api/client';
import { authApi } from '../api/endpoints';

interface AuthValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(Boolean(tokenStore.access));

  const value = useMemo<AuthValue>(
    () => ({
      isAuthenticated: authed,
      async login(email, password) {
        const { tokens } = await authApi.login(email, password);
        tokenStore.set(tokens);
        setAuthed(true);
      },
      async register(name, email, password) {
        await authApi.register(name, email, password);
        // Auto sign-in after registering for a smooth first experience.
        const { tokens } = await authApi.login(email, password);
        tokenStore.set(tokens);
        setAuthed(true);
      },
      async loginWithGoogle(idToken) {
        const tokens = await authApi.google(idToken);
        tokenStore.set(tokens);
        setAuthed(true);
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
      },
    }),
    [authed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
