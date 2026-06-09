import React from 'react';
import { MonitorCheck, PackageSearch, Truck, Home } from 'lucide-react';
import styles from './DeliverySteps.module.css';

export default function DeliverySteps({ props }) {
    return (
        <section className={styles.schemaSection}>
            <div className={styles.stepsGrid}>
                {/* Step 1 */}
                <div className={styles.stepCard}>
                    <div className={styles.iconContainer}>
                        <div className={styles.stepNumber}>1</div>
                        <MonitorCheck size={48} className={styles.icon} />
                    </div>
                    <div className={styles.stepHeader}>1. Commande</div>
                    <p className={styles.stepText}>
                        Je valide ma commande, et je reçois <strong>un mail de confirmation avec</strong> mes coordonnées.
                    </p>
                </div>

                {/* Step 2 */}
                <div className={styles.stepCard}>
                    <div className={styles.iconContainer}>
                        <div className={styles.stepNumber}>2</div>
                        <PackageSearch size={48} className={styles.icon} />
                    </div>
                    <div className={styles.stepHeader}>2. Préparation</div>
                    <p className={styles.stepText}>
                        Si j'ai commandé <strong>avant midi</strong>, ma commande est préparée et <strong>expédiée le jour même</strong>.
                    </p>
                </div>

                {/* Step 3 */}
                <div className={styles.stepCard}>
                    <div className={styles.iconContainer}>
                        <div className={styles.stepNumber}>3</div>
                        <Truck size={48} className={styles.icon} />
                    </div>
                    <div className={styles.stepHeader}>3. Expédition</div>
                    <p className={styles.stepText}>
                        Mon colis est remis aux services postaux et je reçois <strong>un lien de suivi de colis</strong>.
                    </p>
                </div>

                {/* Step 4 */}
                <div className={styles.stepCard}>
                    <div className={styles.iconContainer}>
                        <div className={styles.stepNumber}>4</div>
                        <Home size={48} className={styles.icon} />
                    </div>
                    <div className={styles.stepHeader}>4. Livraison</div>
                    <p className={styles.stepText}>
                        En moyenne, <strong>48h</strong> plus tard, le livreur m'apporte mon colis <strong>chez moi ou en point relais</strong>.
                    </p>
                </div>
            </div>
        </section>
    );
}
