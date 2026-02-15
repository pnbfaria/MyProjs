
import styles from './StatusCard.module.css'
import progressStyles from './ProgressCircle.module.css'

interface GlobalStatusCardProps {
    status: string
    percentage: number
}

export default function GlobalStatusCard({ status, percentage }: GlobalStatusCardProps) {
    const getStatusClass = () => {
        const s = status?.toLowerCase() || 'gray'
        if (s === 'green' || s.includes('track') || s.includes('good')) return 'success'
        if (s === 'amber' || s.includes('risk') || s.includes('delayed')) return 'warning'
        if (s === 'red' || s.includes('over') || s.includes('critical')) return 'danger'
        return 'primary'
    }

    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className={`${styles.card} ${styles[getStatusClass()]}`} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div className={styles.icon}>🌎</div>
                    <h3 className={styles.title}>Global Status</h3>
                    <div className={styles.status}>
                        <span className={styles.label}>Status:</span>
                        <span className={styles.value}>{status}</span>
                    </div>
                </div>
            </div>

            <div style={{ alignSelf: 'center', marginTop: '1rem', position: 'relative' }}>
                <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <defs>
                        <linearGradient id="globalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(230, 85%, 60%)" />
                            <stop offset="100%" stopColor="hsl(250, 75%, 65%)" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="var(--color-bg-tertiary)"
                        strokeWidth="12"
                        fill="none"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="url(#globalGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, var(--color-primary), hsl(250, 75%, 65%))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>{percentage}%</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Completed</span>
                </div>
            </div>
        </div>
    )
}
