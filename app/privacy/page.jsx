
import PrivacyClient from './PrivacyClient';
import { kv } from '@vercel/kv';

export const metadata = {
    title: 'Politique de confidentialité | Les Amis du CBD',
    description: 'Consultez la Politique de confidentialité de la boutique Les Amis du CBD.',
};

export const revalidate = 60;

export default async function PrivacyPage() {

    let globalContent = null;
    let content = null;

    try {
        const [gData, cData] = await Promise.all([
            kv.get('global_content'),
            kv.get('privacy_content')
        ]);
        if (gData) globalContent = gData;
        if (cData) content = cData;
    } catch (e) {
        console.error('KV error (privacy):', e);
    }

    // Analytics: increment view counter
    try {
        await kv.incr(`builder_views:legal/privacy`);
    } catch (e) {
        console.error('Failed to increment view counter', e);
    }

    return <PrivacyClient globalContent={globalContent} content={content} />;
}
