import { kv } from '@vercel/kv';
import EssentielClient from './EssentielClient';
import { SHARED_TITLE } from '../shared-metadata';

export const revalidate = 60;

export const metadata = {
    title: "L'Essentiel du CBD",
    description: "Tout savoir sur le CBD : bienfaits, législation, et nos guides pour choisir les produits adaptés à vos besoins. L'expertise Les Amis du CBD.",
    alternates: { canonical: '/essentiel' },
};

const DEFAULTS = {
    intro: [
        "Nous sommes une bande d'amis d'enfance, passionnés par le CBD et convaincus qu'il doit être simple, accessible et de qualité.",
        "Chez Les Amis du CBD, aucune étiquette compliquée, ni de noms artificiels, nous on utilise un vocabulaire du quotidien.",
        "Notre aventure, c'est avant tout une histoire d'amis, de partage et de sincérité, avec nos partenaires et nos clients."
    ],
    legalItems: [
        { title: "Le CBD est-il légal en France ?", description: "Oui, le CBD est légal en France, à condition de respecter un cadre réglementaire strict.\\nPour être autorisé à la vente et à la consommation, un produit à base de CBD doit impérativement :\\n• contenir un taux de THC inférieur ou égal à 0,3 %\\n• être issu de variétés de Cannabis sativa L. autorisées\\n• faire l'objet d'analyses réalisées par un laboratoire indépendant", image: "/images/about/legal.webp" },
        { title: "Pourquoi les analyses en laboratoire sont essentielles ?", description: "Les analyses de laboratoire ne sont pas un argument marketing.\\nElles sont une garantie.\\nChaque analyse permet de vérifier :\\n• le taux réel de THC\\n• la conformité légale du produit\\n• l'absence d'anomalies majeures\\nUn CBD sans analyse claire est un CBD sans preuve.", image: "/images/about/analysis.webp" },
        { title: "CBD et THC : deux molécules, deux effets très différents :", description: "Le CBD (cannabidiol) et le THC (tétrahydrocannabinol) sont deux molécules naturellement présentes dans le chanvre, mais leurs effets sont très différents.\\n\\nLe CBD :\\n• n'est pas psychotrope\\n• ne provoque pas d'euphorie\\n• est autorisé à la vente\\n\\nLe THC :\\n• est psychotrope\\n• peut entraîner des effets planants\\n• est strictement réglementé", image: "/images/about/molecules.webp" }
    ],
    cultureItems: [
        { title: "Culture naturelle : ce que cela change vraiment :", description: "La manière dont une plante est cultivée influence directement sa qualité finale.\\n\\nUne culture naturelle permet :\\n• de préserver les arômes d'origine\\n• d'éviter les résidus chimiques\\n• de respecter le rythme naturel de la plante", image: "/images/about/culture_1.webp" },
        { title: "Le \"lavage\" du CBD : une pratique méconnue.", description: "Lorsque certaines fleurs dépassent le seuil légal de THC, elles peuvent être \"lavées\" chimiquement afin de réduire artificiellement leur taux de THC.\\n\\nCette pratique peut altérer les arômes, modifier la couleur et appauvrir le profil naturel de la fleur.", image: "/images/about/culture_2.webp" },
        { title: "CBD pas cher : ce que cela veut vraiment dire.", description: "Un prix bas n'est pas forcément synonyme de mauvaise qualité. Mais un prix incohérent cache souvent des compromis.\\n\\nUne production simple, naturelle et maîtrisée permet de proposer un CBD accessible, sans sacrifier la qualité.", image: "/images/about/culture_3.webp" }
    ],
    essentialPoints: [
        "Le CBD est légal en France sous conditions strictes.",
        "Le CBD ne doit jamais être confondu avec des produits stupéfiants.",
        "La culture influence directement la qualité.",
        "La transparence est le meilleur indicateur de confiance."
    ],
    quote: {
        text: `"Comprendre avant d'acheter.<br/>Explorer nos articles pédagogiques.<br/>Découvrir nos produits en toute confiance."`,
        author: "Nelson — Les Amis du CBD"
    }
};

export default async function EssentielPage() {
    let content = DEFAULTS;
    let globalContent = null;
    try {
        const [kvData, globalData] = await Promise.all([
            kv.get('essentiel_content'),
            kv.get('global_content')
        ]);
        if (kvData) content = { ...DEFAULTS, ...kvData };
        if (globalData) globalContent = globalData;
    } catch (e) {
        console.error('KV error (essentiel/global):', e);
    }

    // Convert legacy data to sections if needed
    let sections = content.sections;
    if (!sections) {
        const visibility = content.visibility || {};
        sections = [
            { id: 'hero', type: 'ContentHero', props: { imageSrc: content?.hero?.imageSrc || "/images/about/team.webp", imagePosition: "center 35%", imageAlt: "L'équipe Les Amis du CBD", title: content?.hero?.title || "L'Essentiel" }, isVisible: visibility.hero !== false },
            { id: 'intro', type: 'EssentielIntro', props: { items: content.intro }, isVisible: visibility.intro !== false },
            { id: 'legal', type: 'EssentielCarousel', props: { title: "CBD : transparence,<br />légalité et ce qu'il faut<br />vraiment savoir.", intro: "Le CBD est partout. Mais entre informations approximatives, promesses exagérées et discours flous, il devient difficile de s'y retrouver. Cette page a un seul objectif : vous donner des informations claires, vérifiées et conformes à la réglementation française, pour consommer le CBD sans confusion.", items: content.legalItems }, isVisible: visibility.legalItems !== false },
            { id: 'culture', type: 'EssentielCarousel', props: { title: "Culture naturelle : ce que cela change<br />vraiment.", intro: "La manière dont est planté et cultivé influence directement sa qualité finale. Une culture naturelle permet :", items: content.cultureItems }, isVisible: visibility.cultureItems !== false },
            { id: 'essential', type: 'EssentielPoints', props: { items: content.essentialPoints }, isVisible: visibility.essentialPoints !== false },
            { id: 'quote', type: 'Quote', props: content.quote, isVisible: visibility.quote !== false },
            { id: 'joinus', type: 'JoinUs', props: { title: "Nous rejoindre", buttonLabel: "Venez par ici", buttonLink: "/recrutement", text: "Tu penses avoir le profil pour rejoindre l'équipe ? On attend ta candidature !" } }
        ];
    }

    // Analytics: increment view counter
    try {
    if (process.env.NODE_ENV !== 'development') {
        await kv.incr(`builder_views:essentiel`);
    }
    } catch (e) {
        console.error('Failed to increment view counter', e);
    }

    return <EssentielClient content={{ ...content, sections }} globalContent={globalContent} />;
}
