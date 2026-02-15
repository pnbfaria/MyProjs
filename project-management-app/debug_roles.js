
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log('Fetching roles...');
    const { data, error } = await supabase
        .from('role')
        .select('*');

    if (error) {
        console.error('Error fetching roles:', error);
    } else {
        console.log('Roles found:', data);
        console.log('Count:', data.length);
        if (data.length > 0) {
            console.log('First role structure:', Object.keys(data[0]));
        }
    }
}

checkRoles();
