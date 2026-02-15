'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AppUser } from '@/types/database'
import styles from './page.module.css'

export default function UsersBackoffice() {
    const [users, setUsers] = useState<AppUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        firstname: '',
        lastname: '',
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('appuser')
                .select('*')
                .order('joinedat', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('appuser')
                .insert([{
                    ...formData,
                    joinedat: new Date().toISOString(),
                    isactive: true,
                }])

            if (error) throw error

            setFormData({ email: '', firstname: '', lastname: '' })
            setShowForm(false)
            fetchUsers()
        } catch (error) {
            console.error('Error creating user:', error)
            alert('Error creating user. Please check if the email already exists.')
        }
    }

    async function handleDelete(email: string) {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const { error } = await supabase
                .from('appuser')
                .delete()
                .eq('email', email)

            if (error) throw error
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error deleting user.')
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                <p>Loading users...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>App Users Management</h1>
                    <p className={styles.subtitle}>Manage system users and their roles</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ Cancel' : '➕ Add User'}
                </button>
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h3>Create New User</h3>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className="form-group">
                                <label className="label">Email *</label>
                                <input
                                    type="email"
                                    className="input"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">First Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.firstname}
                                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className="form-group">
                                <label className="label">Last Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.lastname}
                                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Create User
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.tableCard}>
                {users.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>👥</div>
                        <h3>No users found</h3>
                        <p>Create your first user to get started</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Joined At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.email}>
                                    <td>{user.email}</td>
                                    <td className="font-semibold">
                                        {user.firstname} {user.lastname}
                                    </td>
                                    <td>{new Date(user.joinedat).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                                            onClick={() => handleDelete(user.email)}
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
