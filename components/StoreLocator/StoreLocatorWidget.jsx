'use client';

import dynamic from 'next/dynamic';
import styles from '../InteractiveMap/InteractiveMap.module.css';

const StoreLocator = dynamic(() => import('./StoreLocator'), {
    ssr: false,
    loading: () => <div style={{ height: '750px', background: '#f1f5f9', borderRadius: '40px' }}></div>
});

export default function StoreLocatorWidget(props) {
    return (
        <section className={styles.section}>
            <div className={styles.container} style={{ width: '100%', maxWidth: '1400px' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{props.title || "Où nous retrouver ?"}</h2>
                    {props.description && (
                        <div 
                            className={styles.subtitle} 
                            dangerouslySetInnerHTML={{ __html: props.description }} 
                        />
                    )}
                </div>

                <div style={{ width: '100%', height: '750px', position: 'relative', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px -10px rgba(26, 46, 53, 0.15)' }}>
                    <StoreLocator subtitle={false} />
                </div>
            </div>
        </section>
    );
}
