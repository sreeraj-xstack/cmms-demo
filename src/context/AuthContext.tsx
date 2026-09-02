'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthContextType, UserProfile, UserRole } from '@/types/auth';
import { User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  const resolveUserProfile = async (authUser: User): Promise<UserProfile> => {
    const defaultRole = (authUser.user_metadata?.role as UserRole) || 'operator';
    const defaultName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';

    const fallbackProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: defaultName,
      role: defaultRole,
      department: 'Maintenance Operations',
    };

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile && !error) {
        return {
          id: profile.id,
          email: profile.email || authUser.email || '',
          full_name: profile.full_name || defaultName,
          role: (profile.role as UserRole) || defaultRole,
          department: profile.department || 'Maintenance Operations',
        };
      }
    } catch (e) {
      console.warn('Profiles table query fallback used:', e);
    }

    return fallbackProfile;
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await resolveUserProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await resolveUserProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const profile = await resolveUserProfile(data.user);
        setUser(profile);
      }

      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Authentication failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const profile = await resolveUserProfile(data.user);
        setUser(profile);
      }

      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Account creation failed' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role || null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
