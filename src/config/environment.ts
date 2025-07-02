
// Environment configuration for deployment
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://wufjtlnxiwipdlqsntqk.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Zmp0bG54aXdpcGRscXNudHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTExNjAsImV4cCI6MjA2NTUyNzE2MH0.kmfmAWpH_8IxIro1J1hd_mwbvwKCEYzaJhrOWY4Ohxw"
  },
  app: {
    name: "EcoLearn Academy",
    description: "Navigate your sustainability journey with clarity"
  }
};

// Validate required environment variables
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error("Missing required Supabase environment variables");
}
