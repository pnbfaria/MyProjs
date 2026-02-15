'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { Client, AppUser, PriceType } from '@/types/database'
import styles from './page.module.css'

export default function CreateProject() {
    const router = useRouter()
    const { currentUser } = useUser()
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    // Dropdown data
    const [clients, setClients] = useState<Client[]>([])
    const [users, setUsers] = useState<AppUser[]>([])
    const [priceTypes, setPriceTypes] = useState<PriceType[]>([])

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectstatus: 'Proposed',
        pricingtypeid: '',
        startdate: '',
        enddate: '',
        totalbudget: '',
        targetmargin: '',
        accountmanageremail: '',
        deliverymanageremail: '',
        clientid: '',
    })

    useEffect(() => {
        fetchDropdownData()
    }, [])

    async function fetchDropdownData() {
        try {
            const [clientsRes, usersRes, priceTypesRes] = await Promise.all([
                supabase.from('Client').select('*').order('name'),
                supabase.from('appuser').select('*').eq('isactive', true).order('firstname'),
                supabase.from('pricingtype').select('*').order('name')
            ])

            if (clientsRes.error) console.error('Error fetching clients:', clientsRes.error)
            if (usersRes.error) console.error('Error fetching users:', usersRes.error)
            if (priceTypesRes.error) {
                console.error('Error fetching price types:', priceTypesRes.error)
                // If pricingtype table doesn't exist or error, we might handle it gracefully or alert
            }

            setClients(clientsRes.data || [])
            setUsers(usersRes.data || [])
            setPriceTypes(priceTypesRes.data || [])
        } catch (error) {
            console.error('Error initializing form data:', error)
        } finally {
            setInitializing(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!currentUser) {
            alert('Please select a current user in the navigation bar to create a project.')
            return
        }

        if (!formData.title || !formData.accountmanageremail || !formData.deliverymanageremail) {
            alert('Please fill in all required fields.')
            return
        }

        try {
            setLoading(true)

            const projectData = {
                title: formData.title,
                description: formData.description,
                projectstatus: formData.projectstatus,
                pricingtypeid: formData.pricingtypeid ? parseInt(formData.pricingtypeid) : null,
                startdate: formData.startdate || null,
                enddate: formData.enddate || null,
                totalbudget: formData.totalbudget ? parseFloat(formData.totalbudget) : 0,
                targetmargin: formData.targetmargin ? parseFloat(formData.targetmargin) : 0,
                accountmanageremail: formData.accountmanageremail,
                deliverymanageremail: formData.deliverymanageremail,
                clientid: formData.clientid ? parseInt(formData.clientid) : null,
                createdbyemail: currentUser.email,
                createdon: new Date().toISOString(),
                // Initial empty metrics
                percentcompleted: 0
            }

            const { data, error } = await supabase
                .from('project')
                .insert([projectData])
                .select()

            if (error) throw error

            router.push('/') // Redirect to dashboard
        } catch (error: any) {
            console.error('Error creating project:', error)
            alert(`Error creating project: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return <div className="p-8 text-center">Loading form data...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink}>← Back to Projects</Link>
                <h1>Create New Project</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* General Information */}
                <div className={styles.section}>
                    <h2>General Information</h2>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Project Title *</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Website Redesign"
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Client</label>
                            <select
                                value={formData.clientid}
                                onChange={e => setFormData({ ...formData, clientid: e.target.value })}
                            >
                                <option value="">Select Client...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.group}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Financials & Timeline */}
                <div className={styles.section}>
                    <h2>Financials & Timeline</h2>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Status</label>
                            <select
                                value={formData.projectstatus}
                                onChange={e => setFormData({ ...formData, projectstatus: e.target.value })}
                            >
                                <option value="Proposed">Proposed</option>
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className={styles.group}>
                            <label>Pricing Type</label>
                            <select
                                value={formData.pricingtypeid}
                                onChange={e => setFormData({ ...formData, pricingtypeid: e.target.value })}
                            >
                                <option value="">Select Type...</option>
                                {priceTypes.map(pt => (
                                    <option key={pt.pricingtypeid} value={pt.pricingtypeid}>{pt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={formData.startdate}
                                onChange={e => setFormData({ ...formData, startdate: e.target.value })}
                            />
                        </div>
                        <div className={styles.group}>
                            <label>End Date</label>
                            <input
                                type="date"
                                value={formData.enddate}
                                onChange={e => setFormData({ ...formData, enddate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Total Budget ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.totalbudget}
                                onChange={e => setFormData({ ...formData, totalbudget: e.target.value })}
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Target Margin (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.targetmargin}
                                onChange={e => setFormData({ ...formData, targetmargin: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* People */}
                <div className={styles.section}>
                    <h2>People</h2>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Account Manager *</label>
                            <select
                                required
                                value={formData.accountmanageremail}
                                onChange={e => setFormData({ ...formData, accountmanageremail: e.target.value })}
                            >
                                <option value="">Select User...</option>
                                {users.map(u => (
                                    <option key={u.email} value={u.email}>{u.firstname} {u.lastname}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.group}>
                            <label>Delivery Manager *</label>
                            <select
                                required
                                value={formData.deliverymanageremail}
                                onChange={e => setFormData({ ...formData, deliverymanageremail: e.target.value })}
                            >
                                <option value="">Select User...</option>
                                {users.map(u => (
                                    <option key={u.email} value={u.email}>{u.firstname} {u.lastname}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}
