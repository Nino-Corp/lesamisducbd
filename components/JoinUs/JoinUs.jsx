import styles from './JoinUs.module.css';
import Link from 'next/link';

// Le texte vient du CMS (HTML) : on remplace les emojis par des icônes Lucide (SVG inline,
// mêmes tracés que lucide-react Rocket / MapPin).
const svgIcon = (inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-3px;margin-right:8px">${inner}</svg>`;

const EMOJI_ICONS = {
    '🚀': svgIcon('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
    '📍': svgIcon('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
};

function replaceEmojis(html) {
    let out = html;
    for (const [emoji, svg] of Object.entries(EMOJI_ICONS)) {
        out = out.split(emoji).join(svg);
    }
    return out;
}

export default function JoinUs({ title, buttonLabel, buttonLink, text }) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                <Link href={buttonLink || "/recrutement"} className={styles.button}>
                    {buttonLabel}
                </Link>
                {text && <div className={styles.text} dangerouslySetInnerHTML={{ __html: replaceEmojis(text) }} />}
            </div>
        </section>
    );
}
