import styles from './AuthorCard.module.css';
import Image from 'next/image';

export default function AuthorCard({ name, role, bio, imageSrc, twitter, linkedin, website }) {
    if (!name) return null;
    return (
        <section className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.avatarWrapper}>
                    {imageSrc ? (
                        <Image src={imageSrc} alt={name} width={80} height={80} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>{name.charAt(0).toUpperCase()}</div>
                    )}
                </div>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <div>
                            <p className={styles.label}>Rédigé par</p>
                            <h3 className={styles.name}>{name}</h3>
                            {role && <p className={styles.role}>{role}</p>}
                        </div>
                        <div className={styles.socials}>
                            {twitter && (
                                <a href={twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                            )}
                            {linkedin && (
                                <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </a>
                            )}
                            {website && (
                                <a href={website} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Site web">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                </a>
                            )}
                        </div>
                    </div>
                    {bio && <p className={styles.bio}>{bio}</p>}
                </div>
            </div>
        </section>
    );
}
