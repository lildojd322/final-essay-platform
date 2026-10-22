import styles from '../Navigation/Navigation.module.scss'

const NavigationLoading = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', alignItems:'center' }}>
            <nav className={styles.nav} style={{ display: 'flex', gap: '1.833vw', }}>
                {[1, 2].map(link => (
                    <div key={link} className="skeleton-line" style={{ width: '64px', height: '34x' , margin: '0'}}></div>
                ))}
            </nav>
            <div className={styles.rightSection}>
                <div style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    background: '#6b7280',
                    marginRight: '1.04vw',
                    marginLeft: '10px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
            </div>
        </div>
    )
}

export default NavigationLoading    