export default function ProductSchema({ product, productUrl }) {
    if (!product) return null;

    const schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.description?.replace(/<[^>]*>?/gm, '').trim() || `Découvrez ${product.name}`,
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'EUR',
            price: product.price_ttc || product.price,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
