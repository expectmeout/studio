
"use client";

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUserCompanyName: (companyName: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
        console.error("Sign in error:", error.message);
        return { error };
    }
    // Session update will be handled by onAuthStateChange
    return { error: null };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
    router.push('/'); // Redirect to home page after logout, which will show login form
  };

  const updateUserCompanyName = async (companyName: string) => {
    if (!user) return { error: new Error("User not authenticated") };
    setIsLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { company_name: companyName } 
    });

    if (error) {
      console.error("Error updating company name:", error.message);
      setIsLoading(false);
      return { error };
    }
    
    // Manually update the local user state to reflect the change immediately
    // Supabase onAuthStateChange might also pick this up, but this ensures UI updates.
    if (data.user) {
        setUser(data.user);
    }
    
    setIsLoading(false);
    return { error: null };
  };

  const value = {
    session,
    user,
    isLoading,
    signInWithPassword,
    signOut,
    updateUserCompanyName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

