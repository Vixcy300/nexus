import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL      || 'https://xhfrkjxsplxzhedypelm.supabase.co';
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_j6SZ2A39iXe_MPLrAxaKJQ_XFpRoHr5';

export const supabase = createClient(URL, KEY);
