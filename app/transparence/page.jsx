
import TransparenceClient from './TransparenceClient';
import { safeKvGet } from '@/lib/kvCache';

export const metadata = {
    title: 'Transparence et Analyses | Les Amis du CBD',
    description: 'Découvrez notre engagement envers la qualité et consultez les résultats de nos analyses en laboratoire.',
};

export const revalidate = 60;

export default async function TransparencePage() {
    const [globalContent, content] = await Promise.all([
        safeKvGet('global_content', null),
        safeKvGet('transparence_content', null)
    ]);

    return <TransparenceClient globalContent={globalContent} content={content} />;
}
