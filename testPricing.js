import { calculateGroupPrice } from './lib/utils/groupPricing.js';

const mockProduct = {
    id: 1,
    name: "Pack x3",
    priceHT: 195, // approx 234 TTC
    priceTTC: 234,
    specificPrices: [
        {
            id_group: "4",
            price: "185.000000", // approx 222 TTC, this is a forced price (rule.price !== "-1.000000")
            reduction: "0.000000"
        }
    ]
};

const resultPro = calculateGroupPrice(mockProduct, 4);
const resultNormal = calculateGroupPrice(mockProduct, 3);

console.log("Normal Config:", resultNormal);
console.log("PRO Config:", resultPro);
