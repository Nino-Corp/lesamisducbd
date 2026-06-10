import UsagesClient from './UsagesClient';
import { SHARED_TITLE } from '@/app/shared-metadata';
import { kv } from '@vercel/kv';


export const metadata = {
    title: "CBD & Usages",
    description: "Comment consommer le CBD ? Guides d'utilisation pour les fleurs, huiles et infusions. Conseils d'experts pour une expérience optimale.",
    alternates: {
        canonical: '/usages',
    },
};

export default async function UsagesPage() {
    let globalContent = null;
    let content = null;
    try {
        const globalData = await kv.get('global_content');
        if (globalData) globalContent = globalData;
        const pageData = await kv.get('content:usages');
        if (pageData) content = pageData;
    } catch (e) {
        console.error('KV error (usages/global):', e);
    }

    if (content && !content.sections) {
        const visibility = content.visibility || {};
        const usagesItems = content.carousel?.items || [
            {
                title: "Détente et relaxation",
                description: "Le CBD est souvent consommé pour favoriser un état de calme et de détente, surtout dans les périodes de stress ponctuel.\n\nIl peut être intégré à vos routines de relaxation, méditation ou moments cocooning.",
                image: "/images/usages/detente.webp"
            },
            {
                title: "Sommeil et routines nocturnes",
                description: "Certaines personnes intègrent le CBD à leur rituel du coucher. Il ne s'agit pas d'un somnifère, mais d'un complément qui peut aider à préparer un sommeil plus serein.\n\nUne bonne hygiène de sommeil reste essentielle : horaires réguliers, environnement calme et réduction des écrans.",
                image: "/images/usages/sommeil.webp"
            },
            {
                title: "Concentration et focus",
                description: "Le CBD peut accompagner certains moments de concentration, que ce soit pour le travail, les études ou les projets créatifs.\n\nIl s'agit d'un usage complémentaire, qui vise à favoriser un état calme et attentif sans stimuler artificiellement.",
                image: "/images/usages/cosmetique.webp"
            },
            {
                title: "Récupération physique",
                description: "Le CBD est parfois utilisé après l'effort pour soutenir la récupération naturelle.\n\nIl peut s'intégrer à une routine de récupération incluant repos, hydratation et étirements, mais il ne remplace pas les fondamentaux de la récupération physique.",
                image: "/images/usages/sport.webp"
            },
            {
                title: "Bien-être au quotidien",
                description: "Le CBD peut être intégré à des petites routines de bien-être au quotidien : pauses relaxantes, moments personnels ou rituels simples.\n\nL'important reste la régularité, l'écoute de soi et le respect des dosages conseillés.",
                image: "/images/usages/cuisine.webp"
            }
        ];

        content.sections = [
            { id: 'hero', type: 'ContentHero', props: {
                imageSrc: content?.hero?.imageSrc || "/images/usages/hero.webp",
                imagePosition: "center 35%",
                title: content?.hero?.title || "Le CBD ?"
            }, isVisible: visibility.intro !== false },
            { id: 'intro', type: 'UsagesIntro', props: {
                title: content?.intro?.title || "CBD : usages courants,\nlimites et bonnes pratiques.",
                text: content?.intro?.text || "Le CBD est utilisé par de nombreuses personnes dans la vie quotidienne.\nCette page présente 5 usages fréquents, avec leurs limites et bonnes pratiques.\nLe CBD n'est pas un médicament et ne remplace jamais un avis médical."
            }, isVisible: visibility.intro !== false },
            { id: 'carousel', type: 'UsagesCarouselBlock', props: {
                title: content?.carousel?.title || "Usages du CBD\nau quotidien :",
                items: usagesItems
            }, isVisible: visibility.carousel !== false },
            { id: 'warning', type: 'UsagesWarning', props: {
                title: content?.warning?.title || "Le CBD :\nn'est pas un médicament, ne guérit aucune maladie, ne remplace pas un traitement médical.\nEn cas de doute, de traitement en cours ou de condition particulière, consultez un professionnel de santé.",
                responsibleTitle: content?.warning?.responsibleTitle || "Pour une utilisation responsable :\nproduits analysés en laboratoire, origine claire, taux de THC conforme, information transparente"
            }, isVisible: visibility.warning !== false },
            { id: 'essential', type: 'UsagesEssentialBox', props: {
                title: content?.essential?.title || "L'essentiel sur les usages du CBD :",
                items: content?.essential?.items || [
                    "Le CBD s'inscrit dans une démarche de bien-être",
                    "Les usages varient selon les individus",
                    "Il ne s'agit jamais d'un traitement médical",
                    "La qualité et la transparence sont essentielles"
                ]
            }, isVisible: visibility.essential !== false },
            { id: 'quote', type: 'Quote', props: {
                text: content?.quote?.text || "\"Découvrir le CBD en toute responsabilité.<br/>Explorez nos produits.<br/>Lire nos guides pédagogiques.\"",
                author: content?.quote?.author || "Nelson — Les Amis du CBD"
            }, isVisible: visibility.quote !== false },
            { id: 'joinus', type: 'JoinUs', props: {
                title: content?.joinUs?.title || "Nous rejoindre",
                buttonLabel: content?.joinUs?.buttonLabel || "Venez par ici",
                buttonLink: content?.joinUs?.buttonLink || "/recrutement",
                text: content?.joinUs?.text || "Aucun poste ouvert pour le moment ? Les candidatures spontanées sont toujours les bienvenues."
            }, isVisible: visibility.joinUs !== false }
        ];
    }

    // Analytics: increment view counter
    try {
        await kv.incr(`builder_views:usages`);
    } catch (e) {
        console.error('Failed to increment view counter', e);
    }

    return <UsagesClient globalContent={globalContent} content={content} />;
}

