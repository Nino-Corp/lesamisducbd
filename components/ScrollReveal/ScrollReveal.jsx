'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './ScrollReveal.module.css';

const ScrollReveal = ({
    children,
    animation = 'fade-up',
    duration = 600,
    delay = 0,
    threshold = 0.1,
    once = true,
    className = "",
    style = {}
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const element = domRef.current;
        if (!element) return;

        // Les blocs très hauts (ex. galerie d'analyses sur mobile) n'atteignent jamais
        // 10 % de visibilité : on se base aussi sur rootMargin et on limite le seuil effectif.
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    setIsVisible(false);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

        observer.observe(element);

        return () => observer.disconnect();
    }, [once]);

    const transitionStyle = {
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style
    };

    return (
        <div
            ref={domRef}
            className={`
                ${styles.revealItem} 
                ${styles[animation]} 
                ${isVisible ? styles.isVisible : ''} 
                ${className}
            `}
            style={transitionStyle}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
