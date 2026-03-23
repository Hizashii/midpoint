import { create } from 'zustand';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  initialize: () => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setOnboarded: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isOnboarded: false, 
  
  initialize: async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      set({ 
        session, 
        user: profile ? { 
          id: profile.id, 
          name: profile.full_name, 
          avatarUrl: profile.avatar_url 
        } : null,
        isAuthenticated: true 
      });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ 
          session,
          isAuthenticated: true,
          user: profile ? { id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url } : null 
        });
      } else {
        set({ user: null, session: null, isAuthenticated: false });
      }
    });
  },

  login: async (email: string) => {
    try {
      // In a production app, this would use supabase.auth.signInWithOtp or signInWithPassword
      // For this phase, we ensure the profile exists for the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            full_name: email.split('@')[0] || 'User',
            avatar_url: `https://i.pravatar.cc/150?u=${user.id}`,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        set({ 
          user: { id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url },
          isAuthenticated: true 
        });
      } else {
        // Fallback for demo/dev mode without real Auth
        set({ 
          user: { id: 'demo_user', name: 'Demo Guest', avatarUrl: 'https://i.pravatar.cc/150?u=demo' },
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Login/Profile Sync Error:', error);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  setOnboarded: (value) => set({ isOnboarded: value }),
}));
