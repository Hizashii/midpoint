import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// TODO: Replace with real Supabase URL and Anon Key when setting up real backend
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Custom storage wrapper to handle SSR/Server environment where 'window' is not defined
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

const safeStorage = {
  getItem: async (key: string) => {
    if (isServer) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isServer) return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isServer) return;
    return AsyncStorage.removeItem(key);
  },
};

export const isPlaceholder = supabaseUrl.includes('placeholder-project');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
