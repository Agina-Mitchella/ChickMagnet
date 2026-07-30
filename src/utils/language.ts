// Whimsical language localization helper for the Fae World

export type LanguageType = 'EN' | 'SW' | 'FA' | 'FR';

export interface TranslationSet {
  brandTagline: string;
  exploreShop: string;
  pixieAlchemist: string;
  ourLore: string;
  faeProfile: string;
  merchant: string;
  adminHub: string;
  gatheredGoods: string;
  basketTitle: string;
  basketSubtitle: string;
  enchantedCatalog: string;
  placeOrder: string;
  sendAsGift: string;
  currencyLabel: string;
  languageLabel: string;
  giftStation: string;
  giftRecipient: string;
  scrollMessage: string;
  giftWoodland: string;
  walletBalance: string;
  giftCoinsTitle: string;
  sendGiftButton: string;
  historyTitle: string;
  emptyBasket: string;
  browseCurations: string;
}

export const TRANSLATIONS: Record<LanguageType, TranslationSet> = {
  EN: {
    brandTagline: 'Handmade by African makers. Made for you.',
    exploreShop: 'Shop Now',
    pixieAlchemist: 'Custom Orders',
    ourLore: 'Our Story',
    faeProfile: 'My Profile',
    merchant: 'Maker',
    adminHub: 'Admin Hub',
    gatheredGoods: 'My Bag',
    basketTitle: 'My Bag',
    basketSubtitle: 'Your Bag',
    enchantedCatalog: 'Craft Catalog',
    placeOrder: 'Place my order',
    sendAsGift: 'Send as a Gift',
    currencyLabel: 'Currency',
    languageLabel: 'Language',
    giftStation: 'Gifting Station',
    giftRecipient: 'Recipient Name / Email',
    scrollMessage: 'Gift Message',
    giftWoodland: 'Recipient Location',
    walletBalance: 'Wallet Balance',
    giftCoinsTitle: 'Gift Sol Coins directly',
    sendGiftButton: 'Send Gift!',
    historyTitle: 'Order History',
    emptyBasket: 'Your bag is empty',
    browseCurations: 'Browse Products',
  },
  SW: {
    brandTagline: 'Kazi za mikono za Kiafrika. Kwa ajili yako.',
    exploreShop: 'Vinjari Soko',
    pixieAlchemist: 'Zana za AI',
    ourLore: 'Hadithi Zetu',
    faeProfile: 'Wasifu Wangu',
    merchant: 'Mfundi',
    adminHub: 'Kituo cha Admin',
    gatheredGoods: 'Mkoba Wangu',
    basketTitle: 'Mkoba Wangu',
    basketSubtitle: 'Mkoba Wako',
    enchantedCatalog: 'Katalogi ya Kazi za Mikono',
    placeOrder: 'Weka Agizo',
    sendAsGift: 'Tuma kama Zawadi',
    currencyLabel: 'Sarafu',
    languageLabel: 'Lugha',
    giftStation: 'Kituo cha Zawadi',
    giftRecipient: 'Jina / Barua pepe ya Mpokeaji',
    scrollMessage: 'Ujumbe wa Zawadi',
    giftWoodland: 'Mahali pa Mpokeaji',
    walletBalance: 'Salio la Mkoba',
    giftCoinsTitle: 'Tuma sarafu za Sol moja kwa moja',
    sendGiftButton: 'Tuma Zawadi!',
    historyTitle: 'Historia ya Agizo',
    emptyBasket: 'Mkoba wako uko tupu',
    browseCurations: 'Vinjari Bidhaa',
  },
  FA: {
    brandTagline: 'Ubuntu Handmades. Made for you.',
    exploreShop: 'Shop Now',
    pixieAlchemist: 'Custom Orders',
    ourLore: 'Our Story',
    faeProfile: 'My Profile',
    merchant: 'Maker',
    adminHub: 'Admin Hub',
    gatheredGoods: 'My Bag',
    basketTitle: 'My Bag',
    basketSubtitle: 'Your Bag',
    enchantedCatalog: 'Craft Catalog',
    placeOrder: 'Place my order',
    sendAsGift: 'Send as a Gift',
    currencyLabel: 'Currency',
    languageLabel: 'Language',
    giftStation: 'Gifting Station',
    giftRecipient: 'Recipient Name / Email',
    scrollMessage: 'Gift Message',
    giftWoodland: 'Recipient Location',
    walletBalance: 'Wallet Balance',
    giftCoinsTitle: 'Gift Sol Coins directly',
    sendGiftButton: 'Send Gift!',
    historyTitle: 'Order History',
    emptyBasket: 'Your bag is empty',
    browseCurations: 'Browse Products',
  },
  FR: {
    brandTagline: 'Fait-main par des créateurs africains. Pour vous.',
    exploreShop: 'Explorer la Boutique',
    pixieAlchemist: 'Outils IA',
    ourLore: 'Notre Histoire',
    faeProfile: 'Mon Profil',
    merchant: 'Créateur',
    adminHub: 'Centre d\'Administration',
    gatheredGoods: 'Mon Panier',
    basketTitle: 'Mon Panier',
    basketSubtitle: 'Votre Panier',
    enchantedCatalog: 'Catalogue d\'Artisanat',
    placeOrder: 'Passer la Commande',
    sendAsGift: 'Envoyer comme Cadeau',
    currencyLabel: 'Devise',
    languageLabel: 'Langue',
    giftStation: 'Espace Cadeaux',
    giftRecipient: 'Nom / E-mail du Destinataire',
    scrollMessage: 'Message de Cadeau',
    giftWoodland: 'Adresse de Livraison',
    walletBalance: 'Solde du Portefeuille',
    giftCoinsTitle: 'Offrir des pièces Sol',
    sendGiftButton: 'Envoyer le Cadeau !',
    historyTitle: 'Historique de Commande',
    emptyBasket: 'Votre panier est vide',
    browseCurations: 'Parcourir les Articles',
  },
};

export function getSelectedLanguage(): LanguageType {
  return (localStorage.getItem('sol_active_language') as LanguageType) || 'EN';
}

export function translate(key: keyof TranslationSet, fallbackText: string): string {
  const lang = getSelectedLanguage();
  return TRANSLATIONS[lang]?.[key] || fallbackText;
}
