'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProjectDetails, deleteEntity, updateProject, updateEntity, insertRagStatus, insertEntity, insertMultipleTimesheets } from '@/app/actions/projectDetailsActions'
import { useUser } from '@/context/UserContext'
import { Project, AppUser, Risk, Deliverable, Achievement, Decision, TimeSheet, RagStatus, Role } from '@/types/database'
import StatusCard from '@/components/StatusCard'
import GlobalStatusCard from '@/components/GlobalStatusCard'
import ResourceConsumption from '@/components/ResourceConsumption'
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
    const { currentUser, allUsers } = useUser()

    const [project, setProject] = useState<ProjectWithManagers | null>(null)
    const [risks, setRisks] = useState<Risk[]>([])
    const [deliverables, setDeliverables] = useState<Deliverable[]>([])
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [decisions, setDecisions] = useState<Decision[]>([])

    const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([])
    const [ragStatuses, setRagStatuses] = useState<RagStatus[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    const [activeModal, setActiveModal] = useState<string>('none')
    const [formData, setFormData] = useState<any>({})
    const [selectedMonths, setSelectedMonths] = useState<number[]>([])
    const [userToManage, setUserToManage] = useState<string | null>(null)

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails()
        }
    }, [projectId])

    async function fetchProjectDetails() {
        try {
            const data = await getProjectDetails(parseInt(projectId))
            if(data) {
                 setProject(data.project)
                 setRisks(data.risks)
                 setDeliverables(data.deliverables)
                 setAchievements(data.achievements)
                 setDecisions(data.decisions)
                 setTimeSheets(data.timeSheets)
                 setRagStatuses(data.ragStatuses)
                 setRoles(data.roles)
            }
        } catch (error) {
            console.error('Error fetching project details:', error)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (modalName: string, data?: any) => {
        setFormData({})
        if (modalName === 'editProject' && project) {
            setFormData({
                title: project.title,
                description: project.description,
                projectstatus: project.projectstatus,
                percentcompleted: project.percentcompleted,
                startdate: project.startdate,
                enddate: project.enddate,
                accountmanageremail: project.accountmanageremail,
                deliverymanageremail: project.deliverymanageremail,
            })
        } else if (modalName === 'updateStatus' && project) {
            // Get latest status from ragStatuses state (first element since we sort desc)
            const latestStatus = ragStatuses.length > 0 ? ragStatuses[0] : null

            setFormData({
                percentcompleted: project.percentcompleted || 0,
                timingstatus: latestStatus?.timing || 'Green',
                timingjustification: latestStatus?.justificationtiming || '',
                budgetstatus: latestStatus?.budget || 'Green',
                budgetjustification: latestStatus?.justificationbudget || '',
                scopestatus: latestStatus?.scope || 'Green',
                scopejustification: latestStatus?.justificationscope || '',
            })
        } else if (modalName === 'editRagStatus' && data) {
            setFormData({
                ragid: data.ragid,
                percentcompleted: project?.percentcompleted || 0, // Keep current project progress
                timingstatus: data.timing,
                timingjustification: data.justificationtiming,
                budgetstatus: data.budget,
                budgetjustification: data.justificationbudget,
                scopestatus: data.scope,
                scopejustification: data.justificationscope,
            })
        } else if (modalName === 'addRisk') {
            setFormData({
                importance: 'Low',
                status: 'Identified',
            })
        } else if (modalName === 'editRisk' && data) {
            setFormData({
                riskid: data.riskid,
                title: data.title,
                description: data.description,
                importance: data.importance,
                status: data.status,
                ComeToPass: data.ComeToPass,
                owneremail: data.owneremail,
            })
        } else if (modalName === 'addDeliverable') {
            setFormData({
                status: 'Pending',
            })
        } else if (modalName === 'editDeliverable' && data) {
            setFormData({
                deliverableid: data.deliverableid,
                title: data.title,
                description: data.description,
                duedate: data.duedate?.split('T')[0] || '',
                status: data.status,
            })
        } else if (modalName === 'addAchievement') {
            setFormData({
                dateachieved: new Date().toISOString().split('T')[0],
            })
        } else if (modalName === 'editAchievement' && data) {
            setFormData({
                achievementid: data.achievementid,
                title: data.title,
                description: data.description,
                dateachieved: data.dateachieved?.split('T')[0] || '',
            })
        } else if (modalName === 'addTimesheet') {
            setSelectedMonths([])
            if (data?.useremail) {
                setFormData({ useremail: data.useremail }) // Pre-fill user if coming from manage
            }
        } else if (modalName === 'manageUserTimesheets' && data) {
            setUserToManage(data)
        } else if (modalName === 'addDecision') {
            setFormData({
                status: 'To be decided',
                importance: 'Medium',
                registedon: new Date().toISOString().split('T')[0],
            })
        } else if (modalName === 'editDecision' && data) {
            setFormData({
                decisionid: data.decisionid,
                title: data.title,
                description: data.description,
                status: data.status,
                importance: data.importance,
                owneremail: data.owneremail,
                registedon: data.registedon ? new Date(data.registedon).toISOString().split('T')[0] : '',
            })
        }
        setActiveModal(modalName)
    }

    const closeModal = () => {
        setActiveModal('none')
        setFormData({})
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        setFormData((prev: any) => ({ ...prev, [name]: val }))
    }

    const handleRagStatusDelete = async (ragId: number) => {
        if (!confirm('Are you sure you want to delete this status entry?')) return

        try {
            await deleteEntity('ragstatus', 'ragid', ragId)

            await fetchProjectDetails()
        } catch (error) {
            console.error('Error deleting status:', error)
            alert('Failed to delete status. Please try again.')
        }
    }

    const handleMonthToggle = (month: number) => {
        setSelectedMonths(prev => {
            if (prev.includes(month)) {
                return prev.filter(m => m !== month)
            } else {
                return [...prev, month].sort((a, b) => a - b)
            }
        })
    }

    const handleDeleteItem = async (table: string, idField: string, idValue: number) => {
        if (!confirm(`Are you sure you want to delete this ${table}?`)) return

        try {
            await deleteEntity(table, idField, idValue)

            await fetchProjectDetails()
        } catch (error) {
            console.error(`Error deleting ${table}:`, error)
            alert(`Failed to delete ${table}. Please try again.`)
        }
    }

    const handleTimesheetDelete = async (timesheetId: number) => {
        if (!confirm('Are you sure you want to delete this timesheet entry?')) return

        try {
            await deleteEntity('timesheet', 'timesheetid', timesheetId)

            await fetchProjectDetails()
        } catch (error) {
            console.error('Error deleting timesheet:', error)
            alert('Failed to delete timesheet. Please try again.')
        }
    }

    const handleTimesheetUpdate = async (timesheetId: number, field: string, value: any) => {
        try {
            await updateEntity('timesheet', 'timesheetid', timesheetId, { [field]: value })
            await fetchProjectDetails()
        } catch (error) {
            console.error('Error updating timesheet:', error)
            // ideally revert UI or show error
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentUser) {
            alert('Please select a user from the navigation bar first.')
            return
        }

        try {
            if (activeModal === 'editProject') {
                await updateProject(parseInt(projectId), formData)
            } else if (activeModal === 'updateStatus') {
                // 1. Update project percentcompleted
                await updateProject(parseInt(projectId), { percentcompleted: formData.percentcompleted })

                // 2. Insert new ragstatus record
                await insertRagStatus({
                    projectid: parseInt(projectId),
                    timing: formData.timingstatus,
                    budget: formData.budgetstatus,
                    scope: formData.scopestatus,
                    justificationtiming: formData.timingjustification,
                    justificationbudget: formData.budgetjustification,
                    justificationscope: formData.scopejustification,
                    createdbyemail: currentUser.email,
                    createdon: new Date().toISOString()
                })
            } else if (activeModal === 'editRagStatus') {
                await updateEntity('ragstatus', 'ragid', formData.ragid, {
                    timing: formData.timingstatus,
                    budget: formData.budgetstatus,
                    scope: formData.scopestatus,
                    justificationtiming: formData.timingjustification,
                    justificationbudget: formData.budgetjustification,
                    justificationscope: formData.scopejustification,
                })
            } else if (activeModal === 'addRisk') {
                await insertEntity('risk', { ...formData, projectid: parseInt(projectId) })
            } else if (activeModal === 'editRisk') {
                const { riskid, ...updateData } = formData
                await updateEntity('risk', 'riskid', riskid, updateData)
            } else if (activeModal === 'addDeliverable') {
                await insertEntity('deliverable', { ...formData, projectid: parseInt(projectId) })
            } else if (activeModal === 'editDeliverable') {
                const { deliverableid, ...updateData } = formData
                await updateEntity('deliverable', 'deliverableid', deliverableid, updateData)
            } else if (activeModal === 'addAchievement') {
                await insertEntity('achievement', { ...formData, projectid: parseInt(projectId) })
            } else if (activeModal === 'editAchievement') {
                const { achievementid, ...updateData } = formData
                await updateEntity('achievement', 'achievementid', achievementid, updateData)
            } else if (activeModal === 'addTimesheet') {
                if (selectedMonths.length === 0) {
                    alert('Please select at least one month')
                    return
                }

                const inserts = selectedMonths.map(month => ({
                    ...formData,
                    projectid: parseInt(projectId),
                    useremail: formData.useremail,
                    workload: formData.workload || 0,
                    estworkload: formData.estworkload || 0,
                    roleid: formData.roleid,
                    month: month,
                    year: formData.year
                }))

                await insertMultipleTimesheets(inserts)
            } else if (activeModal === 'addDecision') {
                const { title, description, status, owneremail, importance, registedon } = formData
                await insertEntity('decision', { 
                    projectid: parseInt(projectId),
                    title,
                    description,
                    status,
                    owneremail,
                    importance,
                    registedon: registedon || new Date().toISOString(),
                    createdbyemail: currentUser.email 
                })
            } else if (activeModal === 'editDecision') {
                const { decisionid, title, description, status, owneremail, importance, registedon } = formData
                await updateEntity('decision', 'decisionid', decisionid, {
                    title,
                    description,
                    status,
                    owneremail,
                    importance,
                    registedon: registedon || null
                })
            }

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

    const getUserName = (email: string | undefined): string => {
        if (!email) return 'Unassigned';
        const normalizedEmail = email.toLowerCase().trim();
        const user = allUsers.find(u => u.email.toLowerCase().trim() === normalizedEmail);
        return user ? `${user.firstname} ${user.lastname}` : email;
    }

    const getTimingStatus = () => {
        const latest = ragStatuses.length > 0 ? ragStatuses[0] : null
        return {
            status: latest?.timing || 'Green',
            justification: latest?.justificationtiming || 'On schedule'
        }
    }

    const getBudgetStatus = () => {
        const latest = ragStatuses.length > 0 ? ragStatuses[0] : null
        return {
            status: latest?.budget || 'Green',
            justification: latest?.justificationbudget || 'Within budget'
        }
    }

    const getScopeStatus = () => {
        const latest = ragStatuses.length > 0 ? ragStatuses[0] : null
        return {
            status: latest?.scope || 'Green',
            justification: latest?.justificationscope || 'All deliverables on schedule'
        }
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
                    <button className="btn btn-primary" onClick={() => openModal('updateStatus')}>📊 Update Status</button>
                </div>
            </div>

            <div className={styles.statusGrid}>
                <GlobalStatusCard
                    status={(() => {
                        const statuses = [getTimingStatus().status, getBudgetStatus().status, getScopeStatus().status]
                        if (statuses.some(s => s.toLowerCase() === 'red')) return 'Red'
                        if (statuses.some(s => s.toLowerCase() === 'amber')) return 'Amber'
                        return 'Green'
                    })()}
                    percentage={calculateProgress()}
                />
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
            </div>

            <ResourceConsumption
                projectId={parseInt(projectId)}
                initialTimeSheets={timeSheets}
                onDataUpdate={fetchProjectDetails}
            />

            <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={['overview', 'rag-status', 'risks', 'decisions', 'deliverables', 'achievements', 'timesheets']}
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

                {activeTab === 'rag-status' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>RAG Status History ({ragStatuses.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('updateStatus')}>+ Update Status</button>
                        </div>
                        {ragStatuses.length === 0 ? (
                            <p className={styles.emptyMessage}>No status updates recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Timing</th>
                                        <th>Budget</th>
                                        <th>Scope</th>
                                        <th>Updated By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ragStatuses.map((rag, index) => {
                                        const prevRag = ragStatuses[index + 1];
                                        
                                        const getTrendIcon = (current: string, previous?: string) => {
                                            if (!previous) return null;
                                            const scores: Record<string, number> = { 'Green': 2, 'Amber': 1, 'Red': 0 };
                                            const currScore = scores[current] ?? -1;
                                            const prevScore = scores[previous] ?? -1;
                                            
                                            if (currScore > prevScore) return <span style={{ color: 'green', marginLeft: '5px', fontWeight: 'bold' }}>↑</span>;
                                            if (currScore < prevScore) return <span style={{ color: 'red', marginLeft: '5px', fontWeight: 'bold' }}>↓</span>;
                                            return null;
                                        };

                                        return (
                                            <tr key={rag.ragid}>
                                                <td>{new Date(rag.createdon).toLocaleDateString()} {new Date(rag.createdon).toLocaleTimeString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className={`badge badge-${rag.timing === 'Green' ? 'success' : rag.timing === 'Amber' ? 'warning' : 'danger'}`}>{rag.timing}</span>
                                                        {getTrendIcon(rag.timing, prevRag?.timing)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className={`badge badge-${rag.budget === 'Green' ? 'success' : rag.budget === 'Amber' ? 'warning' : 'danger'}`}>{rag.budget}</span>
                                                        {getTrendIcon(rag.budget, prevRag?.budget)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className={`badge badge-${rag.scope === 'Green' ? 'success' : rag.scope === 'Amber' ? 'warning' : 'danger'}`}>{rag.scope}</span>
                                                        {getTrendIcon(rag.scope, prevRag?.scope)}
                                                    </div>
                                                </td>
                                                <td>{getUserName(rag.createdbyemail)}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('editRagStatus', rag)} style={{ marginRight: '5px' }}>✏️</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRagStatusDelete(rag.ragid)}>🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
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
                                        <th>Owner</th>
                                        <th>Importance</th>
                                        <th>Come To Pass</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {risks.map((risk) => (
                                        <tr key={risk.riskid}>
                                            <td>{risk.title}</td>
                                            <td>{risk.description}</td>
                                            <td>{getUserName(risk.owneremail)}</td>
                                            <td><span className={`badge badge-${risk.importance === 'High' ? 'danger' : 'warning'}`}>{risk.importance}</span></td>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!risk.ComeToPass} 
                                                    readOnly 
                                                    style={{ cursor: 'default' }}
                                                />
                                            </td>
                                            <td>{risk.status}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('editRisk', risk)} style={{ marginRight: '5px' }}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem('risk', 'riskid', risk.riskid)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'decisions' && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>Decisions ({decisions.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addDecision')}>+ Add Decision</button>
                        </div>
                        {decisions.length === 0 ? (
                            <p className={styles.emptyMessage}>No decisions recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Owner</th>
                                        <th>Status</th>
                                        <th>Importance</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {decisions.map((decision) => (
                                        <tr key={decision.decisionid}>
                                            <td>{decision.title}</td>
                                            <td>{decision.description}</td>
                                            <td>{getUserName(decision.owneremail)}</td>
                                            <td><span className={`badge badge-${decision.status === 'Approved' ? 'success' : decision.status === 'Rejected' ? 'danger' : 'warning'}`}>{decision.status}</span></td>
                                            <td><span className={`badge badge-${decision.importance === 'High' ? 'danger' : decision.importance === 'Medium' ? 'warning' : 'secondary'}`}>{decision.importance}</span></td>
                                            <td>{decision.registedon ? new Date(decision.registedon).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('editDecision', decision)} style={{ marginRight: '5px' }}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem('decision', 'decisionid', decision.decisionid)}>🗑️</button>
                                            </td>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliverables.map((deliverable) => (
                                        <tr key={deliverable.deliverableid}>
                                            <td>{deliverable.title}</td>
                                            <td>{deliverable.description}</td>
                                            <td>{deliverable.duedate ? new Date(deliverable.duedate).toLocaleDateString() : 'N/A'}</td>
                                            <td><span className="badge badge-success">{deliverable.status}</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('editDeliverable', deliverable)} style={{ marginRight: '5px' }}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem('deliverable', 'deliverableid', deliverable.deliverableid)}>🗑️</button>
                                            </td>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {achievements.map((achievement) => (
                                        <tr key={achievement.achievementid}>
                                            <td>{achievement.title}</td>
                                            <td>{achievement.description}</td>
                                            <td>{new Date(achievement.dateachieved).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('editAchievement', achievement)} style={{ marginRight: '5px' }}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem('achievement', 'achievementid', achievement.achievementid)}>🗑️</button>
                                            </td>
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
                            <h3>Resource Plan</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addTimesheet')}>+ Add TimeSheet</button>
                        </div>
                        {timeSheets.length === 0 ? (
                            <p className={styles.emptyMessage}>No timesheets recorded.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Est Workload (Days)</th>
                                        <th>Actual Workload (Days)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(timeSheets.reduce((acc: any, curr) => {
                                        const email = curr.useremail ? curr.useremail.toLowerCase().trim() : 'Unknown';
                                        if (!acc[email]) {
                                            const normalizedEmail = email;
                                            const user = allUsers.find(u => u.email.toLowerCase().trim() === normalizedEmail);
                                            const role = roles.find(r => r.roleid === curr.roleid);
                                            acc[email] = {
                                                email,
                                                name: user ? `${user.firstname} ${user.lastname}` : email,
                                                role: role ? role.name : 'Unknown',
                                                roleid: curr.roleid,
                                                workload: 0,
                                                estworkload: 0
                                            };
                                        }
                                        acc[email].workload += (Number(curr.workload) || 0);
                                        acc[email].estworkload += (Number(curr.estworkload) || 0);
                                        return acc;
                                    }, {})).map((row: any) => (
                                        <tr key={row.email}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{row.name}</div>
                                                {/* <div style={{ fontSize: '0.8em', color: '#888' }}>{row.email}</div> */}
                                            </td>
                                            <td><span className="badge badge-secondary">{row.role}</span></td>
                                            <td>{row.estworkload}</td>
                                            <td>{row.workload}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => openModal('manageUserTimesheets', row.email)}>✏️ Edit Details</button>
                                            </td>
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
                        <label className={modalStyles.label}>Account Manager</label>
                        <select
                            name="accountmanageremail"
                            value={formData.accountmanageremail || ''}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="">Select Account Manager</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Delivery Manager</label>
                        <select
                            name="deliverymanageremail"
                            value={formData.deliverymanageremail || ''}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="">Select Delivery Manager</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
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

            {/* Update Status Modal */}
            <Modal
                isOpen={activeModal === 'updateStatus' || activeModal === 'editRagStatus'}
                onClose={closeModal}
                title={activeModal === 'editRagStatus' ? "Edit Status Entry" : "Update Project Status"}
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Project Progress (%)</label>
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

                    {/* Timing Status */}
                    <div className={styles.sectionDivider}>
                        <h4>Timing Status</h4>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="timingstatus"
                            value={formData.timingstatus || 'Green'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Green">Green</option>
                            <option value="Amber">Amber</option>
                            <option value="Red">Red</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Justification</label>
                        <textarea
                            name="timingjustification"
                            value={formData.timingjustification || ''}
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            rows={2}
                        />
                    </div>

                    {/* Budget Status */}
                    <div className={styles.sectionDivider}>
                        <h4>Budget Status</h4>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="budgetstatus"
                            value={formData.budgetstatus || 'Green'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Green">Green</option>
                            <option value="Amber">Amber</option>
                            <option value="Red">Red</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Justification</label>
                        <textarea
                            name="budgetjustification"
                            value={formData.budgetjustification || ''}
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            rows={2}
                        />
                    </div>

                    {/* Scope Status */}
                    <div className={styles.sectionDivider}>
                        <h4>Scope Status</h4>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="scopestatus"
                            value={formData.scopestatus || 'Green'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Green">Green</option>
                            <option value="Amber">Amber</option>
                            <option value="Red">Red</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Justification</label>
                        <textarea
                            name="scopejustification"
                            value={formData.scopejustification || ''}
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            rows={2}
                        />
                    </div>

                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Status</button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Risk Modal */}
            <Modal
                isOpen={activeModal === 'addRisk' || activeModal === 'editRisk'}
                onClose={closeModal}
                title={activeModal === 'editRisk' ? 'Edit Risk' : 'Add New Risk'}
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Risk Title</label>
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
                        <label className={modalStyles.label}>Owner</label>
                        <select
                            name="owneremail"
                            value={formData.owneremail || ''}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                            required
                        >
                            <option value="" disabled>Select Owner</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className={modalStyles.textarea}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Importance</label>
                        <select
                            name="importance"
                            value={formData.importance || 'Low'}
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
                            value={formData.status || 'Identified'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Identified">Identified</option>
                            <option value="Mitigated">Mitigated</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="ComeToPass"
                            name="ComeToPass"
                            checked={formData.ComeToPass || false}
                            onChange={handleInputChange}
                            className={modalStyles.checkbox}
                        />
                        <label htmlFor="ComeToPass" className={modalStyles.label} style={{ marginBottom: 0 }}>Come To Pass</label>
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{activeModal === 'editRisk' ? 'Save Changes' : 'Add Risk'}</button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Deliverable Modal */}
            <Modal
                isOpen={activeModal === 'addDeliverable' || activeModal === 'editDeliverable'}
                onClose={closeModal}
                title={activeModal === 'editDeliverable' ? 'Edit Deliverable' : 'Add New Deliverable'}
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Title</label>
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
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Due Date</label>
                        <input
                            type="date"
                            name="duedate"
                            value={formData.duedate || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="status"
                            value={formData.status || 'Pending'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                        </select>
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{activeModal === 'editDeliverable' ? 'Save Changes' : 'Add Deliverable'}</button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Achievement Modal */}
            <Modal
                isOpen={activeModal === 'addAchievement' || activeModal === 'editAchievement'}
                onClose={closeModal}
                title={activeModal === 'editAchievement' ? 'Edit Achievement' : 'Add New Achievement'}
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Title</label>
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
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Date Achieved</label>
                        <input
                            type="date"
                            name="dateachieved"
                            value={formData.dateachieved || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{activeModal === 'editAchievement' ? 'Save Changes' : 'Add Achievement'}</button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Decision Modal */}
            <Modal
                isOpen={activeModal === 'addDecision' || activeModal === 'editDecision'}
                onClose={closeModal}
                title={activeModal === 'editDecision' ? 'Edit Decision' : 'Add New Decision'}
            >
                <form onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Title</label>
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
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Owner</label>
                        <select
                            name="owneremail"
                            value={formData.owneremail || ''}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                            required
                        >
                            <option value="">Select Owner</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Status</label>
                        <select
                            name="status"
                            value={formData.status || 'To be decided'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="To be decided">To be decided</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Importance</label>
                        <select
                            name="importance"
                            value={formData.importance || 'Medium'}
                            onChange={handleInputChange}
                            className={modalStyles.select}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Date</label>
                        <input
                            type="date"
                            name="registedon"
                            value={formData.registedon || ''}
                            onChange={handleInputChange}
                            className={modalStyles.input}
                        />
                    </div>
                    <div className={modalStyles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{activeModal === 'editDecision' ? 'Save Changes' : 'Add Decision'}</button>
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
                        <label className={modalStyles.label}>User</label>
                        <select
                            name="useremail"
                            onChange={handleInputChange}
                            className={modalStyles.select}
                            required
                            defaultValue=""
                        >
                            <option value="" disabled>Select User</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Role</label>
                        <select
                            name="roleid"
                            onChange={handleInputChange}
                            className={modalStyles.select}
                            required
                            defaultValue=""
                        >
                            <option value="" disabled>Select Role</option>
                            {roles.map(role => (
                                <option key={role.roleid} value={role.roleid}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Months</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleMonthToggle(m)}
                                    className={`btn ${selectedMonths.includes(m) ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        width: '40px',
                                        opacity: selectedMonths.includes(m) ? 1 : 0.6
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        {selectedMonths.length === 0 && <small style={{ color: 'red' }}>Please select at least one month</small>}
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
                        <label className={modalStyles.label}>Actual Workload (Days)</label>
                        <input
                            type="number"
                            name="workload"
                            step="0.1"
                            onChange={handleInputChange}
                            className={modalStyles.input}
                            required
                        />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.label}>Estimated Workload (Days)</label>
                        <input
                            type="number"
                            name="estworkload"
                            step="0.1"
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

            {/* Manage User Timesheets Modal */}
            <Modal
                isOpen={activeModal === 'manageUserTimesheets'}
                onClose={closeModal}
                title={`Manage Timesheets for ${getUserName(userToManage ?? undefined)}`}
            >
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            closeModal();
                            openModal('addTimesheet', { useremail: userToManage });
                        }}
                    >
                        + Add New Entry
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Role</th>
                                <th>Est (Days)</th>
                                <th>Actual (Days)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeSheets.filter(ts => ts.useremail === userToManage).sort((a, b) => {
                                if (a.year !== b.year) return a.year - b.year;
                                return a.month - b.month;
                            }).map(ts => {
                                const role = roles.find(r => r.roleid === ts.roleid);
                                return (
                                    <tr key={ts.timesheetid}>
                                        <td>{ts.month}/{ts.year}</td>
                                        <td>{role ? role.name : 'Unknown'}</td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.1"
                                                defaultValue={ts.estworkload || 0}
                                                onBlur={(e) => handleTimesheetUpdate(ts.timesheetid, 'estworkload', parseFloat(e.target.value))}
                                                className={modalStyles.input}
                                                style={{ width: '60px', padding: '2px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.1"
                                                defaultValue={ts.workload || 0}
                                                onBlur={(e) => handleTimesheetUpdate(ts.timesheetid, 'workload', parseFloat(e.target.value))}
                                                className={modalStyles.input}
                                                style={{ width: '60px', padding: '2px' }}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleTimesheetDelete(ts.timesheetid)}
                                                title="Delete Entry"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {timeSheets.filter(ts => ts.useremail === userToManage).length === 0 && (
                        <p style={{ textAlign: 'center', color: '#666' }}>No entries found for this user.</p>
                    )}
                </div>
                <div className={modalStyles.actions}>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
            </Modal>
        </div >
    )
}
