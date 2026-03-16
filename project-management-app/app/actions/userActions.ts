'use server'

import { db } from '@/lib/db'
import { AppUser } from '@/types/database'

export async function getActiveUsers(): Promise<AppUser[]> {
    try {
        const result = await db.query('SELECT * FROM appuser WHERE isactive = true ORDER BY firstname')
        return result.rows as AppUser[]
    } catch (error) {
        console.error('Error fetching active users:', error)
        throw new Error('Failed to fetch active users')
    }
}

export async function getUsers(): Promise<AppUser[]> {
    try {
        const result = await db.query('SELECT * FROM appuser ORDER BY joinedat DESC')
        return result.rows as AppUser[]
    } catch (error) {
        console.error('Error fetching users:', error)
        throw new Error('Failed to fetch users')
    }
}

export async function createUser(userData: { email: string, firstname: string, lastname: string }): Promise<AppUser> {
    try {
        const result = await db.query(
            'INSERT INTO appuser (email, firstname, lastname, joinedat, isactive) VALUES ($1, $2, $3, NOW(), true) RETURNING *',
            [userData.email, userData.firstname, userData.lastname]
        )
        return result.rows[0] as AppUser
    } catch (error) {
        console.error('Error creating user:', error)
        throw new Error('Failed to create user')
    }
}

export async function deleteUser(email: string): Promise<void> {
    try {
        await db.query('DELETE FROM appuser WHERE email = $1', [email])
    } catch (error) {
        console.error('Error deleting user:', error)
        throw new Error('Failed to delete user')
    }
}

export async function updateUser(oldEmail: string, userData: { email: string, firstname: string, lastname: string, isactive: boolean }): Promise<AppUser> {
    const client = await db.getClient()
    try {
        await client.query('BEGIN')

        if (oldEmail === userData.email) {
            // Simple update if email hasn't changed
            const updateResult = await client.query(
                'UPDATE appuser SET firstname = $1, lastname = $2, isactive = $3 WHERE email = $4 RETURNING *',
                [userData.firstname, userData.lastname, userData.isactive, oldEmail]
            )
            await client.query('COMMIT')
            return updateResult.rows[0] as AppUser
        } else {
            // Email changed - use "Clone-Update-Delete" strategy to bypass FK constraints
            console.log(`Cascading email update via clone from ${oldEmail} to ${userData.email}`)
            
            // 1. Check if new email already exists
            const checkResult = await client.query('SELECT 1 FROM appuser WHERE email = $1', [userData.email])
            if (checkResult.rows.length > 0) {
                throw new Error('New email already in use')
            }

            // 2. Fetch old user's joinedat
            const oldUserRes = await client.query('SELECT joinedat FROM appuser WHERE email = $1', [oldEmail])
            if (oldUserRes.rows.length === 0) throw new Error('User not found')
            const joinedAt = oldUserRes.rows[0].joinedat

            // 3. Create the NEW user entry first
            const insertResult = await client.query(
                'INSERT INTO appuser (email, firstname, lastname, isactive, joinedat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userData.email, userData.firstname, userData.lastname, userData.isactive, joinedAt]
            )

            // 4. Update all child tables to point to the NEW user
            await client.query('UPDATE project SET "accountmanageremail" = $1 WHERE "accountmanageremail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE project SET "deliverymanageremail" = $1 WHERE "deliverymanageremail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE project SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE project SET "updatedbyemail" = $1 WHERE "updatedbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE ragstatus SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE timesheet SET "useremail" = $1 WHERE "useremail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE timesheet SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE risk SET "owneremail" = $1 WHERE "owneremail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE risk SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE client SET "created_by" = $1 WHERE "created_by" = $2', [userData.email, oldEmail])
            await client.query('UPDATE achievement SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])
            await client.query('UPDATE deliverable SET "createdbyemail" = $1 WHERE "createdbyemail" = $2', [userData.email, oldEmail])

            // 5. Delete the OLD user entry
            await client.query('DELETE FROM appuser WHERE email = $1', [oldEmail])

            await client.query('COMMIT')
            return insertResult.rows[0] as AppUser
        }
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error updating user:', error)
        throw error
    } finally {
        client.release()
    }
}
