
import LivraisonClient from './LivraisonClient';
import { safeKvGet } from '@/lib/kvCache';

export const metadata = {
    title: 'Livraison et Expédition | Les Amis du CBD',
    description: 'Découvrez nos méthodes d\'expédition, nos délais de livraison rapides et nos garanties de discrétion.',
};

export const revalidate = 60;

export default async function LivraisonPage() {
    const [globalContent, content] = await Promise.all([
        safeKvGet('global_content', null),
        safeKvGet('livraison_content', null)
    ]);

    return <LivraisonClient globalContent={globalContent} content={content} />;
}
