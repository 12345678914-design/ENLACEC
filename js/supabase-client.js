// Importa el CDN de Supabase en tu HTML o usa npm
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ikvxleiedmvpujxwiwqr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tgGV84FCONxMGg4QX6BLSQ_tF54tjQ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);