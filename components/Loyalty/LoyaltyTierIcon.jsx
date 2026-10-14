import React from 'react';
import {
    Sprout, Leaf, Flower, Flower2, TreeDeciduous, TreePine, Trees, Wheat, Droplets, Sun, FlameKindling, Flame, Feather, Apple, Grape, Coffee,
    Crown, Award, Trophy, Medal, Gem, Diamond, Star, Sparkles, Sparkle, Ribbon, BadgeCheck, ShieldCheck, Shield,
    Zap, Coins, Gift, BadgePercent, Percent, Infinity, Rocket, Target, TrendingUp, Key, Milestone, PackageCheck,
    Heart, HeartHandshake, Smile, SmilePlus, CheckCircle2, Layers, Compass, Flag, Hexagon, CircleDot, ShoppingBag, Store, Users, Anchor, Globe
} from 'lucide-react';

export const LOYALTY_ICON_MAP = {
    // Végétal & Nature
    Sprout, Leaf, Flower, Flower2, TreeDeciduous, TreePine, Trees, Wheat, Droplets, Sun, FlameKindling, Flame, Feather, Apple, Grape, Coffee,
    // VIP, Prestige & Trophées
    Crown, Award, Trophy, Medal, Gem, Diamond, Star, Sparkles, Sparkle, Ribbon, BadgeCheck, ShieldCheck, Shield,
    // Récompenses & Fidélité
    Zap, Coins, Gift, BadgePercent, Percent, Infinity, Rocket, Target, TrendingUp, Key, Milestone, PackageCheck,
    // Formes & Communauté
    Heart, HeartHandshake, Smile, SmilePlus, CheckCircle2, Layers, Compass, Flag, Hexagon, CircleDot, ShoppingBag, Store, Users, Anchor, Globe
};

export const LOYALTY_LUCIDE_ICONS = {
    // Végétal & Nature
    Sprout: { label: 'Pousse (Sprout)', category: 'nature' },
    Leaf: { label: 'Feuille (Leaf)', category: 'nature' },
    Flower: { label: 'Fleur (Flower)', category: 'nature' },
    Flower2: { label: 'Fleur 2 (Flower2)', category: 'nature' },
    TreeDeciduous: { label: 'Arbre feuillu (Tree)', category: 'nature' },
    TreePine: { label: 'Arbre pin (Pine)', category: 'nature' },
    Trees: { label: 'Forêt (Trees)', category: 'nature' },
    Wheat: { label: 'Céréale / Blé (Wheat)', category: 'nature' },
    Droplets: { label: 'Gouttes (Droplets)', category: 'nature' },
    Sun: { label: 'Soleil (Sun)', category: 'nature' },
    FlameKindling: { label: 'Feu de bois (FlameKindling)', category: 'nature' },
    Flame: { label: 'Flamme (Flame)', category: 'nature' },
    Feather: { label: 'Plume (Feather)', category: 'nature' },
    Apple: { label: 'Pomme (Apple)', category: 'nature' },
    Grape: { label: 'Raisin (Grape)', category: 'nature' },
    Coffee: { label: 'Café (Coffee)', category: 'nature' },
    
    // VIP & Prestige
    Crown: { label: 'Couronne (Crown)', category: 'vip' },
    Award: { label: 'Récompense (Award)', category: 'vip' },
    Trophy: { label: 'Trophée (Trophy)', category: 'vip' },
    Medal: { label: 'Médaille (Medal)', category: 'vip' },
    Gem: { label: 'Pierre précieuse (Gem)', category: 'vip' },
    Diamond: { label: 'Diamant (Diamond)', category: 'vip' },
    Star: { label: 'Étoile (Star)', category: 'vip' },
    Sparkles: { label: 'Étincelles (Sparkles)', category: 'vip' },
    Sparkle: { label: 'Éclat (Sparkle)', category: 'vip' },
    Ribbon: { label: 'Ruban (Ribbon)', category: 'vip' },
    BadgeCheck: { label: 'Badge Certifié (BadgeCheck)', category: 'vip' },
    ShieldCheck: { label: 'Bouclier Validé (ShieldCheck)', category: 'vip' },
    Shield: { label: 'Bouclier (Shield)', category: 'vip' },

    // Récompenses & Fidélité
    Zap: { label: 'Éclair (Zap)', category: 'rewards' },
    Coins: { label: 'Pièces (Coins)', category: 'rewards' },
    Gift: { label: 'Cadeau (Gift)', category: 'rewards' },
    BadgePercent: { label: 'Badge % (BadgePercent)', category: 'rewards' },
    Percent: { label: 'Pourcentage (Percent)', category: 'rewards' },
    Infinity: { label: 'Infini (Infinity)', category: 'rewards' },
    Rocket: { label: 'Fusée (Rocket)', category: 'rewards' },
    Target: { label: 'Cible (Target)', category: 'rewards' },
    TrendingUp: { label: 'Progression (TrendingUp)', category: 'rewards' },
    Key: { label: 'Clé VIP (Key)', category: 'rewards' },
    Milestone: { label: 'Étape (Milestone)', category: 'rewards' },
    PackageCheck: { label: 'Colis Validé (PackageCheck)', category: 'rewards' },

    // Formes & Symboles
    Heart: { label: 'Cœur (Heart)', category: 'community' },
    HeartHandshake: { label: 'Partenariat (HeartHandshake)', category: 'community' },
    Smile: { label: 'Sourire (Smile)', category: 'community' },
    SmilePlus: { label: 'Sourire Plus (SmilePlus)', category: 'community' },
    CheckCircle2: { label: 'Validé (CheckCircle2)', category: 'community' },
    Layers: { label: 'Paliers (Layers)', category: 'community' },
    Compass: { label: 'Boussole (Compass)', category: 'community' },
    Flag: { label: 'Drapeau (Flag)', category: 'community' },
    Hexagon: { label: 'Hexagone (Hexagon)', category: 'community' },
    CircleDot: { label: 'Cercle (CircleDot)', category: 'community' },
    ShoppingBag: { label: 'Sac Shopping (ShoppingBag)', category: 'community' },
    Store: { label: 'Boutique (Store)', category: 'community' },
    Users: { label: 'Membres (Users)', category: 'community' },
    Anchor: { label: 'Ancre (Anchor)', category: 'community' },
    Globe: { label: 'Globe (Globe)', category: 'community' }
};

export const LOYALTY_ICON_CATEGORIES = [
    { id: 'all', label: 'Toutes les icônes' },
    { id: 'nature', label: '🌿 Végétal & Nature' },
    { id: 'vip', label: '👑 VIP & Prestige' },
    { id: 'rewards', label: '⚡ Paliers & Bonus' },
    { id: 'community', label: '💎 Symboles & Formes' }
];

export default function LoyaltyTierIcon({ icon, alt = '', size = 24, className = '', style = {} }) {
    if (!icon) return null;

    // Image URL check
    if (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:image/'))) {
        return (
            <img 
                src={icon} 
                alt={alt || 'Tier icon'} 
                className={className} 
                style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'inline-block', ...style }} 
            />
        );
    }

    // Lucide Icon check
    let name = typeof icon === 'string' ? icon.trim() : '';
    if (name.startsWith('lucide:')) name = name.slice(7);
    if (name.startsWith('Icon') && name.length > 4) name = name.slice(4);

    const IconComponent = LOYALTY_ICON_MAP[name];
    if (IconComponent) {
        return <IconComponent size={size} className={className} style={{ flexShrink: 0, ...style }} />;
    }

    // Fallback
    return <Sparkles size={size} className={className} style={{ flexShrink: 0, ...style }} />;
}
