
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import styles from './ResourceConsumption.module.css';
import { TimeSheet, Registration, Role, AppUser } from '@/types/database';

interface ResourceConsumptionProps {
    projectId: number;
    initialTimeSheets: TimeSheet[];
    onDataUpdate: () => void;
}

interface UserData {
    email: string;
    name: string;
    role: string;
    workload: number;
    estworkload: number;
}

export default function ResourceConsumption({ projectId, initialTimeSheets, onDataUpdate }: ResourceConsumptionProps) {
    const [viewMode, setViewMode] = useState<'global' | 'month' | 'soFar'>('global');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [usersData, setUsersData] = useState<UserData[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    // State for creating/editing timesheet entries
    const [editingEntry, setEditingEntry] = useState<any | null>(null);

    useEffect(() => {
        fetchMetadata();
    }, [projectId]);

    useEffect(() => {
        processData();
    }, [initialTimeSheets, registrations, roles, users, viewMode, selectedMonth, selectedYear]);

    const fetchMetadata = async () => {
        try {
            const [regRes, rolesRes, usersRes] = await Promise.all([
                supabase.from('registration').select('*').eq('projectid', projectId),
                supabase.from('role').select('*'),
                supabase.from('appuser').select('*')
            ]);

            if (regRes.data) setRegistrations(regRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
            if (usersRes.data) setUsers(usersRes.data);
        } catch (error) {
            console.error("Error fetching metadata:", error);
        } finally {
            setLoading(false);
        }
    };

    const processData = () => {
        if (loading) return;

        // 1. Filter timesheets based on view mode
        const filteredTimeSheets = initialTimeSheets.filter(ts => {
            if (viewMode === 'global') return true;
            if (viewMode === 'month') return ts.month === selectedMonth && ts.year === selectedYear;
            if (viewMode === 'soFar') {
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                // Logic: Year < CurrentYear OR (Year == CurrentYear AND Month <= CurrentMonth)
                if (ts.year < currentYear) return true;
                if (ts.year === currentYear && ts.month <= currentMonth) return true;
                return false;
            }
            return true;
        });

        // 2. Identify all relevant users (either in registrations or in timesheets)
        const relevantEmails = new Set<string>();
        registrations.forEach(r => relevantEmails.add(r.email));
        filteredTimeSheets.forEach(ts => {
            if (ts.useremail) relevantEmails.add(ts.useremail);
        });

        // 3. Aggregate data per user
        const data: UserData[] = [];

        relevantEmails.forEach(email => {
            const user = users.find(u => u.email === email);
            const registration = registrations.find(r => r.email === email);

            // Deduce role: First check registration, then fallback to any timesheet for this user
            let roleId = registration?.roleid;
            if (!roleId) {
                const tsWithRole = initialTimeSheets.find(ts => ts.useremail === email && ts.roleid);
                if (tsWithRole) roleId = tsWithRole.roleid;
            }

            const role = roles.find(r => r.roleid === roleId);

            // Get timesheets for this user (filtered by time view already)
            const userTimesheets = filteredTimeSheets.filter(ts => ts.useremail === email);

            const totalWorkload = userTimesheets.reduce((sum, ts) => sum + (ts.workload || 0), 0);
            const totalEstWorkload = userTimesheets.reduce((sum, ts) => sum + (ts.estworkload || 0), 0);

            data.push({
                email: email,
                name: user ? `${user.firstname} ${user.lastname}` : email,
                role: role ? role.name : 'Unknown', // Using name as role name
                workload: totalWorkload,
                estworkload: totalEstWorkload
            });
        });

        setUsersData(data);
    };



    const handleSaveEntry = async (data: any) => {
        // Upsert logic for timesheet
        // Only allow editing in Month view logic-wise ideally, or handle year/month selection in edit
        // For simplicity, we assume editing happens for the selected month/year in 'month' view, 
        // OR we need a modal to select month/year.
        // Let's assume we edit for the specific Month/Year selected if in Month view.

        let targetMonth = selectedMonth;
        let targetYear = selectedYear;

        if (viewMode === 'global') {
            // If global, we probably need to ask which month, but for MVP let's restrict editing to Month View or default current
            // Better: Only show edit table in Month View? 
            // Or just default to current month if global?
            // Let's enforce month view for editing specific values to avoid ambiguity.
            alert("Please switch to a specific month to edit values.");
            return;
        }

        try {
            const { error } = await supabase
                .from('timesheet')
                .upsert({
                    projectid: projectId,
                    useremail: data.email,
                    month: targetMonth,
                    year: targetYear,
                    workload: parseFloat(data.workload),
                    estworkload: parseFloat(data.estworkload),
                    createdat: new Date().toISOString(),
                    // Default values for required legacy columns if they don't exist
                    externaldevcount: 0,
                    brandeddevyearscount: 0
                }, { onConflict: 'useremail, projectid, month, year' });

            if (error) throw error;
            setEditingEntry(null);
            onDataUpdate();
        } catch (e) {
            console.error("Error saving timesheet:", e);
            alert("Failed to save. Ensure this user is assigned to the project.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Resource Consumption</h3>
                <div className={styles.controls}>
                    <div className={styles.toggle}>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'global' ? styles.active : ''}`}
                            onClick={() => setViewMode('global')}
                        >
                            Global
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'soFar' ? styles.active : ''}`}
                            onClick={() => setViewMode('soFar')}
                        >
                            Consumed So Far
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'month' ? styles.active : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            Monthly
                        </button>
                    </div>

                    {viewMode === 'month' && (
                        <div className={styles.datePicker}>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard} style={{ width: '100%' }}>
                    <h4>Resource Workload: Actual vs Estimated (Days)</h4>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={usersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="estworkload" name="Estimated" fill="#82ca9d" />
                                <Bar dataKey="workload" name="Actual" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h4>Resource Details {viewMode === 'month' ? `(${selectedMonth}/${selectedYear})` : viewMode === 'soFar' ? '(Consumed So Far)' : '(All Time)'}</h4>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Role</th>
                            <th>Actual (Days)</th>
                            <th>Estimated (Days)</th>
                            <th>Gap</th>
                            {viewMode === 'month' && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No data available for this period.</td></tr>
                        ) : usersData.map((user) => (
                            <tr key={user.email}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{user.name}</div>
                                        <div className={styles.userEmail}>{user.email}</div>
                                    </div>
                                </td>
                                <td><span className="badge badge-secondary">{user.role}</span></td>

                                {editingEntry === user.email ? (
                                    <>
                                        <td>
                                            <input
                                                id={`actual-${user.email}`}
                                                type="number"
                                                defaultValue={user.workload}
                                                className={styles.inputSm}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                id={`est-${user.email}`}
                                                type="number"
                                                defaultValue={user.estworkload}
                                                className={styles.inputSm}
                                            />
                                        </td>
                                        <td>-</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className="btn btn-sm btn-success" onClick={() => {
                                                    const actual = (document.getElementById(`actual-${user.email}`) as HTMLInputElement).value;
                                                    const est = (document.getElementById(`est-${user.email}`) as HTMLInputElement).value;
                                                    handleSaveEntry({ ...user, workload: actual, estworkload: est });
                                                }}>✓</button>
                                                <button className="btn btn-sm btn-secondary" onClick={() => setEditingEntry(null)}>✗</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{user.workload}</td>
                                        <td>{user.estworkload}</td>
                                        <td style={{ color: (user.estworkload - user.workload) < 0 ? 'red' : 'green' }}>
                                            {(user.estworkload - user.workload).toFixed(1)}
                                        </td>
                                        {viewMode === 'month' && (
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingEntry(user.email)}>✏️</button>
                                            </td>
                                        )}
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
