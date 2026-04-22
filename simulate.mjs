import 'dotenv/config';
import { prestaCheckoutService } from './lib/services/prestaCheckoutService.js';

async function simulateOrder() {
    console.log('--- Lancement de la simulation de commande ---');
    try {
        const email = 'test4@test.com';
        
        // 1. Get Customer
        console.log(`Recherche du client ${email}...`);
        const customer = await prestaCheckoutService.getCustomerByEmail(email);
        if (!customer) {
            console.error('Client non trouvé sur PrestaShop.');
            return;
        }
        console.log(`Client trouvé ! ID: ${customer.id}`);

        // 2. Fetch Addresses for this customer to reuse one
        const url = process.env.PRESTASHOP_API_URL;
        const key = process.env.PRESTASHOP_API_KEY;
        const addrRes = await fetch(`${url}/addresses?ws_key=${key}&output_format=JSON&filter[id_customer]=${customer.id}`);
        const addrData = await addrRes.json();
        
        let addressId = 0;
        if (addrData && addrData.addresses && addrData.addresses.length > 0) {
            addressId = addrData.addresses[0].id;
            console.log(`Adresse trouvée. ID: ${addressId}`);
        } else {
            console.log('Création d\'une adresse factice...');
            addressId = await prestaCheckoutService.createAddress(customer.id, {
                lastname: customer.lastname || 'Test',
                firstname: customer.firstname || 'User',
                address1: '123 Fake Street',
                postcode: '75001',
                city: 'Paris'
            });
            console.log(`Nouvelle adresse générée. ID: ${addressId}`);
        }

        // 3. Create Cart
        console.log('Création du panier PrestaShop...');
        const cartItems = [
            { id: 22, variant: { id: 0 }, quantity: 2 }, // Using dummy product IDs that likely exist
            { id: 24, variant: { id: 0 }, quantity: 1 }
        ];
        const cartId = await prestaCheckoutService.createCart(customer.id, addressId, cartItems);
        console.log(`Panier créé avec ID: ${cartId}`);

        // 4. Create Order
        console.log('Validation de la commande en "Paiement accepté"...');
        const orderRes = await prestaCheckoutService.createOrder({
            cartId: cartId,
            customerId: customer.id,
            addressId: addressId,
            totalPaid: 69.90
        });

        console.log(`✅ Commande simulée avec succès !`);
        console.log(`   ID Commande : ${orderRes.orderId}`);
        console.log(`   Référence   : ${orderRes.reference}`);

    } catch (err) {
        console.error('Erreur lors de la simulation:', err);
    }
}

simulateOrder();
