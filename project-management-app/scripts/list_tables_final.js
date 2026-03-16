
const { Client } = require('pg');

async function debug() {
    const client = new Client({
        user: 'project_app_user',
        password: 'Lo9@7J!gK4??9',
        host: 'localhost',
        port: 5433,
        database: 'ProjManagement'
    });
    await client.connect();
    
    console.log("--- TABLES IN PUBLIC SCHEMA ---");
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    tables.rows.forEach(r => console.log(r.table_name));
    
    await client.end();
}

debug();
