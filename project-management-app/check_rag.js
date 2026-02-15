
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRagStatus() {
    try {
        const { data, error } = await supabase.from('ragstatus').select('*').limit(1);
        if (error) {
            console.error('Error fetching ragstatus:', error);
        } else {
            console.log('RagStatus data:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkRagStatus();
