import styles from './FinancialSnapshot.module.css'

interface FinancialSnapshotProps {
    totalBudget: number
    percentCompleted: number
}

export default function FinancialSnapshot({ totalBudget, percentCompleted }: FinancialSnapshotProps) {
    const consumed = (totalBudget * percentCompleted) / 100
    const remaining = totalBudget - consumed
    const maxHeight = 200
    const totalHeight = totalBudget > 0 ? (totalBudget / totalBudget) * maxHeight : 0
    const consumedHeight = totalBudget > 0 ? (consumed / totalBudget) * maxHeight : 0
    const remainingHeight = totalBudget > 0 ? (remaining / totalBudget) * maxHeight : 0

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Financial Snapshot</h2>
            <div className={styles.chart}>
                <div className={styles.bar}>
                    <div className={styles.barContainer} style={{ height: `${maxHeight}px` }}>
                        <div
                            className={`${styles.barFill} ${styles.total}`}
                            style={{ height: `${totalHeight}px` }}
                        ></div>
                    </div>
                    <div className={styles.barLabel}>
                        <div className={styles.labelText}>Total Budget:</div>
                        <div className={styles.labelValue}>${totalBudget.toLocaleString()}</div>
                    </div>
                </div>

                <div className={styles.bar}>
                    <div className={styles.barContainer} style={{ height: `${maxHeight}px` }}>
                        <div
                            className={`${styles.barFill} ${styles.consumed}`}
                            style={{ height: `${consumedHeight}px` }}
                        ></div>
                    </div>
                    <div className={styles.barLabel}>
                        <div className={styles.labelText}>Consumed:</div>
                        <div className={styles.labelValue}>${consumed.toLocaleString()}</div>
                    </div>
                </div>

                <div className={styles.bar}>
                    <div className={styles.barContainer} style={{ height: `${maxHeight}px` }}>
                        <div
                            className={`${styles.barFill} ${styles.remaining}`}
                            style={{ height: `${remainingHeight}px` }}
                        ></div>
                    </div>
                    <div className={styles.barLabel}>
                        <div className={styles.labelText}>Remaining:</div>
                        <div className={styles.labelValue}>${remaining.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
