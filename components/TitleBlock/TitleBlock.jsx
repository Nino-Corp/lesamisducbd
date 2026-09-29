import React from 'react';
import styles from './TitleBlock.module.css';

export default function TitleBlock({ 
    text = 'Votre titre', 
    htmlTag = 'h2'
}) {
    const Tag = htmlTag;
    
    return (
        <div className={styles.container}>
            <Tag 
                className={styles.title} 
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </div>
    );
}
