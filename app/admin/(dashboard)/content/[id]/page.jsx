'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Editors
import HeroEditor from './HeroEditor';
import MarqueeEditor from './MarqueeEditor';
import FAQEditor from './FAQEditor';
import QuoteEditor from './QuoteEditor';
import PartnersNetworkEditor from './PartnersNetworkEditor';
import PartnersEditor from './PartnersEditor';
import WhyChooseUsEditor from './WhyChooseUsEditor';

export default function EditContentPage() {
    const params = useParams();
    const id = params.id; // Correct way to get ID in Client Component

    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const fetchSection = async () => {
            try {
                const res = await fetch('/api/admin/content');
                const data = await res.json();
                const found = data.sections.find(s => s.id === id);
                if (found) {
                    setSection(found);
                } else {
                    alert('Section introuvable');
                    router.push('/admin/content');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSection();
    }, [id, router]);

    const handleSave = async (sectionId, newProps) => {
        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId, newProps }),
            });

            if (res.ok) {
                alert('Modifications enregistrées !');
                router.refresh(); // Refresh server data
                router.push('/admin/content');
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
            console.error(error);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;
    if (!section) return null;

    const renderEditor = () => {
        switch (section.type) {
            case 'Hero':
                return <HeroEditor section={section} onSave={handleSave} />;
            case 'Marquee':
                return <MarqueeEditor section={section} onSave={handleSave} />;
            case 'FAQ':
                return <FAQEditor section={section} onSave={handleSave} />;
            case 'Quote':
                return <QuoteEditor section={section} onSave={handleSave} />;
            case 'PartnersNetwork':
                return <PartnersNetworkEditor section={section} onSave={handleSave} />;
            case 'Partners':
                return <PartnersEditor section={section} onSave={handleSave} />;
            case 'WhyChooseUs':
                return <WhyChooseUsEditor section={section} onSave={handleSave} />;
            default:
                return <div>Éditeur non implémenté pour {section.type}</div>;
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/admin/content" style={{ textDecoration: 'none', color: '#666' }}>
                    &larr; Retour
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F4B40', margin: 0 }}>
                    Modifier : {section.type}
                </h1>
            </div>

            {renderEditor()}
        </div>
    );
}
