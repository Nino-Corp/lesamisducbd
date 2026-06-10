
import TransparenceClient from './TransparenceClient';
import { kv } from '@vercel/kv';

export const metadata = {
    title: 'Transparence et Analyses | Les Amis du CBD',
    description: 'Découvrez notre engagement envers la qualité et consultez les résultats de nos analyses en laboratoire.',
};

export const revalidate = 60;

export default async function TransparencePage() {
    let globalContent = null;
    let content = null;

    try {
        const [gData, cData] = await Promise.all([
            kv.get('global_content'),
            kv.get('transparence_content')
        ]);
        if (gData) globalContent = gData;
        if (cData) content = cData;
    } catch (e) {
        console.error('KV error (transparence):', e);
    }

    // Analytics: increment view counter
    try {
    if (process.env.NODE_ENV !== 'development') {
        await kv.incr(`builder_views:transparence`);
    }
    } catch (e) {
        console.error('Failed to increment view counter', e);
    }

    return <TransparenceClient globalContent={globalContent} content={content} />;
}
