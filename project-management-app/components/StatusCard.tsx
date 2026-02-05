import styles from './StatusCard.module.css'

interface StatusCardProps {
    title: string
    status: string
    justification: string
    type: 'timing' | 'budget' | 'scope'
}

export default function StatusCard({ title, status, justification, type }: StatusCardProps) {
    const getIcon = () => {
        if (type === 'timing') return '⏱️'
        if (type === 'budget') return '💰'
        return '✅'
    }

    const getStatusClass = () => {
        const s = status.toLowerCase()
        if (s.includes('risk') || s.includes('delayed')) return 'warning'
        if (s.includes('over') || s.includes('critical')) return 'danger'
        if (s.includes('track') || s.includes('good')) return 'success'
        return 'primary'
    }

    return (
        <div className={`${styles.card} ${styles[getStatusClass()]}`}>
            <div className={styles.icon}>{getIcon()}</div>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.status}>
                <span className={styles.label}>Status:</span>
                <span className={styles.value}>{status}</span>
            </div>
            <div className={styles.justification}>
                <span className={styles.label}>Justification:</span>
                <span className={styles.value}>{justification}</span>
            </div>
        </div>
    )
}
