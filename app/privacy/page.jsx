
import PrivacyClient from './PrivacyClient';
import { safeKvGet } from '@/lib/kvCache';

export const metadata = {
    title: 'Politique de confidentialité | Les Amis du CBD',
    description: 'Consultez la Politique de confidentialité de la boutique Les Amis du CBD.',
};

export const revalidate = 60;

export default async function PrivacyPage() {
    const [globalContent, content] = await Promise.all([
        safeKvGet('global_content', null),
        safeKvGet('privacy_content', null)
    ]);

    return <PrivacyClient globalContent={globalContent} content={content} />;
}
