import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzrmplgvjssgycfsayg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0enJtcGxndmpzc2d5Y2ZzYXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzIwMDMsImV4cCI6MjEwNTgwODAwM30.CkrklvTOsg6xc79fKk8NHvzuz8jvVSG_deDpvVIYquI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('listings').select('*').limit(1);
    if (error) {
      console.log('Supabase Query Response:', error.message);
    } else {
      console.log('Supabase Query Success! Data rows:', data ? data.length : 0);
    }

    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Supabase Auth Endpoint Status:', authError ? authError.message : 'Auth Endpoint Active! Session:', authData.session ? 'Active Session' : 'No active session');
  } catch (err) {
    console.error('Connection Error:', err.message);
  }
}

testConnection();
