
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://wufjtlnxiwipdjqsntqk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Zmp0bG54aXdpcGRscXNudHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTExNjAsImV4cCI6MjA2NTUyNzE2MH0.kmfmAWpH_8IxIro1J1hd_mwbvwKCEYzaJhrOWY4Ohxw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web/2.50.0'
    },
    fetch: (url, options = {}) => {
      console.log('[Supabase] Making request to:', url);
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).catch(error => {
        console.error('[Supabase] Fetch error:', error);
        throw error;
      });
    }
  },
  db: {
    schema: 'public'
  }
})

export function validateSupabaseClient() {
  console.log('[Supabase] Validating client...');
  
  if (!supabase) {
    console.error('[Supabase] Client is null or undefined');
    throw new Error("Supabase client is not initialized");
  }
  
  if (typeof supabase.from !== 'function') {
    console.error('[Supabase] Client missing .from method');
    throw new Error("Supabase client is not properly initialized");
  }
  
  // Test the URL and key
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing URL or key');
    throw new Error("Supabase URL or key is missing");
  }
  
  console.log('[Supabase] Client validation passed');
  return true;
}

// Test connection on module load
console.log('[Supabase] Client initialized with URL:', supabaseUrl);
