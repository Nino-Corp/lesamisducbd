import styles from './Divider.module.css';

export default function Divider({
    style = "line",
    spacing = "medium",
    color = "#e5e7eb"
}) {
    const spacingMap = { small: '20px', medium: '40px', large: '80px' };
    const py = spacingMap[spacing] || '40px';

    return (
        <div className={styles.wrapper} style={{ paddingTop: py, paddingBottom: py }}>
            <div className={styles.inner}>
                {style === 'line' && <hr className={styles.line} style={{ borderColor: color }} />}
                {style === 'dots' && (
                    <div className={styles.dots} style={{ color }}>
                        <span /><span /><span />
                    </div>
                )}
            </div>
        </div>
    );
}
