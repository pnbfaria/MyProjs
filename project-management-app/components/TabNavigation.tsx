import styles from './TabNavigation.module.css'

interface TabNavigationProps {
    activeTab: string
    onTabChange: (tab: string) => void
    tabs: string[]
}

export default function TabNavigation({ activeTab, onTabChange, tabs }: TabNavigationProps) {
    const formatTabName = (tab: string) => {
        return tab
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {formatTabName(tab)}
                    </button>
                ))}
            </div>
        </div>
    )
}
