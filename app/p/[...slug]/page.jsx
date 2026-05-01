import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import PageBuilder from '@/components/PageBuilder';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const revalidate = 60; // Cache for 1 minute

async function getPageData(slug) {
    try {
        const pages = await kv.get('builder_pages');
        if (pages && pages[slug]) {
            return pages[slug];
        }
    } catch (error) {
        console.error('Error fetching dynamic page:', error);
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;
    const page = await getPageData(pageSlug);

    if (!page) return {};

    return {
        title: `${page.title} - Les Amis du CBD`,
        description: `Découvrez notre page ${page.title} dédiée au CBD premium.`,
        alternates: {
            canonical: `/p/${pageSlug}`,
        },
    };
}

export default async function DynamicPage({ params }) {
    const { slug } = await params;
    const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;

    const [page, globalConfig] = await Promise.all([
        getPageData(pageSlug),
        kv.get('global_content').catch(() => null)
    ]);

    if (!page) {
        notFound();
    }

    // Prepare sections, injecting global header/footer if needed
    // The PageBuilder already handles most things, but we might want to wrap it
    // with standard Header/Footer if they aren't part of the dynamic sections.
    // In our case, the PageBuilder.jsx componentMap includes Header and Footer.

    // Check if sections already contain Header/Footer
    const pageSections = page.sections || [];
    const hasHeader = pageSections.some(s => s.type === 'Header');
    const hasFooter = pageSections.some(s => s.type === 'Footer');

    const finalSections = [...pageSections];

    if (!hasHeader) {
        finalSections.unshift({
            type: 'Header',
            props: {
                logoText: "LES AMIS DU CBD",
                logoImage: "/images/logo.webp",
                menuItems: [
                    { label: "PRODUITS", href: "/produits" },
                    { label: "L'ESSENTIEL", href: "/essentiel" },
                    { label: "CBD & USAGES", href: "/usages" },
                    { label: "PROFESSIONNEL", href: "/professionnel" }
                ]
            }
        });
    }

    if (!hasFooter) {
        finalSections.push({
            type: 'Footer',
            props: {
                columnLinks: globalConfig?.footerLinks || [
                    { label: "Livraison", href: "/livraison" },
                    { label: "CGV", href: "/cgv" },
                    { label: "Politique de confidentialité", href: "/privacy" },
                    { label: "Transparence", href: "/transparence" },
                    { label: "Professionnel", href: "/professionnel" }
                ],
                contactInfo: globalConfig?.contact || {
                    title: "Les Amis du CBD France",
                    address: "25 rue principale 07120 Chauzon (FR)",
                    phone: "06 71 82 42 87",
                    email: "lesamisducbd@gmail.com"
                },
                newsletter: {
                    placeholder: "Votre adresse e-mail",
                    disclaimer: "Vous pouvez vous désinscrire à tout moment.",
                    isVisible: globalConfig?.visibility?.newsletter !== false
                }
            }
        });
    }

    return (
        <main>
            <PageBuilder sections={finalSections} />
        </main>
    );
}
