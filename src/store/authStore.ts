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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, isAuthenticated: !!session });
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          set({ user: { id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url } });
        }
      } else {
        set({ user: null });
      }
    });
  },

  login: async (email: string) => {
    // Defensive check for non-string input
    const emailString = typeof email === 'string' ? email : 'guest@example.com';
    
    // For prototype, we simulate a sign in or just ensure profile exists for the current auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: emailString.split('@')[0],
          avatar_url: `https://i.pravatar.cc/150?u=${user.id}`
        })
        .select()
        .single();

      if (profile) {
        set({ 
          user: { id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url },
          isAuthenticated: true 
        });
      }
    } else {
      // If no auth user (demo mode), set a mock
      set({ 
        user: { id: 'demo_user', name: emailString.split('@')[0], avatarUrl: 'https://i.pravatar.cc/150?u=demo' },
        isAuthenticated: true 
      });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  setOnboarded: (value) => set({ isOnboarded: value }),
}));
