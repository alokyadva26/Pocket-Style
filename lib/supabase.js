import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wysuoyvmxnsdkvzeuokx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c3VveXZteG5zZGt2emV1b2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTU3ODAsImV4cCI6MjA5NDg3MTc4MH0.xNnieaT_mgBnCuZq16Q3nqjfz9WNqgG_dZeluYMrn7Y'

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
)