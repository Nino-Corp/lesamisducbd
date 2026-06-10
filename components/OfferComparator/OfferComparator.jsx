'use client';
import { useState, useMemo } from 'react';
import styles from './OfferComparator.module.css';
import ContactModal from '@/components/ContactModal/ContactModal';
import { trackCTA } from '@/utils/analytics';

export default function OfferComparator() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [grammage, setGrammage] = useState(2);
    const [prixAchat, setPrixAchat] = useState(5);
    const [ventesMensuelles, setVentesMensuelles] = useState(100);
    const [prixAmis, setPrixAmis] = useState(0.8);

    // Unused in calculation but present in UI
    const [augmentation, setAugmentation] = useState(0);

    const calculations = useMemo(() => {
        const projectedVolume = ventesMensuelles * 12 * (1 + augmentation / 100);

        const annualCostCurrent = projectedVolume * prixAchat;
        const annualCostAmis = projectedVolume * (grammage * prixAmis);

        const savings = annualCostCurrent - annualCostAmis;

        return {
            annualCostCurrent,
            annualCostAmis,
            savings
        };
    }, [grammage, prixAchat, ventesMensuelles, prixAmis, augmentation]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Comparez votre offre avec Les Amis du CBD et calculez vos économies !
            </h2>

            <div className={styles.contentWrapper}>
                <div className={styles.inputsColumn}>

                    {/* Grammage Slider */}
                    <div className={styles.sliderGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Grammage de votre offre actuelle</label>
                            <div className={styles.valueBox}>{grammage} G</div>
                        </div>
                        <input
                            type="range"
                            min="1" max="10" step="0.5"
                            value={grammage}
                            onChange={(e) => setGrammage(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.rangeLabels}>
                            <span>1 G</span>
                            <span>10 G</span>
                        </div>
                    </div>

                    {/* Prix Achat Unitaire Slider */}
                    <div className={styles.sliderGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Prix d'achat unitaire de votre offre actuelle</label>
                            <div className={styles.valueBox}>€{prixAchat}</div>
                        </div>
                        <input
                            type="range"
                            min="1" max="10" step="0.5"
                            value={prixAchat}
                            onChange={(e) => setPrixAchat(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.rangeLabels}>
                            <span>€1</span>
                            <span>€10</span>
                        </div>
                    </div>

                    {/* Ventes Mensuelles Slider */}
                    <div className={styles.sliderGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Nombre de ventes mensuelles</label>
                            <div className={styles.valueBox}>{ventesMensuelles} unités</div>
                        </div>
                        <input
                            type="range"
                            min="10" max="500" step="10"
                            value={ventesMensuelles}
                            onChange={(e) => setVentesMensuelles(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.rangeLabels}>
                            <span>10 unités</span>
                            <span>500 unités</span>
                        </div>
                    </div>

                    {/* Prix Achat Gramme Amis Slider */}
                    <div className={styles.sliderGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Prix d'achat au gramme Les Amis du CBD</label>
                            <div className={styles.valueBox}>€{prixAmis.toString().replace('.', ',')}</div>
                        </div>
                        <input
                            type="range"
                            min="0.6" max="1" step="0.05"
                            value={prixAmis}
                            onChange={(e) => setPrixAmis(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.rangeLabels}>
                            <span>€0,6</span>
                            <span>€1</span>
                        </div>
                        <div className={styles.subText}>
                            Fleurs premium (4g) = 1€/g<br />
                            Fleurs premium (10g) = 0,8€/g<br />
                            Petites fleurs (10g) = 0,6€/g
                        </div>
                    </div>

                    {/* Augmentation Slider (Cosmetic/Info) */}
                    <div className={styles.sliderGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Augmentation des ventes</label>
                            <div className={styles.valueBox}>{augmentation}%</div>
                        </div>
                        <input
                            type="range"
                            min="0" max="100" step="1"
                            value={augmentation}
                            onChange={(e) => setAugmentation(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.rangeLabels}>
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                        <p className={styles.subText}>
                            Grâce à notre excellent rapport qualité/prix, les ventes de nos clients augmentent en moyenne de +47% !<br />
                            (Progression entre 2024 et 2025)
                        </p>
                    </div>

                </div>

                <div className={styles.resultsColumn}>
                    <div className={styles.resultsCard}>
                        <div className={styles.resultRow}>
                            <p className={styles.resultLabel}>Coût d'achat annuel de votre offre actuelle</p>
                            <p className={styles.resultValue}>€ {calculations.annualCostCurrent.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/\s/g, ' ')}</p>
                        </div>
                        <div className={styles.resultRow}>
                            <p className={styles.resultLabel}>Coût d'achat annuel Les Amis</p>
                            <p className={styles.resultValue}>€ {calculations.annualCostAmis.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/\s/g, ' ')}</p>
                        </div>

                        <h3 className={styles.savingsTitle}>Économies annuelles</h3>
                        <div className={styles.savingsAmount}>
                            € {calculations.savings.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/\s/g, ' ')}
                        </div>

                        <div className={styles.cardFooter}>
                            <h3>Achetez moins cher et Vendez plus !</h3>
                            <ul className={styles.benefitsList}>
                                <li>Entreprise française</li>
                                <li>Livraison gratuite en 24/48h</li>
                                <li>Zéro minimum de commande</li>
                                <li>Présentoirs et PLV offertes</li>
                                <li><span style={{ textDecoration: 'underline' }}>Satisfait ou remboursé !</span></li>
                            </ul>
                            <button
                                className={styles.ctaButton}
                                onClick={() => { trackCTA('professionnel_contact'); setIsModalOpen(true); }}
                            >
                                Contactez un conseiller sympa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
