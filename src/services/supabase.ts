import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ Supabase client initialized with URL:', supabaseUrl)

// Create client with optimized auth settings to prevent lock timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sb-auth-token',
    // This is the key setting - increase timeout and disable immediate locking
    flowType: 'pkce', // Use PKCE flow which handles locks better
    debug: false, // Set to true only for debugging
  },
  // Global settings
  global: {
    headers: {
      'X-Client-Info': 'freelance-hub@1.0.0',
    },
  },
})

// Optional: Pre-warm the connection
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (err) {
    console.error('Error getting session:', err)
    return null
  }
}