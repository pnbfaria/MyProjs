'use server'

import { db } from '@/lib/db'
import { Registration, Role, AppUser, TimeSheet } from '@/types/database'

export async function getResourceConsumptionMetadata(projectId: number) {
    try {
        // We use separate try-catches or selective queries because the 'registration' table 
        // might not exist in this version of the schema.
        const [rolesRes, usersRes] = await Promise.all([
            db.query('SELECT * FROM role'),
            db.query('SELECT * FROM appuser')
        ]);

        let registrations: Registration[] = [];
        try {
            const regRes = await db.query('SELECT * FROM registration WHERE projectid = $1', [projectId]);
            registrations = regRes.rows as Registration[];
        } catch (e) {
            console.warn("Registration table not found or query failed, using empty array.");
        }

        return {
            registrations,
            roles: rolesRes.rows as Role[],
            users: usersRes.rows as AppUser[]
        }
    } catch (error) {
        console.error('Error fetching resource metadata:', error)
        throw new Error('Failed to fetch resource metadata')
    }
}

export async function upsertTimesheet(data: Omit<TimeSheet, 'timesheetid'>) {
    try {
        // We use ON CONFLICT to act as an upsert. 
        // Note: project_management_app relies on the specific constraints 'useremail, projectid, month, year' 
        // being unique in the timesheet table.
        const query = `
            INSERT INTO timesheet (
                projectid, useremail, month, year, workload, estworkload, 
                createdat, externaldevcount, brandeddevyearscount, roleid
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
            ON CONFLICT (useremail, projectid, month, year) DO UPDATE SET
                workload = EXCLUDED.workload,
                estworkload = EXCLUDED.estworkload,
                roleid = COALESCE(EXCLUDED.roleid, timesheet.roleid)
        `

        const values = [
            data.projectid,
            data.useremail,
            data.month,
            data.year,
            data.workload,
            data.estworkload,
            data.createdat || new Date().toISOString(),
            data.externaldevcount || 0,
            data.brandeddevyearscount || 0,
            data.roleid || null // Add roleid if available
        ]

        await db.query(query, values)
    } catch (error) {
        console.error('Error upserting timesheet:', error)
        throw new Error('Failed to upsert timesheet')
    }
}
