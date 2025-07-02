
import { supabase } from "@/integrations/supabase/client";

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[SupabaseTest] Testing connection...');
    
    // Simple health check
    const { data, error } = await supabase
      .from('courses')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('[SupabaseTest] Connection test failed:', error);
      return { 
        success: false, 
        error: `Database error: ${error.message}` 
      };
    }
    
    console.log('[SupabaseTest] Connection test successful');
    return { success: true };
    
  } catch (e: any) {
    console.error('[SupabaseTest] Connection test exception:', e);
    return { 
      success: false, 
      error: `Network error: ${e?.message || 'Unknown error'}` 
    };
  }
}

export async function testSupabaseAuth(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[SupabaseTest] Testing auth connection...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[SupabaseTest] Auth test failed:', error);
      return { 
        success: false, 
        error: `Auth error: ${error.message}` 
      };
    }
    
    console.log('[SupabaseTest] Auth test successful, session:', !!session);
    return { success: true };
    
  } catch (e: any) {
    console.error('[SupabaseTest] Auth test exception:', e);
    return { 
      success: false, 
      error: `Auth network error: ${e?.message || 'Unknown error'}` 
    };
  }
}
