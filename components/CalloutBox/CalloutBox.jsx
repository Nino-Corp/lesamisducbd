import styles from './CalloutBox.module.css';
import { Info, Lightbulb, AlertTriangle, AlertCircle, MessageSquareQuote } from 'lucide-react';

const TYPES = {
    note:    { Icon: Info, label: 'Note',     colorVar: '--callout-note' },
    tip:     { Icon: Lightbulb, label: 'Conseil',  colorVar: '--callout-tip' },
    warning: { Icon: AlertTriangle, label: 'Attention', colorVar: '--callout-warning' },
    danger:  { Icon: AlertCircle, label: 'Important', colorVar: '--callout-danger' },
    quote:   { Icon: MessageSquareQuote, label: 'À retenir', colorVar: '--callout-quote' },
};

export default function CalloutBox({ type = 'note', title, content, emoji }) {
    const t = TYPES[type] || TYPES.note;
    const IconComponent = t.Icon;

    return (
        <div className={`${styles.wrapper} ${styles[type]}`}>
            <div className={styles.iconCol}>
                <span className={styles.icon} role="img" aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                    {emoji ? emoji : <IconComponent size={22} />}
                </span>
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
