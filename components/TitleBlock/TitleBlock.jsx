import React from 'react';
import styles from './TitleBlock.module.css';

export default function TitleBlock({ 
    text = 'Votre titre', 
    htmlTag = 'h2', 
    textAlign = 'center', 
    color = '#1F4B40', 
    fontFamily = 'inherit',
    fontSize = 'var(--text-3xl)'
}) {
    const Tag = htmlTag;
    
    return (
        <div className={styles.container} style={{ textAlign }}>
            <Tag 
                className={styles.title} 
                style={{ 
                    color, 
                    fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined,
                    fontSize
                }}
            >
                {text}
            </Tag>
        </div>
    );
}
