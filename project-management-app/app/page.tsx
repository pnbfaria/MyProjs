'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Project, AppUser } from '@/types/database'
import styles from './page.module.css'

interface ProjectWithManagers extends Project {
    accountManager?: AppUser
    deliveryManager?: AppUser
}

export default function Home() {
    const [projects, setProjects] = useState<ProjectWithManagers[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        try {
            const { data: projectsData, error } = await supabase
                .from('project')
                .select('*')
                .order('createdon', { ascending: false })

            if (error) throw error

            // Fetch managers for each project
            const projectsWithManagers = await Promise.all(
                (projectsData || []).map(async (project) => {
                    const { data: accountMgr } = await supabase
                        .from('appuser')
                        .select('*')
                        .eq('email', project.accountmanageremail)
                        .single()

                    const { data: deliveryMgr } = await supabase
                        .from('appuser')
                        .select('*')
                        .eq('email', project.deliverymanageremail)
                        .single()

                    return {
                        ...project,
                        accountManager: accountMgr,
                        deliveryManager: deliveryMgr,
                    }
                })
            )

            setProjects(projectsWithManagers)
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.projectstatus?.toLowerCase() === filter)

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'on track' || s === 'active') return 'success'
        if (s === 'at risk') return 'warning'
        if (s === 'delayed' || s === 'over budget') return 'danger'
        return 'primary'
    }

    const calculateProgress = (project: Project) => {
        return project.percentcompleted || 0
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                <p>Loading projects...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Projects</h1>
                    <p className={styles.subtitle}>
                        Manage and track all your projects in one place
                    </p>
                </div>
                <Link href="/project/new" className="btn btn-primary">
                    <span>➕</span>
                    New Project
                </Link>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Projects ({projects.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'on track' ? styles.active : ''}`}
                    onClick={() => setFilter('on track')}
                >
                    On Track
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'at risk' ? styles.active : ''}`}
                    onClick={() => setFilter('at risk')}
                >
                    At Risk
                </button>
            </div>

            {filteredProjects.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h3>No projects found</h3>
                    <p>Create your first project to get started</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredProjects.map((project) => (
                        <Link
                            key={project.projectid}
                            href={`/project/${project.projectid}`}
                            className={styles.projectCard}
                        >
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3 className={styles.projectName}>{project.title}</h3>
                                    <p className={styles.projectId}>ID: P-{project.projectid}</p>
                                </div>
                                <span className={`badge badge-${getStatusColor(project.projectstatus)}`}>
                                    {project.projectstatus}
                                </span>
                            </div>

                            <p className={styles.description}>
                                {project.description || 'No description provided'}
                            </p>

                            <div className={styles.progress}>
                                <div className={styles.progressHeader}>
                                    <span className={styles.progressLabel}>Budget Progress</span>
                                    <span className={styles.progressValue}>{calculateProgress(project)}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${calculateProgress(project)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className={styles.managers}>
                                {project.deliveryManager && (
                                    <div className={styles.manager}>
                                        <div className={styles.avatar}>
                                            {project.deliveryManager.firstname?.[0]}
                                            {project.deliveryManager.lastname?.[0]}
                                        </div>
                                        <div className={styles.managerInfo}>
                                            <div className={styles.managerLabel}>Delivery Mgr.</div>
                                            <div className={styles.managerName}>
                                                {project.deliveryManager.firstname} {project.deliveryManager.lastname}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {project.accountManager && (
                                    <div className={styles.manager}>
                                        <div className={styles.avatar}>
                                            {project.accountManager.firstname?.[0]}
                                            {project.accountManager.lastname?.[0]}
                                        </div>
                                        <div className={styles.managerInfo}>
                                            <div className={styles.managerLabel}>Account Mgr.</div>
                                            <div className={styles.managerName}>
                                                {project.accountManager.firstname} {project.accountManager.lastname}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.budget}>
                                    <span className={styles.budgetLabel}>Total Budget</span>
                                    <span className={styles.budgetValue}>
                                        ${(project.totalbudget || 0).toLocaleString()}
                                    </span>
                                </div>
                                {project.startdate && (
                                    <div className={styles.date}>
                                        <span className={styles.dateLabel}>Start Date</span>
                                        <span className={styles.dateValue}>
                                            {new Date(project.startdate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
