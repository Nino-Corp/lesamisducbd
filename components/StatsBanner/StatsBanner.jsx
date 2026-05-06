import styles from './StatsBanner.module.css';

export default function StatsBanner({
    stats = [
        { value: '100%', label: 'Naturel' },
        { value: '<0.3%', label: 'THC' },
        { value: '50+', label: 'Produits' },
        { value: '24h', label: 'Livraison' },
    ],
    backgroundColor = "#1F4B40",
    textColor = "#ffffff",
    accentColor = "#00FF94"
}) {
    return (
        <section className={styles.section}>
            <div className={styles.bubble} style={{ backgroundColor }}>
                <div className={styles.inner}>
                    {stats.map((s, i) => (
                        <div key={i} className={styles.stat}>
                            <span className={styles.value} style={{ color: accentColor }}>{s.value}</span>
                            <span className={styles.label} style={{ color: textColor }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
