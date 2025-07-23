import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log the values for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Key exists (not shown for security)' : 'Key is missing');

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Check your .env file.');
}

// Create and export the Supabase client
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  // Test the connection
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
  });
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a dummy client to prevent app crashes
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' } }),
      signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' } }),
      signOut: () => Promise.resolve({}),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

export { supabase };