
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://wufjtlnxiwipdjqsntqk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Zmp0bG54aXdpcGRscXNudHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTExNjAsImV4cCI6MjA2NTUyNzE2MH0.kmfmAWpH_8IxIro1J1hd_mwbvwKCEYzaJhrOWY4Ohxw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web/2.50.0'
    }
  }
})

export function validateSupabaseClient() {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new Error("Supabase client is not properly initialized");
  }
}
