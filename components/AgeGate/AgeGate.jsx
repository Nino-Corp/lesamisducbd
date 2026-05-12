'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AgeGate.module.css';

// Routes qui ne doivent jamais afficher l'age gate
const EXCLUDED_PREFIXES = ['/admin', '/connexion'];

const STORAGE_KEY = 'lesamisducbd_age_verified';

export default function AgeGate() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | entering | shown | exiting | refused
  const [shake, setShake] = useState(false);

  // Ne pas afficher sur les routes admin/connexion
  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (isExcluded) return;
    try {
      const verified = sessionStorage.getItem(STORAGE_KEY);
      if (!verified) {
        // Légère pause pour laisser la page se monter
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
      }
    } catch (_) {
      setVisible(true);
    }
  }, [isExcluded]);

  useEffect(() => {
    if (visible) {
      // Bloquer le scroll du body
      document.body.style.overflow = 'hidden';
      setPhase('entering');
      const t = setTimeout(() => setPhase('shown'), 50);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = '';
    }
  }, [visible]);

  const handleAccept = () => {
    setPhase('exiting');
    sessionStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 900);
  };

  const handleRefuse = () => {
    setPhase('refused');
  };

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${styles[phase]}`}
      aria-modal="true"
      role="dialog"
      aria-label="Vérification de l'âge"
    >
      {/* Particules flottantes */}
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i }} />
        ))}
      </div>

      {/* Fond animé – vagues organiques */}
      <div className={styles.bgWaves} aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rg1" cx="30%" cy="40%">
              <stop offset="0%" stopColor="#49b197" stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rg2" cx="75%" cy="65%">
              <stop offset="0%" stopColor="#00FF94" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="420" cy="380" rx="600" ry="400" fill="url(#rg1)" className={styles.blob1} />
          <ellipse cx="1050" cy="560" rx="500" ry="360" fill="url(#rg2)" className={styles.blob2} />
        </svg>
      </div>

      {/* Carte principale */}
      {phase !== 'refused' ? (
        <div className={`${styles.card} ${shake ? styles.shake : ''}`}>

          {/* Badge 18+ */}
          <div className={styles.badgeWrapper} aria-hidden="true">
            <div className={styles.badgeRing}>
              <div className={styles.badge}>
                <span className={styles.badgeNumber}>18</span>
                <span className={styles.badgePlus}>+</span>
              </div>
            </div>
            {/* Feuilles décoratives */}
            <svg className={styles.leafLeft} viewBox="0 0 60 80" fill="none">
              <path d="M30 75 C5 55 0 20 30 5 C30 5 30 55 30 75Z" fill="#49b197" opacity="0.7"/>
              <path d="M30 65 C15 45 12 25 30 15" stroke="#00FF94" strokeWidth="1.5" fill="none" opacity="0.5"/>
            </svg>
            <svg className={styles.leafRight} viewBox="0 0 60 80" fill="none">
              <path d="M30 75 C55 55 60 20 30 5 C30 5 30 55 30 75Z" fill="#2d8a68" opacity="0.6"/>
              <path d="M30 65 C45 45 48 25 30 15" stroke="#00FF94" strokeWidth="1.5" fill="none" opacity="0.5"/>
            </svg>
          </div>

          {/* Texte */}
          <div className={styles.content}>
            <p className={styles.eyebrow}>Accès réservé</p>
            <h1 className={styles.title}>
              Bienvenue chez<br />
              <span className={styles.brand}>Les Amis du CBD</span>
            </h1>
            <p className={styles.subtitle}>
              Notre boutique est exclusivement réservée aux personnes majeures.<br />
              Confirmez-vous avoir <strong>18 ans ou plus</strong> ?
            </p>

            {/* Boutons */}
            <div className={styles.actions}>
              <button
                id="age-gate-accept"
                className={styles.btnAccept}
                onClick={handleAccept}
              >
                <span className={styles.btnIcon}>✓</span>
                Oui, j'ai 18 ans ou plus
              </button>
              <button
                id="age-gate-refuse"
                className={styles.btnRefuse}
                onClick={handleRefuse}
              >
                Non, je suis mineur
              </button>
            </div>

            <p className={styles.legal}>
              En entrant, vous confirmez avoir l'âge légal requis dans votre pays de résidence pour accéder à ce site. Ce site utilise des cookies de session pour mémoriser votre choix.
            </p>
          </div>
        </div>
      ) : (
        /* Écran de refus */
        <div className={styles.refusedCard}>
          <div className={styles.refusedIcon} aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#49b197" strokeWidth="2" strokeDasharray="6 4" className={styles.dashCircle}/>
              <path d="M25 40 L55 40" stroke="#00FF94" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className={styles.refusedTitle}>Accès refusé</h2>
          <p className={styles.refusedText}>
            Vous devez avoir au moins <strong>18 ans</strong> pour accéder à ce site.
            Merci de votre compréhension.
          </p>
          <p className={styles.refusedEmoji} aria-hidden="true">🌿</p>
        </div>
      )}
    </div>
  );
}
