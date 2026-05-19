import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const PAGES_KEY = 'builder_pages';
const MAX_HISTORY = 10; // Keep last 10 versions per page

// GET: Retrieve all pages or a specific page
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const action = searchParams.get('action');

        const pages = await kv.get(PAGES_KEY) || {};

        if (slug) {
            if (!pages[slug]) {
                return NextResponse.json({ error: 'Page not found' }, { status: 404 });
            }

            // Return history only
            if (action === 'history') {
                return NextResponse.json(pages[slug].history || []);
            }

            return NextResponse.json(pages[slug]);
        }

        // Strip history from listing to keep payload small
        const stripped = Object.fromEntries(
            Object.entries(pages).map(([k, v]) => {
                const { history, ...rest } = v;
                return [k, rest];
            })
        );

        return NextResponse.json(stripped);
    } catch (error) {
        console.error('Builder API GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create or update a page
export async function POST(request) {
    try {
        const body = await request.json();
        const { slug, title, sections, seo, status, scheduledAt } = body;
        // Support for slug rename: body may contain originalSlug
        const originalSlug = body.originalSlug || slug;
        // Duplication action
        const action = body.action;

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and Title are required' }, { status: 400 });
        }

        const pages = await kv.get(PAGES_KEY) || {};

        // ── DUPLICATE ACTION ──
        if (action === 'duplicate') {
            const source = pages[originalSlug];
            if (!source) {
                return NextResponse.json({ error: 'Source page not found' }, { status: 404 });
            }

            const { history, ...sourceData } = source;
            pages[slug] = {
                ...sourceData,
                slug,
                title,
                status: 'draft',
                history: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await kv.set(PAGES_KEY, pages);
            return NextResponse.json({ success: true, page: pages[slug] });
        }

        // ── Handle slug rename: delete old key ──
        if (originalSlug !== slug && pages[originalSlug]) {
            const oldHistory = pages[originalSlug].history || [];
            delete pages[originalSlug];
            try {
                const globalContent = await kv.get('global_content') || {};
                if (globalContent.footerLinks) {
                    globalContent.footerLinks = globalContent.footerLinks.map(link =>
                        link.href === `/p/${originalSlug}` ? { ...link, href: `/p/${slug}` } : link
                    );
                    await kv.set('global_content', globalContent);
                }
            } catch (e) { /* non-blocking */ }
        }

        // ── Snapshot for history (keep last MAX_HISTORY) ──
        const existing = pages[slug] || {};
        const history = existing.history || [];

        if (existing.sections) {
            // Push the current state as a history snapshot
            history.unshift({
                savedAt: existing.updatedAt || new Date().toISOString(),
                title: existing.title,
                sections: existing.sections,
                seo: existing.seo,
                status: existing.status,
            });
            if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
        }

        // ── Resolve status ──
        // If scheduledAt is set and in the future → 'scheduled'
        // Otherwise keep whatever was sent
        let resolvedStatus = status || existing.status || 'draft';
        const now = new Date();
        if (resolvedStatus === 'scheduled' && scheduledAt && new Date(scheduledAt) <= now) {
            resolvedStatus = 'published'; // Auto-publish if scheduled time has passed
        }

        pages[slug] = {
            ...existing,
            slug,
            title,
            sections: sections || [],
            seo: seo || {},
            status: resolvedStatus,
            scheduledAt: scheduledAt || existing.scheduledAt || null,
            history,
            createdAt: existing.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await kv.set(PAGES_KEY, pages);

        // ── Update global footer links (only for published pages) ──
        try {
            const globalContent = await kv.get('global_content') || {};
            const footerLinks = globalContent.footerLinks || [];
            const pageHref = `/p/${slug}`;

            if (resolvedStatus === 'published') {
                const linkExists = footerLinks.some(link => link.href === pageHref);
                if (!linkExists) {
                    footerLinks.push({ label: title, href: pageHref });
                    globalContent.footerLinks = footerLinks;
                    await kv.set('global_content', globalContent);
                }
            } else {
                // Remove from footer if unpublished
                const filtered = footerLinks.filter(link => link.href !== pageHref);
                if (filtered.length !== footerLinks.length) {
                    globalContent.footerLinks = filtered;
                    await kv.set('global_content', globalContent);
                }
            }
        } catch (footerError) {
            console.error('Error updating global footer links:', footerError);
        }

        // Return without history to keep response small
        const { history: _h, ...pageWithoutHistory } = pages[slug];
        return NextResponse.json({ success: true, page: pageWithoutHistory });
    } catch (error) {
        console.error('Builder API POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a page
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const pages = await kv.get(PAGES_KEY) || {};

        if (!pages[slug]) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        delete pages[slug];
        await kv.set(PAGES_KEY, pages);

        // Remove from global footer links
        try {
            const globalContent = await kv.get('global_content');
            if (globalContent?.footerLinks) {
                const pageHref = `/p/${slug}`;
                globalContent.footerLinks = globalContent.footerLinks.filter(link => link.href !== pageHref);
                await kv.set('global_content', globalContent);
            }
        } catch (footerError) {
            console.error('Error removing global footer link:', footerError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Builder API DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
