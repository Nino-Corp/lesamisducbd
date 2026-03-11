import { kv } from '@vercel/kv';
import ProfessionnelClient from './ProfessionnelClient';
import { SHARED_TITLE } from '@/app/shared-metadata';

export const revalidate = 60;

export const metadata = {
    title: 'Espace Professionnel & Revendeurs',
    description: 'Devenez partenaire des Amis du CBD. Offres exclusives pour professionnels et revendeurs : produits premium, marges attractives et accompagnement personnalisé.',
    alternates: { canonical: '/professionnel' },
};

const DEFAULTS = {
    hero: {
        title: "CBD accessible et pas cher pour professionnels : devenez partenaire des Amis du CBD.",
        text: "Les Amis du CBD est une marque française pensée pour les professionnels et revendeurs : du CBD naturel, légal, accessible en prix et simple à commercialiser.\n\nNotre ambition est claire : démocratiser le CBD de qualité, sans promesses floues ni prix excessifs.\n\nVotre boutique est le lieu idéal pour proposer un CBD pas cher, fiable et conforme à la réglementation, à une clientèle de plus en plus demandeuse."
    },
    features1: [
        { title: "Sécurité & légalité avant tout", description: "Produits conformes à la législation française, avec moins de 0,3 % de THC." },
        { title: "Produits testés et traçables", description: "Analyses par des laboratoires indépendants et vente sous scellé de protection." },
        { title: "Zéro risque en boutique", description: "Une gamme pensée pour une vente simple, claire et sans mauvaise surprise." },
        { title: "CBD 100 % naturel, sans lavage chimique", description: "Fleurs cultivées naturellement, sans traitements artificiels, pour une qualité constante." },
        { title: "Prix public ultra accessible", description: "Des fleurs entre 1,50 € et 2 € le gramme, adaptées à une forte demande." }
    ],
    features2: [
        { title: "Gain de temps au quotidien", description: "Commandes rapides et gestion simplifiée pour se concentrer sur les ventes." },
        { title: "Accompagnement clé en main", description: "Présentoirs adaptés, supports pédagogiques et outils d'aide à la vente inclus." },
        { title: "Différenciation en point de vente", description: "Une offre CBD claire qui vous démarque de la concurrence." },
        { title: "Marge attractive pour le professionnel", description: "Un produit accessible qui reste rentable et compétitif." },
        { title: "Excellent rapport qualité / prix", description: "Un positionnement rare sur le marché, apprécié par les clients exigeants." }
    ],
    steps: [
        { title: "CONTACTEZ NOTRE ÉQUIPE COMMERCIALE", text: "Notre équipe est disponible pour répondre à vos questions et vous accompagner dans la mise en place.\n06 71 82 42 87" },
        { title: "DEMANDEZ VOTRE KIT DE DÉMARRAGE", text: "Vous souhaitez tester le potentiel du CBD dans votre boutique ?\n\nDemandez votre kit de démarrage gratuit, incluant une sélection de nos produits phares, pour évaluer rapidement les ventes." },
        { title: "Prenez une longueur d'avance sur vos concurrents", text: "Transformez votre commerce en un point de référence du CBD accessible et pas cher, tout en rassurant votre clientèle sur la qualité et la légalité des produits.\n\nLes Amis du CBD, c'est le CBD bien fait, bien expliqué, et bien vendu." }
    ]
};
export default async function ProfessionnelPage() {
    let content = DEFAULTS;
    let globalContent = null;
    try {
        const [kvData, globalData] = await Promise.all([
            kv.get('professionnel_content'),
            kv.get('global_content')
        ]);
        if (kvData) content = { ...DEFAULTS, ...kvData };
        if (globalData) globalContent = globalData;
    } catch (e) {
        console.error('KV error (professionnel/global):', e);
    }
    return <ProfessionnelClient content={content} globalContent={globalContent} />;
}
