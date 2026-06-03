import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import PageBuilder from '@/components/PageBuilder';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';

export const revalidate = 60; // Cache for 1 minute

async function getPageData(slug, isPreview = false) {
    try {
        const pages = await kv.get('builder_pages');
        if (pages && pages[slug]) {
            const page = pages[slug];

            if (!isPreview) {
                // Block draft pages from public access
                const status = page.status || 'published'; // Legacy pages without status are considered published
                if (status === 'draft') return null;

                // Block scheduled pages that haven't reached their publish date
                if (status === 'scheduled' && page.scheduledAt) {
                    if (new Date(page.scheduledAt) > new Date()) return null;
                }
            }

            return page;
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

    const seo = page.seo || {};
    const title = seo.metaTitle || `${page.title} - Les Amis du CBD`;
    const description = seo.metaDescription || seo.excerpt || `Découvrez notre page ${page.title} dédiée au CBD premium.`;
    const canonical = seo.canonicalUrl || `/p/${pageSlug}`;
    const ogImage = seo.ogImage || '/images/og-image.jpg';

    return {
        title,
        description,
        alternates: { canonical },
        robots: {
            index: !seo.noindex,
            follow: !seo.noindex,
        },
        openGraph: {
            title: seo.ogTitle || title,
            description: seo.ogDescription || description,
            url: canonical,
            siteName: 'Les Amis du CBD',
            images: [{ url: ogImage, width: 1200, height: 630 }],
            type: (seo.pageType === 'Article' || seo.pageType === 'BlogPosting') ? 'article' : 'website',
            ...(seo.publishedAt ? { publishedTime: seo.publishedAt } : {}),
            ...(seo.author ? { authors: [seo.author] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.ogTitle || title,
            description: seo.ogDescription || description,
            images: [ogImage],
        },
    };
}

// Build JSON-LD schema based on page type
function buildJsonLd(page, pageSlug) {
    const seo = page.seo || {};
    const url = `https://www.lesamisducbd.fr/p/${pageSlug}`;
    const title = seo.metaTitle || page.title;
    const description = seo.metaDescription || seo.excerpt || '';
    const image = seo.ogImage || seo.featuredImage || 'https://www.lesamisducbd.fr/images/og-image.jpg';

    const base = {
        '@context': 'https://schema.org',
        name: title,
        description,
        url,
        image,
        publisher: {
            '@type': 'Organization',
            name: 'Les Amis du CBD',
            url: 'https://www.lesamisducbd.fr',
            logo: { '@type': 'ImageObject', url: 'https://www.lesamisducbd.fr/images/logo.webp' }
        }
    };

    if (seo.pageType === 'Article' || seo.pageType === 'BlogPosting') {
        return {
            ...base,
            '@type': seo.pageType || 'Article',
            headline: title,
            datePublished: seo.publishedAt || page.updatedAt,
            dateModified: page.updatedAt,
            author: { '@type': 'Person', name: seo.author || 'Les Amis du CBD' },
            keywords: seo.tags || '',
            articleSection: seo.category || 'CBD',
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        };
    }

    if (seo.pageType === 'FAQPage') {
        // Auto-extract FAQ items from page sections
        const faqSections = (page.sections || []).filter(s => s.type === 'FAQ');
        const faqItems = faqSections.flatMap(s => (s.props?.items || []).map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
        })));
        return {
            '@type': 'FAQPage',
            '@context': 'https://schema.org',
            mainEntity: faqItems,
        };
    }

    return { ...base, '@type': 'WebPage' };
}

export default async function DynamicPage(props) {
    const params = await props.params;
    const searchParams = await props.searchParams || {};
    
    const { slug } = params;
    const isPreview = searchParams.preview === 'true';
    const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;

    const [page, globalConfig] = await Promise.all([
        getPageData(pageSlug, isPreview),
        kv.get('global_content').catch(() => null)
    ]);

    if (!page) {
        notFound();
    }

    // Analytics: increment view counter on the server side (only if not previewing)
    if (!isPreview) {
        try {
            await kv.incr(`builder_views:${pageSlug}`);
        } catch (e) {
            console.error('Failed to increment view counter', e);
        }
    }

    // Prepare sections, injecting global header/footer if needed
    // The PageBuilder already handles most things, but we might want to wrap it
    // with standard Header/Footer if they aren't part of the dynamic sections.
    // In our case, the PageBuilder.jsx componentMap includes Header and Footer.

    // Check if sections already contain Header/Footer
    const pageSections = page.sections || [];
    const hasHeader = pageSections.some(s => s.type === 'Header');
    const hasFooter = pageSections.some(s => s.type === 'Footer');
    const hideHeaderFooter = page.seo?.hideHeaderFooter === true;

    const finalSections = [...pageSections];

    if (!hasHeader && !hideHeaderFooter) {
        finalSections.unshift({
            type: 'Header',
            props: {
                logoText: "LES AMIS DU CBD",
                logoImage: "/images/logo.webp",
                menuItems: globalConfig?.headerLinks || [
                    { label: "PRODUITS", href: "/produits" },
                    { label: "L'ESSENTIEL", href: "/essentiel" },
                    { label: "CBD & USAGES", href: "/usages" },
                    { label: "PROFESSIONNEL", href: "/professionnel" }
                ]
            }
        });
    }

    if (!hasFooter && !hideHeaderFooter) {
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

    const jsonLd = buildJsonLd(page, pageSlug);
    const isArticle = ['Article', 'BlogPosting'].includes(page.seo?.pageType);

    // Build breadcrumb items for articles
    const breadcrumbItems = isArticle ? [
        { label: 'Accueil', href: '/' },
        { label: 'Blog', href: '/blog' },
        ...(page.seo?.category ? [{ label: page.seo.category, href: `/blog?cat=${encodeURIComponent(page.seo.category)}` }] : []),
        { label: page.title, href: `/p/${pageSlug}` },
    ] : [];

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = isArticle ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            item: `https://www.lesamisducbd.fr${item.href}`,
        }))
    } : null;

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {breadcrumbJsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            )}
            {isArticle && breadcrumbItems.length > 0 && (
                <Breadcrumb items={breadcrumbItems} />
            )}
            <PageBuilder sections={finalSections} />
        </main>
    );
}
