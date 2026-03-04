import PageBuilder from '@/components/PageBuilder';
import { kv } from '@vercel/kv';
import homeData from '@/data/home.json';
import { productService } from '@/lib/services/productService';
import { SHARED_TITLE, SHARED_DESCRIPTION } from './shared-metadata';

export const revalidate = 60;

export const metadata = {
  title: SHARED_TITLE.default,
  description: SHARED_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
};

async function getData() {
  try {
    const data = await kv.get('home_content');
    if (data && data.sections && data.sections.length > 0) return data;
  } catch (error) {
    console.error('Error reading from Vercel KV:', error);
  }
  return homeData;
}

/** Maps a vitrine pinned entry + PrestaShop product to a ProductList-compatible card object */
const toCard = (vitrineEntry, product) => ({
  name: product.name,
  slug: product.slug,
  image: product.image,
  quoteTitle: '',
  tag: vitrineEntry.badge || (product.onSale ? 'Promo' : ''),
  badgeColor: vitrineEntry.badgeColor || null,
  pillLeft: product.formattedPrice,
  pillRight: '',
  price: product.priceTTC,
  formattedPrice: product.formattedPrice,
  rawProduct: product // Passed down so ProductList client component can calculate group discounts
});

/** Returns the display quote from a slug (e.g. "super-skunk-4g" → "La Classique") */
const quoteForSlug = (slug) => {
  const s = slug.toLowerCase();
  if (s.includes('gorilla')) return '\u201cLa Puissante\u201d';
  if (s.includes('amnes') || s.includes('amnesia')) return '\u201cLa R\u00eaveuse\u201d';
  if (s.includes('skunk')) return '\u201cLa Classique\u201d';
  return '\u201cLa Relaxante\u201d';
};

/** Returns the display name from a slug (e.g. "super-skunk-4g" → "Super Skunk") */
const baseNameFromSlug = (slug) => {
  const s = slug.toLowerCase();
  if (s.includes('gorilla')) return 'Gorilla Glue';
  if (s.includes('amnes') || s.includes('amnesia')) return 'Amn\u00e9sia';
  if (s.includes('skunk')) return 'Super Skunk';
  if (s.includes('remedy')) return 'Remedy';
  // Generic fallback: strip trailing weight pattern like "-4g" or "-10g"
  return slug.replace(/-\d+g$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/** Finds all weight variations of a flower given any of its slugs */
const resolveFlowerVariations = (baseSlug, allProducts) => {
  // Extract the base part of the slug (without trailing weight e.g. "-4g")
  const base = baseSlug.replace(/-\d+g$/, '');
  return allProducts
    .filter(p => p.slug.startsWith(base))
    .map(p => {
      const m = p.name.match(/(\d+)\s*g/i);
      return { ...p, weight: m ? parseInt(m[1]) : 0 };
    })
    .sort((a, b) => a.weight - b.weight);
};

const buildFlower = (entry, product) => {
  const variations = resolveFlowerVariations(product.slug, [product]); // will be overridden below
  return {
    ...toCard(entry, product),
    name: baseNameFromSlug(product.slug),
    quoteTitle: quoteForSlug(product.slug),
  };
};

export default async function Home() {
  // Fetch CMS content, PrestaShop products and vitrine config in parallel
  const [data, allProducts, vitrineConfig, globalConfig] = await Promise.all([
    getData(),
    productService.getProducts().catch(() => []),
    kv.get('vitrine_config').catch(() => null),
    kv.get('global_content').catch(() => null)
  ]);

  const bySlug = Object.fromEntries(allProducts.map(p => [p.slug, p]));

  // ── Resolve flowers ──────────────────────────────────────────────
  // If admin has configured vitrine flowers (even empty = remove all), use that.
  // Only fall back to hardcoded list when vitrine has never been configured (null/undefined).
  let flowers = [];

  if (vitrineConfig && Array.isArray(vitrineConfig.flowers)) {
    // Admin-controlled: respects removals, badges, ordering
    flowers = vitrineConfig.flowers
      .map(entry => {
        const product = bySlug[entry.slug];
        if (!product) return null;

        // Use the display name to find all weight variations of this flower.
        // Slugs are "{id}-{link_rewrite}" so we can't match by slug prefix.
        // Instead, strip the weight part from the product name (e.g. "Super Skunk 4 G" → "Super Skunk")
        // and use that to find sibling products.
        const nameWithoutWeight = product.name.replace(/\s*\d+\s*g\s*$/i, '').trim();
        const variations = allProducts
          .filter(p => p.name.toLowerCase().startsWith(nameWithoutWeight.toLowerCase()))
          .map(p => { const m = p.name.match(/(\d+)\s*g/i); return { ...p, weight: m ? parseInt(m[1]) : 0 }; })
          .sort((a, b) => a.weight - b.weight);

        const main = variations.find(v => v.weight === 4) || product;

        return {
          ...toCard(entry, main),
          name: baseNameFromSlug(product.slug),
          quoteTitle: quoteForSlug(product.slug),
          variations: variations.map(v => ({
            slug: v.slug,
            weight: v.weight,
            priceTTC: v.priceTTC,
            formattedPrice: v.formattedPrice,
            rawProduct: v
          }))
        };
      })
      .filter(Boolean);
  } else {
    // Fallback: hardcoded default when vitrine has never been saved by admin
    const FEATURED_SLUGS = [
      { baseName: 'Super Skunk', baseSlug: 'super-skunk' },
      { baseName: 'Amn\u00e9sia', baseSlug: 'amnesia' },
      { baseName: 'Gorilla Glue', baseSlug: 'gorilla-glue' },
      { baseName: 'Remedy', baseSlug: 'remedy' },
    ];

    flowers = FEATURED_SLUGS.map(({ baseName, baseSlug }) => {
      const variations = allProducts
        .filter(p => p.slug.startsWith(baseSlug))
        .map(p => { const m = p.name.match(/(\d+)\s*g/i); return { ...p, weight: m ? parseInt(m[1]) : 0 }; })
        .sort((a, b) => a.weight - b.weight);

      if (variations.length === 0) return null;
      const main = variations.find(v => v.weight === 4) || variations[0];

      return {
        ...toCard({}, main),
        name: baseName,
        quoteTitle: quoteForSlug(baseSlug),
        variations: variations.map(v => ({
          slug: v.slug,
          weight: v.weight,
          priceTTC: v.priceTTC,
          formattedPrice: v.formattedPrice,
          rawProduct: v
        }))
      };
    }).filter(Boolean);
  }

  // ── Resolve resins ───────────────────────────────────────────────
  let resins = [];

  if (vitrineConfig?.resins?.length > 0) {
    // Use admin-configured vitrine (KV)
    resins = vitrineConfig.resins
      .map(entry => bySlug[entry.slug] ? toCard(entry, bySlug[entry.slug]) : null)
      .filter(Boolean)
      .slice(0, 4);
  } else {
    // Fallback: first resins found in catalogue
    const RESIN_KEYWORDS = ['hash', 'pollen', 'resin', 'r\u00e9sine', 'harsh', 'golden'];
    resins = allProducts
      .filter(p => RESIN_KEYWORDS.some(k => p.name.toLowerCase().includes(k)))
      .slice(0, 4)
      .map(p => toCard({}, p));
  }

  // ── Inject into sections ─────────────────────────────────────────
  const vitrineFlowersConfigured = vitrineConfig && Array.isArray(vitrineConfig.flowers);

  const sections = data.sections.map(section => {
    if (section.id === 'featured-products') {
      if (vitrineFlowersConfigured) {
        // Admin configured vitrine: use their list (empty = return null = hide section)
        if (flowers.length === 0) return null;
        return { ...section, props: { ...section.props, products: flowers } };
      }
      // No vitrine config yet: inject dynamic fallback flowers over JSON defaults
      if (flowers.length > 0) {
        return { ...section, props: { ...section.props, products: flowers } };
      }
      return section;
    }

    // Inject global content into Header and Footer
    if (section.type === 'Footer' && globalConfig) {
      return {
        ...section,
        props: {
          ...section.props,
          columnLinks: globalConfig.footerLinks || section.props.columnLinks,
          contactInfo: globalConfig.contact || section.props.contactInfo
        }
      };
    }

    // If you plan to apply global content to Header later (like phone number)
    if (section.type === 'Header' && globalConfig) {
      return { ...section };
    }

    return section;
  }).filter(Boolean); // filter out null = hidden sections

  // Insert resins section between WhyChooseUs and FAQ
  if (resins.length > 0) {
    const whyIdx = sections.findIndex(s => s.type === 'WhyChooseUs');
    if (whyIdx !== -1) {
      sections.splice(whyIdx + 1, 0, {
        id: 'resins-section',
        type: 'ProductList',
        props: {
          title: 'Nos r\u00e9sines phares, pour chaque moment.',
          description: 'Des r\u00e9sines de CBD soigneusement s\u00e9lectionn\u00e9es pour leur qualit\u00e9 et leur authenticit\u00e9.<br />Black Harsh, Golden Pollen\u2026 chaque r\u00e9sine est un voyage pour les amateurs d\'exp\u00e9riences naturelles et pures.',
          linkLabel: 'Voir toutes les r\u00e9sines',
          linkHref: '/produits',
          products: resins,
        }
      });
    }
  }

  return (
    <main>
      <PageBuilder sections={sections} />
    </main>
  );
}
