'use server'

import { db } from '@/lib/db'
import { Client } from '@/types/database'

export async function getClients(): Promise<Client[]> {
    try {
        const result = await db.query('SELECT * FROM client ORDER BY name')
        return result.rows as Client[]
    } catch (error) {
        console.error('Error fetching clients:', error)
        throw new Error('Failed to fetch clients')
    }
}

export async function createClient(name: string, description?: string): Promise<Client> {
    try {
        const result = await db.query(
            'INSERT INTO client (name, description, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [name, description || null]
        )
        return result.rows[0] as Client
    } catch (error) {
        console.error('Error creating client:', error)
        throw new Error('Failed to create client')
    }
}

export async function deleteClient(clientId: number): Promise<void> {
    try {
        // Simple deletion, assuming foreign keys might block it if projects exist, 
        // or cascade if set up for that.
        await db.query('DELETE FROM client WHERE id = $1', [clientId])
    } catch (error) {
        console.error('Error deleting client:', error)
        throw new Error('Failed to delete client')
    }
}
