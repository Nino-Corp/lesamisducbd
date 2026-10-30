import { normalizePageSlug } from '@/lib/utils/stringUtils';
import { recordPageRedirect } from '@/lib/pageRedirects';
import { NextResponse } from 'next/server';
import { safeKvGet, safeKvSet } from '@/lib/kvCache';
import { getSession } from '@/lib/auth';
import { recordAdminAction, getClientIp } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

const PAGES_KEY = 'builder_pages';
const BLOCKS_KEY = 'builder_saved_blocks';
const MAX_HISTORY = 10; // Keep last 10 versions per page

// GET: Retrieve all pages or a specific page
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const action = searchParams.get('action');

        // Return saved blocks
        if (action === 'blocks') {
            const blocks = await safeKvGet(BLOCKS_KEY, []);
            return NextResponse.json(blocks);
        }

        const pages = await safeKvGet(PAGES_KEY, {});

        if (slug) {
            if (!pages[slug]) {
                return NextResponse.json({ error: 'Page not found' }, { status: 404 });
            }

            // Return history only
            if (action === 'history') {
                const history = await safeKvGet(`builder_history:${slug}`, pages[slug].history || []);
                return NextResponse.json(history);
            }

            const { history: _h, ...pageData } = pages[slug];
            return NextResponse.json(pageData);
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
        console.error('Builder API GET error (quota limit or error):', error.message);
        return NextResponse.json({});
    }
}

// POST: Create or update a page
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, sections, seo, status, scheduledAt } = body;
        // Slugs hiérarchiques autorisés (dossiers séparés par "/")
        const slug = normalizePageSlug(body.slug, { final: true });
        // Support for slug rename: body may contain originalSlug
        const originalSlug = body.originalSlug || slug;
        // Duplication action
        const action = body.action;

        // ── SAVE BLOCK ACTION ──
        if (action === 'save_block') {
            const { block } = body;
            if (!block) return NextResponse.json({ error: 'Block data is required' }, { status: 400 });
            const blocks = await safeKvGet(BLOCKS_KEY, []);
            // prepend new block
            blocks.unshift(block);
            await safeKvSet(BLOCKS_KEY, blocks);
            return NextResponse.json({ success: true, blocks });
        }

        // ── MOVE ACTION : déplacer une page vers un autre dossier (slug) en un clic ──
        if (action === 'move') {
            const from = normalizePageSlug(body.slug, { final: true });
            const to = normalizePageSlug(body.newSlug, { final: true });
            if (!from || !to) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });
            if (from === to) return NextResponse.json({ success: true, slug: to });
            const allPages = await safeKvGet(PAGES_KEY, {});
            if (!allPages[from]) return NextResponse.json({ error: 'Page introuvable' }, { status: 404 });
            if (allPages[to]) return NextResponse.json({ error: 'Une page existe déjà à cette adresse' }, { status: 409 });

            allPages[to] = { ...allPages[from], slug: to, updatedAt: new Date().toISOString() };
            delete allPages[from];
            await safeKvSet(PAGES_KEY, allPages);

            try {
                const history = await safeKvGet(`builder_history:${from}`, null);
                if (history) await safeKvSet(`builder_history:${to}`, history);
            } catch (e) { /* non-blocking */ }
            try {
                const globalContent = await safeKvGet('global_content', {});
                if (globalContent && globalContent.footerLinks) {
                    globalContent.footerLinks = globalContent.footerLinks.map(link =>
                        link.href === `/p/${from}` ? { ...link, href: `/p/${to}` } : link
                    );
                    await safeKvSet('global_content', globalContent);
                }
            } catch (e) { /* non-blocking */ }
            await recordPageRedirect(from, to);

            getSession().then(session => {
                recordAdminAction({
                    username: session?.username || 'admin',
                    action: 'Déplacement Page Builder',
                    target: to,
                    details: `/p/${from} → /p/${to}`,
                    ip: getClientIp(request)
                }).catch(() => {});
            }).catch(() => {});

            return NextResponse.json({ success: true, slug: to });
        }

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and Title are required' }, { status: 400 });
        }

        const pages = await safeKvGet(PAGES_KEY, {});

        // ── DUPLICATE ACTION ──
        if (action === 'duplicate') {
            const source = pages[originalSlug];
            if (!source) {
                return NextResponse.json({ error: 'Source page not found' }, { status: 404 });
            }

            const { history: _h, ...sourceData } = source;
            pages[slug] = {
                ...sourceData,
                slug,
                title,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await safeKvSet(PAGES_KEY, pages);
            return NextResponse.json({ success: true, page: pages[slug] });
        }

        // ── Prevent creating a page with an existing slug (only for NEW pages) ──
        if (body.isNew && pages[slug]) {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
        }

        // ── Handle slug rename: delete old key ──
        if (originalSlug !== slug && pages[originalSlug]) {
            delete pages[originalSlug];
            recordPageRedirect(originalSlug, slug).catch(() => {});
            try {
                const globalContent = await safeKvGet('global_content', {});
                if (globalContent && globalContent.footerLinks) {
                    globalContent.footerLinks = globalContent.footerLinks.map(link =>
                        link.href === `/p/${originalSlug}` ? { ...link, href: `/p/${slug}` } : link
                    );
                    await safeKvSet('global_content', globalContent);
                }
            } catch (e) { /* non-blocking */ }
        }

        // ── Snapshot for history (saved in dedicated builder_history:<slug> key) ──
        const existing = pages[slug] || {};
        const isManualSave = body.isManualSave === true;

        if (existing.sections && existing.sections.length > 0) {
            try {
                const historyKey = `builder_history:${slug}`;
                const history = await safeKvGet(historyKey, existing.history || []);
                const lastSnapshot = history[0];
                const lastSavedTime = lastSnapshot ? new Date(lastSnapshot.savedAt).getTime() : 0;
                const fiveMinutesPassed = Date.now() - lastSavedTime > 5 * 60 * 1000;

                // Take snapshot only on explicit manual save or if at least 5 minutes elapsed since last snapshot
                if (isManualSave || fiveMinutesPassed) {
                    history.unshift({
                        savedAt: new Date().toISOString(),
                        title: existing.title,
                        sections: existing.sections,
                        seo: existing.seo,
                        status: existing.status,
                    });
                    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
                    await safeKvSet(historyKey, history);
                }
            } catch (hErr) {
                console.warn('Non-blocking history snapshot error:', hErr);
            }
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
            createdAt: existing.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // Ensure no history array remains inside the main pages dictionary
        delete pages[slug].history;

        await safeKvSet(PAGES_KEY, pages);

        // ── Update global footer links (only for published pages) ──
        try {
            const globalContent = await safeKvGet('global_content', {});
            const footerLinks = globalContent?.footerLinks || [];
            const pageHref = `/p/${slug}`;

            if (resolvedStatus === 'published') {
                const linkExists = footerLinks.some(link => link.href === pageHref);
                if (!linkExists) {
                    footerLinks.push({ label: title, href: pageHref });
                    globalContent.footerLinks = footerLinks;
                    await safeKvSet('global_content', globalContent);
                }
            } else {
                // Remove from footer if unpublished
                const filtered = footerLinks.filter(link => link.href !== pageHref);
                if (filtered.length !== footerLinks.length) {
                    globalContent.footerLinks = filtered;
                    await safeKvSet('global_content', globalContent);
                }
            }
        } catch (footerError) {
            console.error('Error updating global footer links:', footerError);
        }

        // Return without history to keep response small
        const { history: _h, ...pageWithoutHistory } = pages[slug];
        getSession().then(session => {
            recordAdminAction({
                username: session?.username || 'admin',
                action: resolvedStatus === 'published' ? 'Publication Page Builder' : 'Mise à jour Page Builder',
                target: slug,
                details: `Page: "${title}" (${resolvedStatus})`,
                ip: getClientIp(request)
            }).catch(() => {});
        }).catch(() => {});

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
        const action = searchParams.get('action');
        const blockId = searchParams.get('blockId');

        // ── DELETE SAVED BLOCK ──
        if (action === 'delete_block' && blockId) {
            let blocks = await safeKvGet(BLOCKS_KEY, []);
            blocks = blocks.filter(b => b.id !== blockId);
            await safeKvSet(BLOCKS_KEY, blocks);
            return NextResponse.json({ success: true });
        }

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const pages = await safeKvGet(PAGES_KEY, {});

        if (!pages[slug]) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        delete pages[slug];
        await safeKvSet(PAGES_KEY, pages);

        // Remove from global footer links and header links
        try {
            const globalContent = await safeKvGet('global_content', null);
            if (globalContent) {
                let modified = false;
                const pageHref = `/p/${slug}`;

                if (globalContent.footerLinks) {
                    const originalLength = globalContent.footerLinks.length;
                    globalContent.footerLinks = globalContent.footerLinks.filter(link => link.href !== pageHref);
                    if (globalContent.footerLinks.length !== originalLength) modified = true;
                }

                if (globalContent.headerLinks) {
                    let newHeaderLinks = [...globalContent.headerLinks];
                    for (let i = 0; i < newHeaderLinks.length; i++) {
                        let link = newHeaderLinks[i];
                        if (link.href === pageHref) {
                            newHeaderLinks.splice(i, 1);
                            i--;
                            modified = true;
                        } else if (link.children && Array.isArray(link.children)) {
                            const originalChildrenLength = link.children.length;
                            link.children = link.children.filter(child => child.href !== pageHref);
                            if (link.children.length !== originalChildrenLength) modified = true;
                        }
                    }
                    if (modified) globalContent.headerLinks = newHeaderLinks;
                }

                if (modified) {
                    await safeKvSet('global_content', globalContent);
                }
            }
        } catch (cleanupError) {
            console.error('Error removing global links on page deletion:', cleanupError);
        }

        getSession().then(session => {
            recordAdminAction({
                username: session?.username || 'admin',
                action: 'Suppression Page Builder',
                target: slug,
                details: 'Page supprimée du Builder',
                ip: getClientIp(request)
            }).catch(() => {});
        }).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Builder API DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
