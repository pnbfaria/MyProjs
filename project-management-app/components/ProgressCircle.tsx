import styles from './ProgressCircle.module.css'

interface ProgressCircleProps {
    percentage: number
    label: string
}

export default function ProgressCircle({ percentage, label }: ProgressCircleProps) {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Project Progress</h3>
            <div className={styles.circleContainer}>
                <svg className={styles.svg} width="180" height="180">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(230, 85%, 60%)" />
                            <stop offset="100%" stopColor="hsl(250, 75%, 65%)" />
                        </linearGradient>
                    </defs>
                    <circle
                        className={styles.circleBackground}
                        cx="90"
                        cy="90"
                        r={radius}
                        strokeWidth="12"
                    />
                    <circle
                        className={styles.circleProgress}
                        cx="90"
                        cy="90"
                        r={radius}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 90 90)"
                    />
                </svg>
                <div className={styles.percentage}>
                    <span className={styles.value}>{percentage}%</span>
                    <span className={styles.label}>{label}</span>
                </div>
            </div>
        </div>
    )
}
