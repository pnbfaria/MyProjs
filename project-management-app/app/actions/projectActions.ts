'use server'

import { db } from '@/lib/db'
import { Project, AppUser } from '@/types/database'

export interface ProjectWithManagers extends Project {
    accountManager?: AppUser
    deliveryManager?: AppUser
}

export async function getProjects(): Promise<ProjectWithManagers[]> {
    try {
        const result = await db.query('SELECT * FROM project ORDER BY createdon DESC')
        const projects = result.rows as Project[]
        
        // Fetch managers for each project
        const projectsWithManagers = await Promise.all(
            projects.map(async (project) => {
                let accountManager = undefined
                let deliveryManager = undefined

                if(project.accountmanageremail) {
                    const accResult = await db.query('SELECT * FROM appuser WHERE email = $1', [project.accountmanageremail])
                    if(accResult.rows.length > 0) {
                        accountManager = accResult.rows[0]
                    }
                }

                if(project.deliverymanageremail) {
                    const delResult = await db.query('SELECT * FROM appuser WHERE email = $1', [project.deliverymanageremail])
                    if(delResult.rows.length > 0) {
                        deliveryManager = delResult.rows[0]
                    }
                }

                return {
                    ...project,
                    accountManager,
                    deliveryManager,
                }
            })
        )

        return projectsWithManagers
    } catch (error) {
        console.error('Error fetching projects:', error)
        throw new Error('Failed to fetch projects')
    }
}

export async function deleteProject(projectId: number): Promise<void> {
    try {
        // Since we are not using an ORM with built-in cascading, we should manually delete dependent records or assume DB has CASCADE ON DELETE.
        // Assuming the previous behavior where the app manually cleared it:
        
        await db.query('DELETE FROM ragstatus WHERE projectid = $1', [projectId])
        await db.query('DELETE FROM timesheet WHERE projectid = $1', [projectId])
        await db.query('DELETE FROM risk WHERE projectid = $1', [projectId])
        await db.query('DELETE FROM deliverable WHERE projectid = $1', [projectId])
        await db.query('DELETE FROM achievement WHERE projectid = $1', [projectId])
        await db.query('DELETE FROM registration WHERE projectid = $1', [projectId])

        // Finally delete the project
        await db.query('DELETE FROM project WHERE projectid = $1', [projectId])
    } catch (error) {
        console.error('Error deleting project:', error)
        throw new Error('Failed to delete project')
    }
}
