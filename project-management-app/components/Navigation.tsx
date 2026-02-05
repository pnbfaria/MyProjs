'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.css'

export default function Navigation() {
    const pathname = usePathname()

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

                <div className={styles.links}>
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
            </div>
        </nav>
    )
}
