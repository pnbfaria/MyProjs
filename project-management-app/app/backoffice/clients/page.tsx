'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types/database'
import styles from '../users/page.module.css'

interface ClientSummary {
    accountManagerEmail: string
    projectCount: number
    totalBudget: number
    projects: Project[]
}

export default function ClientsBackoffice() {
    const [clients, setClients] = useState<ClientSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClients()
    }, [])

    async function fetchClients() {
        try {
            const { data: projects, error } = await supabase
                .from('project')
                .select('*')
                .order('createdon', { ascending: false })

            if (error) throw error

            // Group projects by account manager (representing different clients)
            const clientMap = new Map<string, ClientSummary>()

            projects?.forEach(project => {
                const email = project.accountmanageremail
                if (!clientMap.has(email)) {
                    clientMap.set(email, {
                        accountManagerEmail: email,
                        projectCount: 0,
                        totalBudget: 0,
                        projects: [],
                    })
                }

                const client = clientMap.get(email)!
                client.projectCount++
                client.totalBudget += project.totalbudget || 0
                client.projects.push(project)
            })

            setClients(Array.from(clientMap.values()))
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                <p>Loading clients...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Client Management</h1>
                    <p className={styles.subtitle}>Overview of all clients and their projects</p>
                </div>
            </div>

            <div className={styles.tableCard}>
                {clients.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🏢</div>
                        <h3>No clients found</h3>
                        <p>Clients will appear here once projects are created</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Account Manager Email</th>
                                <th>Number of Projects</th>
                                <th>Total Budget</th>
                                <th>Projects</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.accountManagerEmail}>
                                    <td className="font-semibold">{client.accountManagerEmail}</td>
                                    <td>
                                        <span className="badge badge-primary">
                                            {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                                        </span>
                                    </td>
                                    <td className="font-bold text-success">
                                        ${client.totalBudget.toLocaleString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {client.projects.slice(0, 3).map(project => (
                                                <Link
                                                    key={project.projectid}
                                                    href={`/project/${project.projectid}`}
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        color: 'var(--color-primary)',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    • {project.title}
                                                </Link>
                                            ))}
                                            {client.projects.length > 3 && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                                    +{client.projects.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
