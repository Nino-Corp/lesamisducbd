import styles from './CalloutBox.module.css';

const TYPES = {
    note:    { icon: 'ℹ️', label: 'Note',     colorVar: '--callout-note' },
    tip:     { icon: '💡', label: 'Conseil',  colorVar: '--callout-tip' },
    warning: { icon: '⚠️', label: 'Attention', colorVar: '--callout-warning' },
    danger:  { icon: '🚨', label: 'Important', colorVar: '--callout-danger' },
    quote:   { icon: '💬', label: 'À retenir', colorVar: '--callout-quote' },
};

export default function CalloutBox({ type = 'note', title, content, emoji }) {
    const t = TYPES[type] || TYPES.note;
    const icon = emoji || t.icon;

    return (
        <div className={`${styles.wrapper} ${styles[type]}`}>
            <div className={styles.iconCol}>
                <span className={styles.icon} role="img" aria-hidden="true">{icon}</span>
            </div>
            <div className={styles.body}>
                {title && <p className={styles.title}>{title || t.label}</p>}
                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: content || '' }}
                />
            </div>
        </div>
    );
}
