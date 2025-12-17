import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: Session['user'] | null;
  subscriptionTier: string | null;
  setSubscriptionTier: (tier: string | null) => void;
  signIn: (email: string, password: string) => Promise<Session['user'] | null>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string, redirectUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  subscriptionTier: null,
  setSubscriptionTier: () => {},
  signIn: async () => null,
  signUp: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('login_id', session.user.id)
            .single();
          setSubscriptionTier(data?.tier || null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) setUser(data.user);
  };

  const resetPassword = async (email: string, redirectUrl: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        subscriptionTier, 
        setSubscriptionTier,
        signIn,
        signUp,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
