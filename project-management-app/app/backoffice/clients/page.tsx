'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Project, Client } from '@/types/database'
import styles from '../users/page.module.css'
import { useUser } from '@/context/UserContext'

interface ClientWithStats extends Client {
    projectCount: number
    totalBudget: number
    projects: Project[]
}

export default function ClientsBackoffice() {
    const { currentUser } = useUser()
    const [clients, setClients] = useState<ClientWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    })

    useEffect(() => {
        fetchClients()
    }, [])

    async function fetchClients() {
        try {
            // Fetch explicit clients from client table
            const { data: clientsData, error: clientsError } = await supabase
                .from('Client')
                .select('*')
                .order('created_at', { ascending: false })

            if (clientsError) {
                // If table doesn't exist, we might get an error.
                // For now, let's log it.
                console.error('Error fetching clients table:', clientsError)
                if (clientsError.code === '42P01') {
                    // Table doesn't exist
                    alert('Client table does not exist. Please run the migration script.')
                }
                throw clientsError
            }

            // Fetch projects to compute stats
            // Ideally we would join, but for now fetch all and map in memory if dataset is small
            const { data: projectsData, error: projectsError } = await supabase
                .from('project')
                .select('*')

            if (projectsError) throw projectsError

            const clientsWithStats = (clientsData || []).map((client: Client) => {
                const clientProjects = (projectsData || []).filter((p: Project) => p.clientid === client.id)
                return {
                    ...client,
                    projectCount: clientProjects.length,
                    totalBudget: clientProjects.reduce((sum, p) => sum + (p.totalbudget || 0), 0),
                    projects: clientProjects
                }
            })

            setClients(clientsWithStats)
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!currentUser) {
            alert('Please select a user from the top navigation bar to perform this action.')
            return
        }

        try {
            const { error } = await supabase
                .from('Client')
                .insert([{
                    name: formData.name,
                    description: formData.description,
                    created_by: currentUser.email,
                    created_at: new Date().toISOString()
                }])

            if (error) throw error

            if (error) throw error

            setFormData({ name: '', description: '' })
            setShowForm(false)
            fetchClients() // Refresh list
        } catch (error: any) {
            console.error('Error creating client:', error)
            alert(`Error creating client: ${error.message}`)
        }
    }

    async function handleDelete(clientId: number) {
        if (!confirm('Are you sure you want to delete this client?')) return

        try {
            const { error } = await supabase
                .from('Client')
                .delete()
                .eq('id', clientId)

            if (error) throw error
            fetchClients()
        } catch (error: any) {
            console.error('Error deleting client:', error)
            alert('Error deleting client. Ensure no projects are linked to this client.')
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
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ Cancel' : '➕ Add Client'}
                </button>
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h3>Create New Client</h3>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className="form-group">
                                <label className="label">Client Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Description</label>
                            <textarea
                                className="input"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Create Client
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.tableCard}>
                {clients.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🏢</div>
                        <h3>No clients found</h3>
                        <p>Create your first client to get started</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Created By</th>
                                <th>Projects</th>
                                <th>Total Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td>
                                        <div className="font-semibold">{client.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            {client.description}
                                        </div>
                                    </td>
                                    <td>{client.created_by || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className="badge badge-primary" style={{ width: 'fit-content' }}>
                                                {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                                            </span>
                                            {client.projects.slice(0, 3).map(p => (
                                                <Link
                                                    key={p.projectid}
                                                    href={`/project/${p.projectid}`}
                                                    style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }}
                                                >
                                                    • {p.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="font-bold text-success">
                                        ${client.totalBudget.toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            Delete
                                        </button>
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
