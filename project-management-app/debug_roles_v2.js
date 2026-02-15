
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    console.log('Env content length:', envContent.length);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log('Fetching from "role"...');
    const { data: roleData, error: roleError } = await supabase.from('role').select('*');

    if (roleError) {
        console.error('Error fetching "role":', roleError.message);
    } else {
        console.log('"role" table count:', roleData.length);
        if (roleData.length > 0) console.log('Sample:', roleData[0]);
    }

    console.log('Fetching from "roles"...');
    const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');

    if (rolesError) {
        console.error('Error fetching "roles":', rolesError.message);
    } else {
        console.log('"roles" table count:', rolesData.length);
        if (rolesData.length > 0) console.log('Sample:', rolesData[0]);
    }
}

checkRoles();
