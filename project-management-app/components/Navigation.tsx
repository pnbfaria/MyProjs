'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.css'
import { useUser } from '@/context/UserContext'

export default function Navigation() {
    const pathname = usePathname()
    const { currentUser, setCurrentUser, allUsers } = useUser()

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(path + '/')
    }

    // ... existing imports

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/fujitsu-logo.png"
                        alt="Fujitsu"
                        width={120}
                        height={40}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                    <span className={styles.logoDivider}>|</span>
                    <span className={styles.logoSubtitle}>Project Management</span>
                </Link>

                <div className={styles.links} style={{ flex: 1, justifyContent: 'center' }}>
                    <Link
                        href="/"
                        className={`${styles.link} ${isActive('/') && !pathname?.startsWith('/backoffice') ? styles.active : ''}`}
                    >
                        Projects
                    </Link>
                    <Link
                        href="/backoffice/users"
                        className={`${styles.link} ${isActive('/backoffice/users') ? styles.active : ''}`}
                    >
                        Users
                    </Link>
                    <Link
                        href="/backoffice/clients"
                        className={`${styles.link} ${isActive('/backoffice/clients') ? styles.active : ''}`}
                    >
                        Clients
                    </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>As:</span>
                    <select
                        value={currentUser?.email || ''}
                        onChange={(e) => {
                            const user = allUsers.find(u => u.email === e.target.value)
                            setCurrentUser(user || null)
                        }}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '0.85rem',
                            maxWidth: '150px'
                        }}
                    >
                        <option value="">Select User</option>
                        {allUsers.map(user => (
                            <option key={user.email} value={user.email}>
                                {user.firstname} {user.lastname}
                            </option>
                        ))}
                    </select>
                    {currentUser && (
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#E60012',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {currentUser.firstname?.[0]}{currentUser.lastname?.[0]}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
