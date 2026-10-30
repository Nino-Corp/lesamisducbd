import { safeKvGet } from '@/lib/kvCache';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPageRedirect } from '@/lib/pageRedirects';
import PageBuilder from '@/components/PageBuilder';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import ArticleSidebar from '@/components/ArticleSidebar/ArticleSidebar';

export const revalidate = 60; // Cache for 1 minute

async function getPageData(slug, isPreview = false) {
    try {
        const pages = await safeKvGet('builder_pages', {});
        if (pages && pages[slug]) {
            const page = pages[slug];

            if (!isPreview) {
                const status = page.status || 'published';
                if (status === 'draft') return { page: null, allPages: null };

                if (status === 'scheduled' && page.scheduledAt) {
                    if (new Date(page.scheduledAt) > new Date()) return { page: null, allPages: null };
                }
            }

            return { page, allPages: pages };
        }
    } catch (error) {
        console.error('Error fetching dynamic page:', error);
    }
    return { page: null, allPages: null };
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;
    const { page } = await getPageData(pageSlug);

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

    const [{ page, allPages }, globalConfig] = await Promise.all([
        getPageData(pageSlug, isPreview),
        safeKvGet('global_content', null)
    ]);

    if (!page) {
        // Page déplacée dans un autre dossier : redirection permanente pour garder le référencement
        const movedTo = await getPageRedirect(pageSlug);
        if (movedTo) permanentRedirect(`/p/${movedTo}`);
        notFound();
    }


    // Prepare sections, injecting global header/footer if needed
    // The PageBuilder already handles most things, but we might want to wrap it
    // with standard Header/Footer if they aren't part of the dynamic sections.
    // In our case, the PageBuilder.jsx componentMap includes Header and Footer.

    // Check if sections already contain Header/Footer
    const pageSections = page.sections || [];
    
    // Utility to recursively clean &nbsp; from all string props
    const cleanHtmlStrings = (obj) => {
        if (typeof obj === 'string') return obj.replace(/&nbsp;/g, ' ');
        if (Array.isArray(obj)) return obj.map(cleanHtmlStrings);
        if (typeof obj === 'object' && obj !== null) {
            const newObj = {};
            for (const key in obj) newObj[key] = cleanHtmlStrings(obj[key]);
            return newObj;
        }
        return obj;
    };

    const hasHeader = pageSections.some(s => s.type === 'Header');
    const hasFooter = pageSections.some(s => s.type === 'Footer');
    const hideHeaderFooter = page.seo?.hideHeaderFooter === true;

    const finalSections = cleanHtmlStrings([...pageSections]);

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
                marginTop: 'medium',
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

    // Détection des pages piliers, catégories ou hubs
    const hasCategoryFilter = pageSections.some(s => s.type === 'BlogCategoryFilter');
    const isCategoryOrPillar = ['CategoryPage', 'PillarPage'].includes(page.seo?.pageType) ||
                               page.seo?.isCategoryPage === true ||
                               page.seo?.isPillarPage === true ||
                               hasCategoryFilter;

    // Vrai article de blog : Article ou BlogPosting uniquement (jamais LandingPage, WebPage, FAQ ou hub)
    const isBlogArticleType = (page.seo?.pageType === 'Article' || page.seo?.pageType === 'BlogPosting') && !isCategoryOrPillar;

    // Affichage du sommaire et de la colonne latérale :
    // - Si désactivé explicitement via seo.showSidebar === false -> pas de sommaire
    // - Si activé explicitement via seo.showSidebar === true -> oui (sauf si bloc filtre catégorie)
    // - Par défaut -> uniquement sur les vrais articles de blog
    const isArticle = page.seo?.showSidebar !== undefined
        ? (page.seo.showSidebar === true && !hasCategoryFilter)
        : isBlogArticleType;

    // Fil d'Ariane : actif sur toutes les pages (sauf si explicitement désactivé via seo.hideBreadcrumb ou hideHeaderFooter)
    const isBlogRelated = isBlogArticleType || page.seo?.pageType === 'CategoryPage' || page.seo?.pageType === 'PillarPage' || hasCategoryFilter;
    const showBreadcrumb = !page.seo?.hideBreadcrumb && !hideHeaderFooter;

    let breadcrumbItems = [];
    if (showBreadcrumb) {
        if (isBlogRelated) {
            breadcrumbItems = [
                { label: 'Accueil', href: '/' },
                { label: 'Blog', href: '/blog' },
                ...(page.seo?.category ? [{ label: page.seo.category, href: `/blog?cat=${encodeURIComponent(page.seo.category)}` }] : []),
                { label: page.title, href: `/p/${pageSlug}` },
            ];
        } else {
            // Dossiers du slug (guides/sommeil/page) → étapes intermédiaires du fil d'Ariane.
            // Un dossier n'est lié que si une page existe à ce chemin.
            const folderParts = pageSlug.split('/').slice(0, -1);
            const folderItems = folderParts.map((part, i) => {
                const path = folderParts.slice(0, i + 1).join('/');
                const folderPage = allPages?.[path];
                return {
                    label: folderPage?.title || part.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()),
                    href: folderPage ? `/p/${path}` : undefined,
                };
            });
            breadcrumbItems = [
                { label: 'Accueil', href: '/' },
                ...folderItems,
                { label: page.title, href: `/p/${pageSlug}` },
            ];
        }
    }

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = showBreadcrumb && breadcrumbItems.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: item.href.startsWith('http') ? item.href : `https://www.lesamisducbd.fr${item.href}` } : {}),
        }))
    } : null;

    // Calculate categories and related articles for sidebar from genuine published pages
    let categories = [];
    let relatedArticles = [];
    if (isArticle && allPages) {
        const publishedPages = Object.values(allPages).filter(p => !p.status || p.status === 'published');
        
        // Catégories réelles des pages publiées
        categories = [...new Set(publishedPages.map(p => p.seo?.category).filter(Boolean))].sort();

        // Articles similaires réels (uniquement les vrais articles, jamais les hubs/landing)
        const currentCategory = page.seo?.category;
        const otherArticles = publishedPages.filter(p => 
            ['Article', 'BlogPosting'].includes(p.seo?.pageType) && 
            !p.sections?.some(s => s.type === 'BlogCategoryFilter') &&
            p.slug !== pageSlug
        );

        if (currentCategory) {
            const sameCat = otherArticles.filter(p => p.seo?.category === currentCategory);
            const diffCat = otherArticles.filter(p => p.seo?.category !== currentCategory);
            relatedArticles = [...sameCat, ...diffCat].slice(0, 2);
        } else {
            relatedArticles = otherArticles.slice(0, 2);
        }

        relatedArticles = relatedArticles.map(p => ({
            title: p.title,
            slug: p.slug,
            image: p.seo?.ogImage || p.seo?.featuredImage || '',
            category: p.seo?.category || ''
        }));
    }

    let contentNode;
    
    const headerIndex = finalSections.findIndex(s => s.type === 'Header');
    let headerSection = null;
    let contentSections = [...finalSections];
    
    if (headerIndex !== -1) {
        headerSection = contentSections[headerIndex];
        contentSections.splice(headerIndex, 1);
    }
    
    const footerIndex = contentSections.findIndex(s => s.type === 'Footer');
    let footerSection = null;
    if (footerIndex !== -1) {
        footerSection = contentSections[footerIndex];
        contentSections.splice(footerIndex, 1);
    }

    const breadcrumbNode = breadcrumbItems.length > 0 ? (
        <div 
            className="breadcrumb-wrapper" 
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 50,
                marginBottom: '20px',
            }}
        >
            <div 
                className="breadcrumb-container" 
                style={{
                    width: '100%',
                    maxWidth: 'var(--container-width)',
                    display: 'flex',
                    justifyContent: 'flex-start',
                }}
            >
                <Breadcrumb items={breadcrumbItems} />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .breadcrumb-wrapper { padding: 0 24px; box-sizing: border-box; }
                @media (max-width: 1024px) {
                    .breadcrumb-wrapper { padding: 0 16px; }
                }
            `}} />
        </div>
    ) : null;

    if (isArticle) {
        contentNode = (
            <>
                {headerSection && <PageBuilder sections={[headerSection]} />}
                {breadcrumbNode}
                
                <div style={{ 
                    width: '100%',
                    maxWidth: 'var(--container-width)', 
                    margin: '0 auto 80px', 
                    padding: '0 24px', 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: '48px',
                    boxSizing: 'border-box'
                }} className="article-layout">
                    {/* Contenu principal élargi */}
                    <div className="article-content" style={{ width: '100%', maxWidth: '1000px', flex: 1, minWidth: 0 }}>
                        <PageBuilder sections={contentSections} />
                        {!contentSections.some(s => s.type === 'LatestArticlesBlock' || s.type === 'RelatedArticles') && (
                            <PageBuilder sections={[
                                {
                                    id: 'latest-related',
                                    type: 'LatestArticlesBlock',
                                    props: {
                                        title: 'Nos derniers articles sur le même thème',
                                        category: page.seo?.category || '',
                                        count: 3
                                    }
                                }
                            ]} />
                        )}
                    </div>
                    
                    {/* Sommaire et articles suggérés à droite */}
                    <div style={{ width: '310px', flexShrink: 0, display: 'none', position: 'sticky', top: '120px' }} className="article-sidebar-container">
                        <ArticleSidebar categories={categories} relatedArticles={relatedArticles} />
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @media (min-width: 1024px) {
                        .article-sidebar-container { display: block !important; }
                    }
                    @media (max-width: 768px) {
                        .article-layout {
                            padding: 0 16px !important;
                            margin: 20px auto 40px !important;
                        }
                    }
                    .article-content h2,
                    .article-content h3 {
                        scroll-margin-top: 120px;
                    }
                    .article-content .container {
                        max-width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .article-content [class*="heroSection"] {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                `}} />

                {footerSection && <PageBuilder sections={[footerSection]} />}
            </>
        );
    } else {
        contentNode = (
            <>
                {headerSection && <PageBuilder sections={[headerSection]} />}
                {breadcrumbNode}
                <PageBuilder sections={contentSections} />
                {footerSection && <PageBuilder sections={[footerSection]} />}
            </>
        );
    }

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {breadcrumbJsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            )}
            {contentNode}
        </main>
    );
}
