
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
    
    console.log("--- ALL TABLES IN DB ---");
    const tables = await client.query("SELECT shelf_name = table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')");
    tables.rows.forEach(r => console.log(`${r.shelf_name}.${r.table_name}`));
    
    await client.end();
}

debug();
