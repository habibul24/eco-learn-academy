
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wufjtlnxiwipdjqsntqk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Zmp0bG54aXdpcGRscXNudHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTExNjAsImV4cCI6MjA2NTUyNzE2MH0.kmfmAWpH_8IxIro1J1hd_mwbvwKCEYzaJhrOWY4Ohxw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
