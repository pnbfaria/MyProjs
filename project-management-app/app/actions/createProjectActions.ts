'use server'

import { db } from '@/lib/db'
import { Client, AppUser, PriceType } from '@/types/database'

export async function getCreateProjectFormData() {
    try {
        const [clientsRes, usersRes, priceTypesRes] = await Promise.all([
            db.query('SELECT * FROM client ORDER BY name'),
            db.query('SELECT * FROM appuser WHERE isactive = true ORDER BY firstname'),
            db.query('SELECT * FROM pricingtype ORDER BY name')
        ])

        return {
            clients: clientsRes.rows as Client[],
            users: usersRes.rows as AppUser[],
            priceTypes: priceTypesRes.rows as PriceType[],
        }
    } catch (error) {
        console.error('Error fetching form data:', error)
        throw new Error('Failed to fetch form data')
    }
}

export async function createProject(projectData: any) {
    try {
        const fields = Object.keys(projectData).join(', ')
        const placeholders = Object.keys(projectData).map((_, i) => `$${i + 1}`).join(', ')
        const values = Object.values(projectData)
        
        const result = await db.query(
            `INSERT INTO project (${fields}) VALUES (${placeholders}) RETURNING *`,
            values
        )
        return result.rows[0]
    } catch (error) {
        console.error('Error creating project:', error)
        throw new Error('Failed to create project')
    }
}
