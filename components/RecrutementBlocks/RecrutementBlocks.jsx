'use client';

import React, { useState } from 'react';
import styles from './RecrutementBlocks.module.css';
import RecruitmentModal from '@/components/RecruitmentModal/RecruitmentModal';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';

// Helper for rendering multi-line string into <p> or <li>
const renderText = (textStr) => {
    if (!textStr) return null;
    const lines = textStr.split('\n');
    let listItems = [];
    const elements = [];

    lines.forEach((line, idx) => {
        const t = line.trim();
        if (t.startsWith('-') || t.startsWith('*')) {
            listItems.push(<li key={`li-${idx}`}>{t.substring(1).trim()}</li>);
        } else {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${idx}`} className={styles.jobList}>{listItems}</ul>);
                listItems = [];
            }
            if (t.length > 0) {
                elements.push(<p key={`p-${idx}`} className={styles.textBlock}>{t}</p>);
            }
        }
    });

    if (listItems.length > 0) {
        elements.push(<ul key={`ul-end`} className={styles.jobList}>{listItems}</ul>);
    }

    return <>{elements}</>;
};

export function RecrutementText({ title, text }) {
    if (!title && !text) return null;

    return (
        <ScrollReveal animation="fade-up">
            <section className={styles.contentSection}>
                {title && (
                    <h2 className={styles.mainTitle}>
                        {title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < title.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h2>
                )}
                {renderText(text)}
            </section>
        </ScrollReveal>
    );
}

export function RecrutementJobs({ title, jobs }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!jobs || jobs.length === 0) return null;

    return (
        <ScrollReveal animation="fade-up" delay={100}>
            <section className={styles.jobsSection}>
                {title && <h2 className={styles.jobsTitle}>{title}</h2>}
                <div className={styles.jobsGrid}>
                    {jobs.map((job, idx) => (
                        <div key={idx} className={styles.jobCard}>
                            <div className={styles.jobCardHeader}>
                                <h3 className={styles.jobTitle}>{job.title}</h3>
                                <span className={styles.jobBadge}>{job.type}</span>
                            </div>
                            <p className={styles.jobLocation}>📍 {job.location}</p>
                            <div className={styles.jobDescription}>
                                {renderText(job.description)}
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className={styles.applyBtn}>
                                Postuler
                            </button>
                        </div>
                    ))}
                </div>
                {isModalOpen && <RecruitmentModal onClose={() => setIsModalOpen(false)} />}
            </section>
        </ScrollReveal>
    );
}

export function RecrutementContact({ title, text }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!title && !text) return null;

    return (
        <ScrollReveal animation="fade-up" delay={200}>
            <section className={styles.contactCardSection}>
                <div className={styles.contactCard}>
                    {title && (
                        <h3 className={styles.cardTitle}>
                            {title.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < title.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </h3>
                    )}
                    {text && (
                        <p className={styles.cardText}>
                            {text.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < text.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </p>
                    )}
                    <button onClick={() => setIsModalOpen(true)} className={styles.contactButton}>
                        Contactez-nous !
                    </button>
                </div>
                {isModalOpen && <RecruitmentModal onClose={() => setIsModalOpen(false)} />}
            </section>
        </ScrollReveal>
    );
}
