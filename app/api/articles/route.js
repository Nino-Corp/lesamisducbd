import { NextResponse } from 'next/server';
import { safeKvGet } from '@/lib/kvCache';

export const dynamic = 'force-dynamic';

const ARTICLE_TYPES = ['Article', 'BlogPosting', 'LandingPage'];

// Compute estimated reading time based on content
function estimateReadTime(page) {
    let wordCount = 100;
    if (page.seo?.excerpt) {
        wordCount += page.seo.excerpt.split(/\s+/).length;
    }
    if (Array.isArray(page.sections)) {
        for (const s of page.sections) {
            if (s.props?.content) {
                wordCount += s.props.content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
            }
            if (s.props?.text) {
                wordCount += s.props.text.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
            }
        }
    }
    const mins = Math.max(1, Math.round(wordCount / 200));
    return `${mins} min`;
}

// Format date into French DD/MM/YYYY
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category')?.toLowerCase();
        const tag = searchParams.get('tag')?.toLowerCase();
        const search = searchParams.get('q')?.toLowerCase();
        const isPreview = searchParams.get('preview') === 'true';

        const pages = await safeKvGet('builder_pages', {}) || {};

        let articles = Object.values(pages)
            .filter(p => {
                if (!ARTICLE_TYPES.includes(p.seo?.pageType)) return false;
                if (!isPreview && p.status === 'draft') return false;
                if (!isPreview && p.status === 'scheduled' && p.scheduledAt) {
                    if (new Date(p.scheduledAt) > new Date()) return false;
                }
                return true;
            })
            .map(p => {
                const seo = p.seo || {};
                const image = seo.featuredImage || seo.ogImage || '/images/og-image.jpg';
                const dateRaw = seo.publishedAt || p.updatedAt || p.createdAt;
                const dateFormatted = formatDate(dateRaw);
                const readTime = estimateReadTime(p);
                const tags = Array.isArray(seo.tags) ? seo.tags : (seo.tags ? [seo.tags] : []);

                // Badge determined by category, first tag, or pageType
                let badge = 'ARTICLE';
                if (seo.category) {
                    badge = seo.category.toUpperCase();
                } else if (tags.length > 0) {
                    badge = tags[0].toUpperCase();
                } else if (seo.pageType === 'BlogPosting') {
                    badge = 'BLOG';
                }

                return {
                    id: p.slug,
                    slug: p.slug,
                    title: p.title || 'Sans titre',
                    excerpt: seo.excerpt || seo.metaDescription || '',
                    image,
                    category: seo.category || '',
                    badge,
                    tags,
                    date: dateFormatted,
                    publishedAt: dateRaw,
                    readTime,
                    href: `/p/${p.slug}`
                };
            });

        // Filter by category if requested
        if (category) {
            articles = articles.filter(a => 
                (a.category || '').toLowerCase() === category ||
                (a.category || '').toLowerCase().includes(category) ||
                a.tags.some(t => t.toLowerCase() === category)
            );
        }

        // Filter by tag if requested
        if (tag && tag !== 'all') {
            articles = articles.filter(a =>
                a.tags.some(t => t.toLowerCase() === tag) ||
                (a.category || '').toLowerCase().includes(tag) ||
                (a.badge || '').toLowerCase().includes(tag)
            );
        }

        // Filter by search query if requested
        if (search) {
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(search) ||
                a.excerpt.toLowerCase().includes(search)
            );
        }

        // Sort by newest first
        articles.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

        return NextResponse.json({
            success: true,
            count: articles.length,
            articles
        });
    } catch (error) {
        console.error('Error fetching articles API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
