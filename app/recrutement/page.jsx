
import RecruitmentClient from './RecruitmentClient';
import { kv } from '@vercel/kv';

export const metadata = {
    title: "Rejoignez l'équipe",
    description: "Carrières chez Les Amis du CBD. Nous recherchons des talents passionnés par le CBD et le commerce responsable. Postulez dès maintentant.",
    alternates: {
        canonical: '/recrutement',
    },
};

export const revalidate = 60;

export default async function RecrutementPage() {

    let globalContent = null;
    let content = null;

    try {
        const [gData, cData] = await Promise.all([
            kv.get('global_content'),
            kv.get('recrutement_content')
        ]);
        if (gData) globalContent = gData;
        if (cData) content = cData;
    } catch (e) {
        console.error('KV error (recrutement):', e);
    }

    if (content && !content.sections) {
        const visibility = content.visibility || {};
        content.sections = [
            { id: 'hero', type: 'ContentHero', props: {
                title: content?.hero?.title || "Intégrer l'équipe ?",
                imageSrc: content?.hero?.imageSrc || "/images/recrutement/handshake.webp",
            }, isVisible: visibility.hero !== false },
            
            { id: 'content', type: 'RecrutementText', props: {
                title: content?.content?.title || "Rejoindre l'équipe\nLes Amis du CBD",
                text: content?.content?.text || "Les Amis du CBD, c'est avant tout une aventure humaine.\nUne équipe qui avance ensemble, avec des valeurs simples : transparence, exigence et proximité.\nNous ne recrutons pas en permanence, mais nous sommes toujours curieux de découvrir de nouveaux profils. Que vous veniez du terrain, du commerce, de la communication ou d'un tout autre horizon, les candidatures spontanées sont les bienvenues.\nSi vous partagez notre vision d'un CBD accessible, responsable et bien fait, n'hésitez pas à nous écrire.\nParfois, les meilleures collaborations commencent sans offre précise."
            }, isVisible: visibility.content !== false },
            
            { id: 'jobs', type: 'RecrutementJobs', props: {
                title: "Offres en cours",
                jobs: content?.jobs || []
            }, isVisible: visibility.jobs !== false },

            { id: 'contact', type: 'RecrutementContact', props: {
                title: content?.contactCard?.title || "Envie d'en\nsavoir plus ?",
                text: content?.contactCard?.text || "Un CV, une lettre de motivation ou simplement l'envie d'échanger ?\nContactez-nous, on vous répond avec plaisir."
            }, isVisible: visibility.contactCard !== false }
        ];
    }

    return <RecruitmentClient globalContent={globalContent} content={content} />;
}
