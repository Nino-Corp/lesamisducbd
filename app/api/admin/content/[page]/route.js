import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Default content for each page (used as fallback)
const DEFAULTS = {
    essentiel: {
        hero: {
            title: "L'Essentiel",
            imageSrc: "/images/about/team.webp"
        },
        intro: [
            "Nous sommes une bande d'amis d'enfance, passionnés par le CBD et convaincus qu'il doit être simple, accessible et de qualité.",
            "Chez Les Amis du CBD, aucune étiquette compliquée, ni de noms artificiels, nous on utilise un vocabulaire du quotidien.",
            "Notre aventure, c'est avant tout une histoire d'amis, de partage et de sincérité, avec nos partenaires et nos clients."
        ],
        legalItems: [
            { title: "Le CBD est-il légal en France ?", description: "Oui, le CBD est légal en France, à condition de respecter un cadre réglementaire strict.", image: "/images/about/legal.webp" },
            { title: "Pourquoi les analyses en laboratoire sont essentielles ?", description: "Les analyses de laboratoire ne sont pas un argument marketing. Elles sont une garantie.", image: "/images/about/analysis.webp" },
            { title: "CBD et THC : deux molécules, deux effets très différents :", description: "Le CBD n'est pas psychotrope. Le THC est strictement réglementé.", image: "/images/about/molecules.webp" }
        ],
        cultureItems: [
            { title: "Culture naturelle : ce que cela change vraiment :", description: "Une culture naturelle permet de préserver les arômes d'origine et d'éviter les résidus chimiques.", image: "/images/about/culture_1.webp" },
            { title: "Le \"lavage\" du CBD : une pratique méconnue.", description: "Cette pratique peut altérer les arômes et appauvrir le profil naturel de la fleur.", image: "/images/about/culture_2.webp" },
            { title: "CBD pas cher : ce que cela veut vraiment dire.", description: "Une production simple, naturelle et maîtrisée permet de proposer un CBD accessible.", image: "/images/about/culture_3.webp" }
        ],
        essentialPoints: [
            "Le CBD est légal en France sous conditions strictes.",
            "Le CBD ne doit jamais être confondu avec des produits stupéfiants.",
            "La culture influence directement la qualité.",
            "La transparence est le meilleur indicateur de confiance."
        ],
        quote: { text: '"Comprendre avant d\'acheter.<br/>Explorer nos articles pédagogiques.<br/>Découvrir nos produits en toute confiance."', author: "Nelson — Les Amis du CBD" }
    },
    professionnel: {
        hero: {
            badgeText: "Nous rejoindre ?",
            title: "CBD accessible et pas cher pour professionnels : devenez partenaire des Amis du CBD.",
            text: "Les Amis du CBD est une marque française pensée pour les bureaux de tabac : du CBD naturel, légal, accessible en prix et simple à commercialiser.",
            imageSrc: "/images/professionnel/header-illustration.webp"
        },
        features1: [
            { title: "Sécurité & légalité avant tout", description: "Produits conformes à la législation française, avec moins de 0,3 % de THC." },
            { title: "Produits testés et traçables", description: "Analyses par des laboratoires indépendants et vente sous scellé de protection." },
            { title: "Zéro risque en bureau de tabac", description: "Une gamme pensée pour une vente simple, claire et sans mauvaise surprise." },
            { title: "CBD 100 % naturel, sans lavage chimique", description: "Fleurs cultivées naturellement, sans traitements artificiels." },
            { title: "Prix public ultra accessible", description: "Des fleurs entre 1,50 € et 2 € le gramme, adaptées à une forte demande." }
        ],
        features2: [
            { title: "Gain de temps au quotidien", description: "Commandes rapides et gestion simplifiée pour se concentrer sur les ventes." },
            { title: "Accompagnement clé en main", description: "Présentoirs adaptés, supports pédagogiques et outils d'aide à la vente inclus." },
            { title: "Différenciation en point de vente", description: "Une offre CBD claire qui vous démarque de la concurrence." },
            { title: "Marge attractive pour le buraliste", description: "Un produit accessible qui reste rentable et compétitif." },
            { title: "Excellent rapport qualité / prix", description: "Un positionnement rare sur le marché apprécié par les clients exigeants." }
        ],
        steps: [
            { title: "CONTACTEZ NOTRE ÉQUIPE COMMERCIALE", text: "Notre équipe est disponible pour répondre à vos questions. 06 71 82 42 87" },
            { title: "DEMANDEZ VOTRE KIT DE DÉMARRAGE", text: "Demandez votre kit de démarrage gratuit, incluant une sélection de nos produits phares." },
            { title: "Prenez une longueur d'avance", text: "Transformez votre bureau de tabac en un point de référence du CBD accessible." }
        ]
    },
    global: {
        contact: {
            title: "Les Amis du CBD France",
            address: "25 rue principale 07120 Chauzon (FR)",
            phone: "06 71 82 42 87",
            email: "lesamisducbd@gmail.com"
        },
        footerLinks: [
            { label: "Livraison", href: "/livraison" },
            { label: "CGV", href: "/cgv" },
            { label: "Politique de confidentialité", href: "/privacy" },
            { label: "Transparence", href: "/transparence" },
            { label: "Buraliste", href: "/professionnel" }
        ]
    }
};

export async function GET(request, { params }) {
    const { page } = await params;
    try {
        const data = await kv.get(`${page}_content`);
        return NextResponse.json(data || DEFAULTS[page] || {});
    } catch (error) {
        console.error(`[Content API] GET error for ${page}:`, error);
        return NextResponse.json(DEFAULTS[page] || {});
    }
}

export async function POST(request, { params }) {
    const { page } = await params;
    try {
        const body = await request.json();
        await kv.set(`${page}_content`, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[Content API] POST error for ${page}:`, error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
