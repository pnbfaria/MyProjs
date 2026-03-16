'use server'

import { db } from '@/lib/db'
import { ProjectWithManagers } from './projectActions'
import { Risk, Deliverable, Achievement, Decision, TimeSheet, RagStatus, Role, Project, AppUser } from '@/types/database'

export async function getProjectDetails(projectId: number) {
    try {
        const { rows: projectRows } = await db.query('SELECT * FROM project WHERE projectid = $1', [projectId])
        if (projectRows.length === 0) return null

        const project = projectRows[0] as Project

        let accountManager = null
        if (project.accountmanageremail) {
            const { rows } = await db.query('SELECT * FROM appuser WHERE email = $1', [project.accountmanageremail])
            if (rows.length > 0) accountManager = rows[0]
        }

        let deliveryManager = null
        if (project.deliverymanageremail) {
            const { rows } = await db.query('SELECT * FROM appuser WHERE email = $1', [project.deliverymanageremail])
            if (rows.length > 0) deliveryManager = rows[0]
        }

        const projectWithManagers: ProjectWithManagers = {
            ...project,
            accountManager,
            deliveryManager,
        }

        const [risksRes, deliverablesRes, achievementsRes, decisionsRes, timeSheetsRes, ragStatusesRes, rolesRes] = await Promise.all([
            db.query('SELECT * FROM risk WHERE projectid = $1', [projectId]),
            db.query('SELECT * FROM deliverable WHERE projectid = $1', [projectId]),
            db.query('SELECT * FROM achievement WHERE projectid = $1', [projectId]),
            db.query('SELECT * FROM decision WHERE projectid = $1', [projectId]),
            db.query('SELECT * FROM timesheet WHERE projectid = $1', [projectId]),
            db.query('SELECT * FROM ragstatus WHERE projectid = $1 ORDER BY createdon DESC', [projectId]),
            db.query('SELECT * FROM role'),
        ])

        return {
            project: projectWithManagers,
            risks: risksRes.rows as Risk[],
            deliverables: deliverablesRes.rows as Deliverable[],
            achievements: achievementsRes.rows as Achievement[],
            decisions: decisionsRes.rows as Decision[],
            timeSheets: timeSheetsRes.rows as TimeSheet[],
            ragStatuses: ragStatusesRes.rows as RagStatus[],
            roles: rolesRes.rows as Role[],
        }
    } catch (error) {
        console.error('Error fetching project details:', error)
        throw new Error('Failed to fetch project details')
    }
}

// Reusable Database Mutation Functions

export async function deleteEntity(table: string, idField: string, idValue: number) {
    // Only allow specific tables to prevent SQL injection
    const allowedTables = ['risk', 'deliverable', 'achievement', 'timesheet', 'ragstatus', 'decision']
    if (!allowedTables.includes(table)) throw new Error('Invalid table')

    try {
        await db.query(`DELETE FROM "${table}" WHERE "${idField}" = $1`, [idValue])
    } catch (error) {
        console.error(`Error deleting from ${table}:`, error)
        throw new Error(`Failed to delete from ${table}`)
    }
}

export async function updateProject(projectId: number, data: any) {
    try {
        const fields = Object.keys(data)
        const values = Object.values(data)
        const setClause = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ')
        
        await db.query(`UPDATE project SET ${setClause} WHERE projectid = $1`, [projectId, ...values])
    } catch (error) {
        console.error('Error updating project:', error)
        throw new Error('Failed to update project')
    }
}

export async function insertRagStatus(data: Omit<RagStatus, 'ragid'>) {
    try {
        const fields = Object.keys(data).map(f => `"${f}"`).join(', ')
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
        const values = Object.values(data)
        
        await db.query(`INSERT INTO ragstatus (${fields}) VALUES (${placeholders})`, values)
    } catch (error) {
        console.error('Error inserting rag status:', error)
        throw new Error('Failed to insert rag status')
    }
}

export async function updateEntity(table: string, idField: string, idValue: number, data: any) {
    const allowedTables = ['risk', 'deliverable', 'achievement', 'timesheet', 'ragstatus', 'decision']
    if (!allowedTables.includes(table)) throw new Error('Invalid table')

    try {
        const fields = Object.keys(data)
        const values = Object.values(data)
        const setClause = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ')
        
        await db.query(`UPDATE "${table}" SET ${setClause} WHERE "${idField}" = $1`, [idValue, ...values])
    } catch (error) {
        console.error(`Error updating ${table}:`, error)
        throw new Error(`Failed to update ${table}`)
    }
}

export async function insertEntity(table: string, data: any) {
    const allowedTables = ['risk', 'deliverable', 'achievement', 'timesheet', 'decision']
    if (!allowedTables.includes(table)) throw new Error('Invalid table')

    try {
        const fields = Object.keys(data).map(f => `"${f}"`).join(', ')
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
        const values = Object.values(data)
        
        await db.query(`INSERT INTO "${table}" (${fields}) VALUES (${placeholders})`, values)
    } catch (error) {
        console.error(`Error inserting into ${table}:`, error)
        throw new Error(`Failed to insert into ${table}`)
    }
}

export async function insertMultipleTimesheets(dataArray: any[]) {
    try {
        if(dataArray.length === 0) return

        // Simple loop for now instead of complex multi-row inserts
        for (const data of dataArray) {
            const fields = Object.keys(data).join(', ')
            const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
            const values = Object.values(data)
            await db.query(`INSERT INTO timesheet (${fields}) VALUES (${placeholders})`, values)
        }
    } catch (error) {
        console.error('Error inserting timesheets:', error)
        throw new Error('Failed to insert timesheets')
    }
}
