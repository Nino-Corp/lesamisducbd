import { productService } from '@/lib/services/productService';
import FeaturedProductsClient from './FeaturedProductsClient';

// Helper pour formater les produits (simplifié par rapport à la page d'accueil)
function formatProductForCard(p) {
    return {
        name: p.name,
        slug: p.slug,
        image: p.image,
        quoteTitle: p.reference || '',
        tag: p.onSale ? 'Promo' : '',
        badgeColor: null,
        pillLeft: p.formattedPrice,
        pillRight: '',
        price: p.priceTTC,
        formattedPrice: p.formattedPrice,
        rawProduct: p
    };
}

export default async function FeaturedProducts({ title, subtitle, skus, columns }) {
    try {
        const allProducts = await productService.getProducts();
        
        let productsToDisplay = [];
        if (skus) {
            const skuList = skus.split(',').map(s => s.trim().toLowerCase());
            productsToDisplay = allProducts.filter(p => {
                if (p.reference && skuList.includes(p.reference.toLowerCase())) return true;
                return false;
            });
        } else {
            // Par défaut, afficher 3 ou 4 produits si pas de SKUs
            productsToDisplay = allProducts.slice(0, columns || 4);
        }

        if (productsToDisplay.length === 0) return null;

        const formattedProducts = productsToDisplay.map(formatProductForCard);

        return (
            <FeaturedProductsClient 
                title={title} 
                subtitle={subtitle} 
                columns={columns} 
                products={formattedProducts} 
            />
        );
    } catch (e) {
        console.error("FeaturedProducts Error:", e);
        return null;
    }
}
