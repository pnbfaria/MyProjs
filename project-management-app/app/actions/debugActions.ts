'use server'

import { db } from '@/lib/db'

export async function testDatabaseConnection() {
    const results: any = {}
    
    // Test environment variables
    results.envVars = {
        url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        keyExists: false, // Legacy fallback
        keyLength: 0      // Legacy fallback
    }

    try {
        const { rows: projectRows, rowCount: projectCount } = await db.query('SELECT * FROM project LIMIT 2')
        const { rows: projectTotalRows } = await db.query('SELECT COUNT(*) as exact_count FROM project')
        
        results.projectTable = {
            success: true,
            error: null,
            count: parseInt(projectTotalRows[0].exact_count),
            sampleData: projectRows || []
        }
    } catch (err: any) {
        results.projectTable = {
            success: false,
            error: err.message,
            count: 0
        }
    }

    try {
        const { rows: userRows, rowCount: userCount } = await db.query('SELECT * FROM appuser LIMIT 2')
        const { rows: userTotalRows } = await db.query('SELECT COUNT(*) as exact_count FROM appuser')

        results.appuserTable = {
            success: true,
            error: null,
            count: parseInt(userTotalRows[0].exact_count),
            sampleData: userRows || []
        }
    } catch (err: any) {
        results.appuserTable = {
            success: false,
            error: err.message,
            count: 0
        }
    }

    return results
}

export async function getRiskSchema() {
    try {
        const { rows } = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'risk'
        `);
        return { success: true, columns: rows };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
