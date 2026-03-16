
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
    
    console.log("--- APPUSER EMAILS ---");
    const users = await client.query('SELECT email, firstname, lastname FROM appuser');
    users.rows.forEach(r => console.log(`'${r.email}' (${r.firstname} ${r.lastname})`));
    
    console.log("\n--- ROLE DEFINITIONS ---");
    const roles = await client.query('SELECT roleid, name FROM role');
    roles.rows.forEach(r => console.log(`ID: ${r.roleid}, Name: ${r.name}`));
    
    console.log("\n--- REGISTRATION EMAILS ---");
    const regs = await client.query('SELECT DISTINCT email FROM registration');
    regs.rows.forEach(r => console.log(`'${r.email}'`));
    
    console.log("\n--- TIMESHEET EMAILS ---");
    const ts = await client.query('SELECT DISTINCT useremail FROM timesheet');
    ts.rows.forEach(r => console.log(`'${r.useremail}'`));
    
    await client.end();
}

debug();
