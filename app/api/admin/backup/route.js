import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { safeKvGet, safeKvSet, invalidateKvCache } from '@/lib/kvCache';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const CONTENT_KEYS = [
    { id: 'home', key: 'home_content', label: 'Accueil' },
    { id: 'essentiel', key: 'essentiel_content', label: "L'Essentiel" },
    { id: 'professionnel', key: 'professionnel_content', label: 'Professionnel' },
    { id: 'usages', key: 'usages_content', label: 'CBD & Usages' },
    { id: 'transparence', key: 'transparence_content', label: 'Transparence' },
    { id: 'recrutement', key: 'recrutement_content', label: 'Recrutement' },
    { id: 'global', key: 'global_content', label: 'Éléments Globaux' },
    { id: 'cgv', key: 'cgv_content', label: 'CGV' },
    { id: 'livraison', key: 'livraison_content', label: 'Livraison' },
    { id: 'privacy', key: 'privacy_content', label: 'Confidentialité' },
];

/**
 * Collect all data from KV / mirrors
 */
async function collectBackupData(username) {
    // 1. Page Builder
    const [builderPages, builderSavedBlocks] = await Promise.all([
        safeKvGet('builder_pages', {}),
        safeKvGet('builder_saved_blocks', [])
    ]);

    // 2. Vitrine & Products
    const [
        vitrineConfig,
        hiddenProducts,
        productOrder,
        productCategories,
        productOverrides,
        categoryOverrides,
        productsPageConfig
    ] = await Promise.all([
        safeKvGet('vitrine_config', {}),
        kv.get('hidden_products').catch(() => []),
        kv.get('product_order').catch(() => []),
        safeKvGet('product_categories', null),
        safeKvGet('product_overrides', {}),
        safeKvGet('category_overrides', {}),
        safeKvGet('products_page_config', {})
    ]);

    // 3. Loyalty
    const loyaltySettings = await safeKvGet('loyalty_settings_v1', null);

    // 4. Content CMS Pages
    const contentEntries = await Promise.all(
        CONTENT_KEYS.map(async ({ id, key, label }) => {
            const val = await safeKvGet(key, null);
            return [id, val];
        })
    );
    const contentData = Object.fromEntries(contentEntries);

    // 5. Partners
    const partners = await safeKvGet('partners_locations', []);

    // Summary counts
    const builderPagesCount = builderPages && typeof builderPages === 'object' ? Object.keys(builderPages).length : 0;
    const contentCount = Object.values(contentData).filter(Boolean).length;
    const partnersCount = Array.isArray(partners) ? partners.length : 0;

    const timestamp = new Date().toISOString();

    return {
        meta: {
            app: 'Les Amis du CBD',
            version: '1.0',
            generatedAt: timestamp,
            generatedBy: username || 'admin',
            summary: {
                builderPagesCount,
                builderBlocksCount: Array.isArray(builderSavedBlocks) ? builderSavedBlocks.length : 0,
                contentPagesCount: contentCount,
                partnersCount,
                hasVitrineConfig: Boolean(vitrineConfig && (vitrineConfig.flowers?.length || vitrineConfig.resins?.length)),
                hasLoyaltySettings: Boolean(loyaltySettings)
            }
        },
        data: {
            builder: {
                pages: builderPages || {},
                savedBlocks: builderSavedBlocks || []
            },
            vitrine: {
                config: vitrineConfig || {},
                hiddenProducts: Array.isArray(hiddenProducts) ? hiddenProducts : [],
                productOrder: Array.isArray(productOrder) ? productOrder : [],
                productCategories: productCategories || null,
                productOverrides: productOverrides || {},
                categoryOverrides: categoryOverrides || {},
                productsPageConfig: productsPageConfig || {}
            },
            loyalty: {
                settings: loyaltySettings || null
            },
            content: contentData,
            partners: Array.isArray(partners) ? partners : []
        }
    };
}

// GET: Export backup or return metadata preview
export async function GET(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Accès réservé aux super-administrateurs' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const isPreview = searchParams.get('preview') === 'true';
        const isDownload = searchParams.get('download') === 'true';

        const backup = await collectBackupData(session.username);

        // Preview mode: return summary and stats only to keep response lightweight
        if (isPreview) {
            return NextResponse.json({
                success: true,
                meta: backup.meta
            });
        }

        // Direct file download mode
        if (isDownload) {
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
            const filename = `backup-lesamisducbd-${dateStr}.json`;
            const jsonString = JSON.stringify(backup, null, 2);

            return new NextResponse(jsonString, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            });
        }

        return NextResponse.json(backup);
    } catch (error) {
        console.error('[Backup API] GET error:', error);
        return NextResponse.json({ error: 'Erreur lors de la génération de la sauvegarde' }, { status: 500 });
    }
}

// POST: Restore from backup
export async function POST(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Accès réservé aux super-administrateurs' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { backupData, modules } = body;

        if (!backupData || !backupData.data) {
            return NextResponse.json({ error: 'Format de sauvegarde invalide (structure data manquante)' }, { status: 400 });
        }

        const selected = modules || {
            builder: true,
            vitrine: true,
            loyalty: true,
            content: true,
            partners: true
        };

        const restoredDetails = [];
        const { data } = backupData;

        // 1. Restore Builder
        if (selected.builder && data.builder) {
            if (data.builder.pages && typeof data.builder.pages === 'object') {
                await safeKvSet('builder_pages', data.builder.pages);
                const count = Object.keys(data.builder.pages).length;
                restoredDetails.push(`${count} page(s) du constructeur`);
            }
            if (Array.isArray(data.builder.savedBlocks)) {
                await safeKvSet('builder_saved_blocks', data.builder.savedBlocks);
            }
        }

        // 2. Restore Vitrine & Products
        if (selected.vitrine && data.vitrine) {
            const v = data.vitrine;
            if (v.config) await safeKvSet('vitrine_config', v.config);
            if (Array.isArray(v.hiddenProducts)) await kv.set('hidden_products', v.hiddenProducts).catch(() => {});
            if (Array.isArray(v.productOrder)) await kv.set('product_order', v.productOrder).catch(() => {});
            if (v.productCategories) await safeKvSet('product_categories', v.productCategories);
            if (v.productOverrides) await safeKvSet('product_overrides', v.productOverrides);
            if (v.categoryOverrides) await safeKvSet('category_overrides', v.categoryOverrides);
            if (v.productsPageConfig) await safeKvSet('products_page_config', v.productsPageConfig);
            restoredDetails.push('Réglages vitrine & catalogue produits');
        }

        // 3. Restore Loyalty
        if (selected.loyalty && data.loyalty?.settings) {
            await safeKvSet('loyalty_settings_v1', data.loyalty.settings);
            restoredDetails.push('Paramètres du programme fidélité VIP');
        }

        // 4. Restore Content CMS Pages
        if (selected.content && data.content && typeof data.content === 'object') {
            let restoredPagesCount = 0;
            for (const { id, key } of CONTENT_KEYS) {
                if (data.content[id] !== undefined && data.content[id] !== null) {
                    await safeKvSet(key, data.content[id]);
                    restoredPagesCount++;
                }
            }
            if (restoredPagesCount > 0) {
                restoredDetails.push(`${restoredPagesCount} page(s) de contenu CMS`);
            }
        }

        // 5. Restore Partners
        if (selected.partners && Array.isArray(data.partners)) {
            await safeKvSet('partners_locations', data.partners);
            restoredDetails.push(`${data.partners.length} point(s) de vente / buraliste(s)`);
        }

        // Invalidate in-memory cache so updates are immediate
        invalidateKvCache();

        return NextResponse.json({
            success: true,
            message: 'Restauration appliquée avec succès !',
            restoredAt: new Date().toISOString(),
            restoredBy: session.username,
            details: restoredDetails
        });
    } catch (error) {
        console.error('[Backup API] POST error:', error);
        return NextResponse.json({ error: 'Erreur lors de la restauration: ' + error.message }, { status: 500 });
    }
}
