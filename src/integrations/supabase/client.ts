
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vkvsbejtpgbxqioiicxh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdnNiZWp0cGdieHFpb2lpY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjU4MjgsImV4cCI6MjA1NzIwMTgyOH0.cuSmQ9rGSZXOggxTLSTbKc5Qq_EpjcIsN_sXe39K-R0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Configure with optimized timeout and caching options for performance
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Reduces unnecessary redirects
  },
  global: {
    headers: { 
      'x-application-name': 'water-mgmt-dashboard',
      'Cache-Control': 'no-cache', // Prevent stale data issues
    },
    fetch: (url: RequestInfo, init?: RequestInit) => {
      // Set reasonable timeouts based on operation type
      const isFileUpload = typeof init?.body === 'object' && init?.body instanceof FormData;
      const timeout = isFileUpload ? 120000 : 30000; // 2 minutes for uploads, 30 seconds for other operations
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      return fetch(url, {
        ...init,
        signal: controller.signal,
        cache: 'no-store', // Force fresh data on each request
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  realtime: {
    timeout: 30000, // 30 second timeout for realtime connections
  },
  db: {
    schema: 'public',
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseOptions);
