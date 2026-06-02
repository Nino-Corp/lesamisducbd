import React from 'react';

export default function CodeEmbed({ code }) {
    if (!code) return null;
    
    return (
        <div 
            style={{ width: '100%', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: code }} 
        />
    );
}
