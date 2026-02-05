'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Project, AppUser, Risk, Deliverable, Achievement, TimeSheet } from '@/types/database'
import StatusCard from '@/components/StatusCard'
import FinancialSnapshot from '@/components/FinancialSnapshot'
import ProgressCircle from '@/components/ProgressCircle'
import TabNavigation from '@/components/TabNavigation'
import Modal from '@/components/Modal'
import styles from './page.module.css'
import modalStyles from '@/components/Modal.module.css'

interface ProjectWithManagers extends Project {
    accountManager?: AppUser
    deliveryManager?: AppUser
}

export default function ProjectDetail() {
    const params = useParams()
    const projectId = params?.id as string

    const [project, setProject] = useState<ProjectWithManagers | null>(null)
    const [risks, setRisks] = useState<Risk[]>([])
    const [deliverables, setDeliverables] = useState<Deliverable[]>([])
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    const [activeModal, setActiveModal] = useState<string>('none')
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails()
        }
    }, [projectId])

    async function fetchProjectDetails() {
        try {
            // Fetch project
            const { data: projectData, error: projectError } = await supabase
                .from('project')
                .select('*')
                .eq('projectid', projectId)
                .single()

            if (projectError) throw projectError

            // Fetch managers
            let accountMgr = null
            if (projectData.accountmanageremail) {
                const { data } = await supabase
                    .from('appuser')
                    .select('*')
                    .eq('email', projectData.accountmanageremail)
                    .single()
                accountMgr = data
            }

            let deliveryMgr = null
            if (projectData.deliverymanageremail) {
                const { data } = await supabase
                    .from('appuser')
                    .select('*')
                    .eq('email', projectData.deliverymanageremail)
                    .single()
                deliveryMgr = data
            }

            setProject({
                ...projectData,
                accountManager: accountMgr,
                deliveryManager: deliveryMgr,
            })

            // Fetch related data
            const [risksRes, deliverablesRes, achievementsRes, timeSheetsRes] = await Promise.all([
                supabase.from('risk').select('*').eq('projectid', projectId),
                supabase.from('deliverable').select('*').eq('projectid', projectId),
                supabase.from('achievement').select('*').eq('projectid', projectId),
                supabase.from('timesheet').select('*').eq('projectid', projectId),
            ])

            setRisks(risksRes.data || [])
            setDeliverables(deliverablesRes.data || [])
            setAchievements(achievementsRes.data || [])
            setTimeSheets(timeSheetsRes.data || [])
        } catch (error) {
            console.error('Error fetching project details:', error)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (modalName: string) => {
        setFormData({})
        if (modalName === 'editProject' && project) {
            setFormData({
                title: project.title,
                description: project.description,
                projectstatus: project.projectstatus,
                percentcompleted: project.percentcompleted,
                startdate: project.startdate,
                enddate: project.enddate,
            })
        }
        setActiveModal(modalName)
    }

    const closeModal = () => {
        setActiveModal('none')
        setFormData({})
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let error = null

            if (activeModal === 'editProject') {
                const { error: err } = await supabase
                    .from('project')
                    .update(formData)
                    .eq('projectid', projectId)
                error = err
            } else if (activeModal === 'addRisk') {
                const { error: err } = await supabase
                    .from('risk')
                    .insert([{
                        ...formData,
                        projectid: projectId,
                        createdat: new Date().toISOString(),
                        createdbbyemail: 'user@example.com', // Placeholder
                    }])
                error = err
            } else if (activeModal === 'addDeliverable') {
                const { error: err } = await supabase
                    .from('deliverable')
                    .insert([{
                        ...formData,
                        projectid: projectId,
                        status: 'Pending',
                        createdat: new Date().toISOString(),
                    }])
                error = err
            } else if (activeModal === 'addAchievement') {
                const { error: err } = await supabase
                    .from('achievement')
                    .insert([{
                        ...formData,
                        projectid: projectId,
                        createdat: new Date().toISOString(),
                    }])
                error = err
            } else if (activeModal === 'addTimesheet') {
                const { error: err } = await supabase
                    .from('timesheet')
                    .insert([{
                        ...formData,
                        projectid: projectId,
                        createdat: new Date().toISOString(),
                    }])
                error = err
            }

            if (error) throw error

            await fetchProjectDetails()
            closeModal()
        } catch (error) {
            console.error('Error saving data:', error)
            alert('Failed to save data. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                <p>Loading project details...</p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className={styles.notFound}>
                <h2>Project not found</h2>
                <Link href="/" className="btn btn-primary">Back to Projects</Link>
            </div>
        )
    }

    const calculateProgress = () => {
        return project.percentcompleted || 0
    }

    const getTimingStatus = () => {
        // This would be calculated based on timeline
        return { status: 'At Risk', justification: 'Vendor delay.' }
    }

    const getBudgetStatus = () => {
        const progress = project.percentcompleted || 0

        if (progress > 100) return { status: 'Over budget', justification: 'Scope creep.' }
        if (progress > 90) return { status: 'At risk', justification: 'High utilization.' }
        return { status: 'On track', justification: 'Within budget.' }
    }

    const getScopeStatus = () => {
        return { status: 'On track', justification: 'All deliverables on schedule.' }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>← Back to Projects</Link>
                    <h1 className={styles.title}>{project.title}</h1>
                    <p className={styles.subtitle}>
                        ID: P-{project.projectid} | Type: Fixed Price
                    </p>
                </div>
                <div className={styles.headerRight}>
                    {project.deliveryManager && (
                        <div className={styles.managerBadge}>
                            <div className={styles.avatar}>
                                {project.deliveryManager.firstname?.[0]}
                                {project.deliveryManager.lastname?.[0]}
                            </div>
                            <div>
                                <div className={styles.managerLabel}>Delivery Mgr.</div>
                                <div className={styles.managerName}>
                                    {project.deliveryManager.firstname} {project.deliveryManager.lastname}
                                </div>
                            </div>
                        </div>
                    )}
                    {project.accountManager && (
                        <div className={styles.managerBadge}>
                            <div className={styles.avatar}>
                                {project.accountManager.firstname?.[0]}
                                {project.accountManager.lastname?.[0]}
                            </div>
                            <div>
                                <div className={styles.managerLabel}>Account Mgr.</div>
                                <div className={styles.managerName}>
                                    {project.accountManager.firstname} {project.accountManager.lastname}
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="btn btn-secondary" onClick={() => openModal('editProject')}>✏️ Edit Project</button>
                    <button className="btn btn-primary">⏱️ TimeSheet</button>
                </div>
            </div>

            <div className={styles.statusGrid}>
                <StatusCard
                    title="Timing Status"
                    status={getTimingStatus().status}
                    justification={getTimingStatus().justification}
                    type="timing"
                />
                <StatusCard
                    title="Budget Status"
                    status={getBudgetStatus().status}
                    justification={getBudgetStatus().justification}
                    type="budget"
                />
                <StatusCard
                    title="Scope Status"
                    status={getScopeStatus().status}
                    justification={getScopeStatus().justification}
                    type="scope"
                />
                <ProgressCircle
                    percentage={calculateProgress()}
                    label="Completed"
                />
            </div>

            <FinancialSnapshot
                totalBudget={project.totalbudget || 0}
                percentCompleted={project.percentcompleted || 0}
            />

            <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={['overview', 'risks', 'deliverables', 'achievements', 'timesheets']}
            />

            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overview}>
                        <div className={styles.section}>
                            <h3>Description</h3>
                            <p>{project.description || 'No description provided.'}</p>
                        </div>
                        <div className={styles.section}>
                            <h3>Start/End Dates</h3>
                            <div className={styles.dates}>
                                {project.startdate && (
                                    <div>
                                        <strong>Start Date:</strong> {new Date(project.startdate).toLocaleDateString()}
                                    </div>
                                )}
                                {project.enddate && (
                                    <div>
                                        <strong>Target End Date:</strong> {new Date(project.enddate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risks' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>Risks ({risks.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addRisk')}>+ Add Risk</button>
                        </div>
                        {risks.length === 0 ? (
                            <p className={styles.emptyMessage}>No risks recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Importance</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {risks.map((risk) => (
                                        <tr key={risk.riskid}>
                                            <td>{risk.title}</td>
                                            <td>{risk.description}</td>
                                            <td><span className={`badge badge-${risk.importance === 'High' ? 'danger' : 'warning'}`}>{risk.importance}</span></td>
                                            <td>{risk.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'deliverables' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>Deliverables ({deliverables.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addDeliverable')}>+ Add Deliverable</button>
                        </div>
                        {deliverables.length === 0 ? (
                            <p className={styles.emptyMessage}>No deliverables recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliverables.map((deliverable) => (
                                        <tr key={deliverable.deliverableid}>
                                            <td>{deliverable.title}</td>
                                            <td>{deliverable.description}</td>
                                            <td>{deliverable.duedate ? new Date(deliverable.duedate).toLocaleDateString() : 'N/A'}</td>
                                            <td><span className="badge badge-success">{deliverable.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>Achievements ({achievements.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addAchievement')}>+ Add Achievement</button>
                        </div>
                        {achievements.length === 0 ? (
                            <p className={styles.emptyMessage}>No achievements recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Date Achieved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {achievements.map((achievement) => (
                                        <tr key={achievement.achievementid}>
                                            <td>{achievement.title}</td>
                                            <td>{achievement.description}</td>
                                            <td>{new Date(achievement.dateachieved).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'timesheets' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>TimeSheets ({timeSheets.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addTimesheet')}>+ Add TimeSheet</button>
                        </div>
                        {timeSheets.length === 0 ? (
                            <p className={styles.emptyMessage}>No timesheets recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Month/Year</th>
                                        <th>Workload</th>
                                        <th>External Devs</th>
                                        <th>Branded Dev Years</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSheets.map((ts) => (
                                        <tr key={ts.timesheetid}>
                                            <td>{ts.month}/{ts.year}</td>
                                            <td>{ts.workload}</td>
                                            <td>{ts.externaldevcount}</td>
                                            <td>{ts.brandeddevyearscount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Project Modal */}
            <Modal
                isOpen={activeModal === 'editProject'}
                onClose={closeModal}
                title="Edit Project"
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="projectstatus"
                            value={formData.projectstatus || ''}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Active">Active</option>
                            <option value="On Track">On Track</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Progress (%)</label>
                        <input
                            type="number"
                            name="percentcompleted"
                            value={formData.percentcompleted || 0}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Start Date</label>
                        <input
                            type="date"
                            name="startdate"
                            value={formData.startdate?.split('T')[0] || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Target End Date</label>
                        <input
                            type="date"
                            name="enddate"
                            value={formData.enddate?.split('T')[0] || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Add Risk Modal */}
            <Modal
                isOpen={activeModal === 'addRisk'}
                onClose={closeModal}
                title="Add New Risk"
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Risk Title</label>
                        <input
                            type="text"
                            name="title"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Description</label>
                        <textarea
                            name="description"
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Importance</label>
                        <select
                            name="importance"
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="status"
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Identified">Identified</option>
                            <option value="Mitigated">Mitigated</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Risk</button>
                    </div>
                </form>
            </Modal>

            {/* Add Deliverable Modal */}
            <Modal
                isOpen={activeModal === 'addDeliverable'}
                onClose={closeModal}
                title="Add New Deliverable"
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Title</label>
                        <input
                            type="text"
                            name="title"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Description</label>
                        <textarea
                            name="description"
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Due Date</label>
                        <input
                            type="date"
                            name="duedate"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Deliverable</button>
                    </div>
                </form>
            </Modal>

            {/* Add Achievement Modal */}
            <Modal
                isOpen={activeModal === 'addAchievement'}
                onClose={closeModal}
                title="Add New Achievement"
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Title</label>
                        <input
                            type="text"
                            name="title"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Description</label>
                        <textarea
                            name="description"
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Date Achieved</label>
                        <input
                            type="date"
                            name="dateachieved"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Achievement</button>
                    </div>
                </form>
            </Modal>

            {/* Add Timesheet Modal */}
            <Modal
                isOpen={activeModal === 'addTimesheet'}
                onClose={closeModal}
                title="Add TimeSheet"
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Month (1-12)</label>
                        <input
                            type="number"
                            name="month"
                            min="1"
                            max="12"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Year</label>
                        <input
                            type="number"
                            name="year"
                            min="2020"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Workload</label>
                        <input
                            type="number"
                            name="workload"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>External Devs Count</label>
                        <input
                            type="number"
                            name="externaldevcount"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Branded Dev Years</label>
                        <input
                            type="number"
                            name="brandeddevyearscount"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add TimeSheet</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
