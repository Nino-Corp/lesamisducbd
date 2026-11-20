'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Share, SquarePlus, EllipsisVertical, Download, Smartphone } from 'lucide-react';
import styles from './PwaInstall.module.css';

// Routes où l'info-bulle ne doit jamais apparaître
const EXCLUDED_PREFIXES = ['/admin', '/connexion', '/checkout'];
const DISMISS_KEY = 'lesamisducbd_pwa_dismissed';
const AGE_KEY = 'lesamisducbd_age_verified';
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 8000;

/**
 * Enregistre le service worker et affiche une info-bulle tuto
 * pour installer le site sur l'écran d'accueil (iOS, Android, desktop).
 */
export default function PwaInstall() {
  const pathname = usePathname();
  const [platform, setPlatform] = useState(null); // 'ios' | 'android' | 'prompt'
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p));

  // Service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isExcluded) return;

    // Déjà installé : rien à afficher
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) return;

    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86400000) return;
    } catch (_) {}

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);
    const isMobile = isIos || isAndroid;

    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        // Attendre que l'age gate soit validé
        try {
          if (!localStorage.getItem(AGE_KEY)) return schedule();
        } catch (_) {}
        setVisible(true);
      }, SHOW_DELAY_MS);
    };

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setPlatform(isMobile ? 'android' : 'prompt');
      if (!timer) schedule();
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setVisible(false));

    // iOS Safari ne déclenche pas beforeinstallprompt : tuto manuel (mobile uniquement)
    if (isIos) {
      setPlatform('ios');
      schedule();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, [isExcluded]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (_) {}
  };

  const install = async () => {
    if (!deferred) return setShowSteps(true);
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    dismiss();
  };

  if (!visible || isExcluded || !platform) return null;

  return (
    <div className={styles.wrapper} role="dialog" aria-label="Installer l'application">
      <div className={styles.card}>
        <button className={styles.close} onClick={dismiss} aria-label="Fermer">
          <X size={18} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconBox}>
            <Smartphone size={22} />
          </div>
          <div>
            <p className={styles.title}>Installez Les Amis du CBD</p>
            <p className={styles.subtitle}>Accès rapide depuis votre écran d&apos;accueil, comme une appli.</p>
          </div>
        </div>

        {platform === 'ios' && (
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepIcon}><Share size={16} /></span>
              Touchez le bouton <strong>Partager</strong> dans la barre de Safari
            </li>
            <li>
              <span className={styles.stepIcon}><SquarePlus size={16} /></span>
              Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong>
            </li>
            <li>
              <span className={styles.stepIcon}><Download size={16} /></span>
              Validez avec <strong>Ajouter</strong>
            </li>
          </ol>
        )}

        {platform !== 'ios' && (
          <>
            {showSteps && (
              <ol className={styles.steps}>
                <li>
                  <span className={styles.stepIcon}><EllipsisVertical size={16} /></span>
                  Ouvrez le menu de votre navigateur
                </li>
                <li>
                  <span className={styles.stepIcon}><SquarePlus size={16} /></span>
                  Touchez <strong>Installer l&apos;application</strong> ou <strong>Ajouter à l&apos;écran d&apos;accueil</strong>
                </li>
              </ol>
            )}
            <button className={styles.installBtn} onClick={install}>
              <Download size={16} /> Installer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
