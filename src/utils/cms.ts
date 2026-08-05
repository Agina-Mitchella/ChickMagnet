import { useState, useEffect } from 'react';

export type CMSBlockType = 'text' | 'heading' | 'image' | 'button' | 'toggle' | 'datetime';

export interface CMSHistoryEntry {
  id: string;
  timestamp: string;
  adminName: string;
  oldValue: string | boolean;
  newValue: string | boolean;
}

export interface CMSBlock {
  id: string;
  pageId: string;
  label: string;
  type: CMSBlockType;
  value: string | boolean;
  characterLimit?: number;
  readOnly?: boolean;
  lastEditedBy: string;
  lastEditedAt: string;
  history: CMSHistoryEntry[];
}

export interface CMSPageMeta {
  id: string;
  title: string;
  category: 'page' | 'global' | 'system' | 'email';
}

export const CMS_PAGES: CMSPageMeta[] = [
  { id: 'global', title: 'Global Settings', category: 'global' },
  { id: 'home-shop', title: 'Home / Shop', category: 'page' },
  { id: 'about-us', title: 'About Us (Our Story)', category: 'page' },
  { id: 'lore', title: 'Lore & Heritage', category: 'page' },
  { id: 'new-arrivals', title: 'New Arrivals', category: 'page' },
  { id: 'featured-drops', title: 'Featured Drops', category: 'page' },
  { id: 'seasonal-events', title: 'Seasonal Events', category: 'page' },
  { id: 'custom-orders', title: 'Custom Orders', category: 'page' },
  { id: 'send-gift', title: 'Send a Gift', category: 'page' },
  { id: 'journal', title: 'Journal (Field Notes)', category: 'page' },
  { id: 'maker-stories', title: 'Maker Stories', category: 'page' },
  { id: 'help-faqs', title: 'Help — FAQs', category: 'page' },
  { id: 'help-shipping', title: 'Help — Shipping & Returns', category: 'page' },
  { id: 'help-contact', title: 'Help — Contact Us', category: 'page' },
  { id: 'help-privacy', title: 'Help — Privacy Policy', category: 'page' },
  { id: 'help-terms', title: 'Help — Terms of Service', category: 'page' },
  { id: 'page-404', title: '404 Page', category: 'system' },
  { id: 'maintenance-page', title: 'Maintenance Page', category: 'system' },
  { id: 'order-confirmation', title: 'Order Confirmation Screen', category: 'system' },
  { id: 'email-templates', title: 'Email Templates', category: 'email' },
];

export const DEFAULT_CMS_BLOCKS: CMSBlock[] = [
  // GLOBAL BRANDING & LOGO
  {
    id: 'global_logo_type',
    pageId: 'global',
    label: 'Brand Logo Display Mode (emoji or image)',
    type: 'text',
    value: 'emoji',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_display_mode',
    pageId: 'global',
    label: 'Logo Layout Mode (image_only, image_with_text, emoji_with_text)',
    type: 'text',
    value: 'image_only',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_emoji',
    pageId: 'global',
    label: 'Brand Logo Icon / Emoji',
    type: 'text',
    value: '🐔',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_image_url',
    pageId: 'global',
    label: 'Brand Logo Image (URL or Data URI)',
    type: 'image',
    value: '',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_platform_name',
    pageId: 'global',
    label: 'Platform Brand Name',
    type: 'heading',
    value: 'ChickMagnet',
    readOnly: false,
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_tagline',
    pageId: 'global',
    label: 'Platform Tagline',
    type: 'text',
    value: 'Handmade by African makers. Made for you.',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-20 14:22',
    history: [
      {
        id: 'h1',
        timestamp: '2026-07-10 11:00',
        adminName: 'Solar Elder',
        oldValue: 'African artisan creations for global homes.',
        newValue: 'Handmade by African makers. Made for you.',
      },
    ],
  },
  {
    id: 'global_footer_closing',
    pageId: 'global',
    label: 'Footer Closing Line',
    type: 'text',
    value: 'Built with care. Shipped from makers\' hands.',
    characterLimit: 90,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },
  {
    id: 'global_newsletter_title',
    pageId: 'global',
    label: 'Newsletter Section Name',
    type: 'heading',
    value: 'The Sol Letter',
    characterLimit: 40,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },
  {
    id: 'global_newsletter_body',
    pageId: 'global',
    label: 'Newsletter Body Text',
    type: 'text',
    value: 'Whispers from rural workshops, seasonal drop alerts, and stories of slow craft.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },
  {
    id: 'global_newsletter_button',
    pageId: 'global',
    label: 'Newsletter Button Label',
    type: 'button',
    value: 'Join the Guild',
    characterLimit: 25,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },
  {
    id: 'global_sol_credits_name',
    pageId: 'global',
    label: 'Sol Credits Name',
    type: 'text',
    value: 'Sol Credits',
    characterLimit: 25,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },
  {
    id: 'global_decorative_symbol',
    pageId: 'global',
    label: 'Decorative Symbol',
    type: 'text',
    value: '✦',
    characterLimit: 5,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-22 10:15',
    history: [],
  },

  // HOME / SHOP
  {
    id: 'home_hero_heading',
    pageId: 'home-shop',
    label: 'Shop hero — main heading',
    type: 'heading',
    value: 'Handmade with care. Shipped from African makers.',
    characterLimit: 90,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },
  {
    id: 'home_hero_subheading',
    pageId: 'home-shop',
    label: 'Shop hero — subheading',
    type: 'text',
    value: 'Explore our curated collection of artisan creations, from hand-carved terracotta to organic botanical oils.',
    characterLimit: 180,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },
  {
    id: 'home_hero_cta_label',
    pageId: 'home-shop',
    label: 'Shop hero — CTA button label',
    type: 'button',
    value: 'Explore Catalog',
    characterLimit: 30,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },
  {
    id: 'home_event_banner_toggle',
    pageId: 'home-shop',
    label: 'Seasonal event banner — toggle show/hide',
    type: 'toggle',
    value: true,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },
  {
    id: 'home_community_ticker_toggle',
    pageId: 'home-shop',
    label: 'Community feed ticker — toggle show/hide',
    type: 'toggle',
    value: true,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },
  {
    id: 'home_featured_heading',
    pageId: 'home-shop',
    label: 'Featured section heading',
    type: 'heading',
    value: 'Featured Artisan Creations',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-25 16:30',
    history: [],
  },

  // ABOUT US
  {
    id: 'about_heading',
    pageId: 'about-us',
    label: 'About page — main heading',
    type: 'heading',
    value: 'Our Story & Roots',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_opening_paragraph',
    pageId: 'about-us',
    label: 'About page — opening paragraph',
    type: 'text',
    value: 'Sol Handmades was born out of deep reverence for African craftsmanship and slow-made treasures. We bridge master artisans in rural workshops directly to appreciative global homes.',
    characterLimit: 300,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root1_heading',
    pageId: 'about-us',
    label: 'Root 1 — heading',
    type: 'heading',
    value: '1. Direct-from-Maker Integrity',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root1_body',
    pageId: 'about-us',
    label: 'Root 1 — body text',
    type: 'text',
    value: 'Every item on Sol is crafted by verified independent artisans, preserving ancient techniques and fair prices.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root2_heading',
    pageId: 'about-us',
    label: 'Root 2 — heading',
    type: 'heading',
    value: '2. Transparent Provenance',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root2_body',
    pageId: 'about-us',
    label: 'Root 2 — body text',
    type: 'text',
    value: 'We trace materials to their sustainable origins—from Limpopo clay pits to coastal botanical gardens.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root3_heading',
    pageId: 'about-us',
    label: 'Root 3 — heading',
    type: 'heading',
    value: '3. Community-First Commerce',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_root3_body',
    pageId: 'about-us',
    label: 'Root 3 — body text',
    type: 'text',
    value: 'Over 85% of revenue returns directly to makers and their local workshop guilds.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_spotlight_heading',
    pageId: 'about-us',
    label: 'Maker spotlight section heading',
    type: 'heading',
    value: 'Voices of the Workshop Guilds',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },
  {
    id: 'about_closing_paragraph',
    pageId: 'about-us',
    label: 'Closing invitation paragraph',
    type: 'text',
    value: 'Join us in honoring the hands that shape our physical world.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-18 09:12',
    history: [],
  },

  // LORE & HERITAGE
  {
    id: 'lore_main_heading',
    pageId: 'lore',
    label: 'Lore page — main banner heading',
    type: 'heading',
    value: 'The Lore of Golden Hour',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_opening_quote',
    pageId: 'lore',
    label: 'Lore page — main opening quote',
    type: 'text',
    value: 'Between the fading sun and the cream-misted moon lies a magical hour. Here, our fingers weave marigolds and tree saps into relics that bring comforting warmth to mortal homes.',
    characterLimit: 300,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_palette_title',
    pageId: 'lore',
    label: 'Palette section — title',
    type: 'heading',
    value: 'Why Orange & Cream?',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_palette_body_1',
    pageId: 'lore',
    label: 'Palette section — paragraph 1',
    type: 'text',
    value: 'We selected the palette of warm sun-ripened orange and velvety rich cream because they carry the healing properties of forest hearths. Orange brings the active warmth of Solstice fires, dried citrus, and amber resins. Cream represents the soothing protection of fresh thistledown silk, wild chamomile, and misted pine sap.',
    characterLimit: 400,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_palette_body_2',
    pageId: 'lore',
    label: 'Palette section — paragraph 2 (sustainability)',
    type: 'text',
    value: 'Every single product listed on our shelves is harvested responsibly. We do not fell trees; we only carve wood that has surrendered willingly to the forest floor.',
    characterLimit: 300,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_guild_seal',
    pageId: 'lore',
    label: 'Guild covenant seal label',
    type: 'text',
    value: 'Blessed under Golden Harvest Spell Laws',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_locations_heading',
    pageId: 'lore',
    label: 'Locations section — title',
    type: 'heading',
    value: 'Our Fairy Sols & Sacred Groves',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_1_name',
    pageId: 'lore',
    label: 'Location 1 — Name',
    type: 'text',
    value: 'High Oak Sanctuary',
    characterLimit: 40,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_1_desc',
    pageId: 'lore',
    label: 'Location 1 — Description',
    type: 'text',
    value: 'Nestled in high oaks, famous for glassblowing and weaving marigold filaments under cozy lamps.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_2_name',
    pageId: 'lore',
    label: 'Location 2 — Name',
    type: 'text',
    value: 'Emberglow Orchards',
    characterLimit: 40,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_2_desc',
    pageId: 'lore',
    label: 'Location 2 — Description',
    type: 'text',
    value: 'Home of sweet candied citrus shards and windchimes crafted with fired clay bells.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_3_name',
    pageId: 'lore',
    label: 'Location 3 — Name',
    type: 'text',
    value: 'Sylvan Slumber Sol',
    characterLimit: 40,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },
  {
    id: 'lore_location_3_desc',
    pageId: 'lore',
    label: 'Location 3 — Description',
    type: 'text',
    value: 'A peaceful foggy meadow where thistlesilk and sleep chamomile eye veils are stitched at twilight.',
    characterLimit: 200,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-27 10:00',
    history: [],
  },

  // NEW ARRIVALS
  {
    id: 'new_arrivals_heading',
    pageId: 'new-arrivals',
    label: 'New Arrivals — main heading',
    type: 'heading',
    value: 'Fresh from the Workshops',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-15 12:00',
    history: [],
  },
  {
    id: 'new_arrivals_subtext',
    pageId: 'new-arrivals',
    label: 'New Arrivals — subtext',
    type: 'text',
    value: 'Be the first to explore brand new handcrafted creations uploaded by master makers this week.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-15 12:00',
    history: [],
  },

  // FEATURED DROPS
  {
    id: 'featured_drops_heading',
    pageId: 'featured-drops',
    label: 'Featured Drops — main heading',
    type: 'heading',
    value: 'Limited Edition Drops',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-15 12:00',
    history: [],
  },

  // SEASONAL EVENTS
  {
    id: 'seasonal_events_heading',
    pageId: 'seasonal-events',
    label: 'Seasonal Events — main heading',
    type: 'heading',
    value: 'Sol Solstice & Seasonal Festivals',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-15 12:00',
    history: [],
  },

  // CUSTOM ORDERS
  {
    id: 'custom_orders_heading',
    pageId: 'custom-orders',
    label: 'Custom Orders — page heading',
    type: 'heading',
    value: 'Bespoke & Custom Commissions',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_orders_subtitle',
    pageId: 'custom-orders',
    label: 'Custom Orders — page subtitle',
    type: 'text',
    value: 'Collaborate directly with master artisans to bring your unique vision to life.',
    characterLimit: 180,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step1_heading',
    pageId: 'custom-orders',
    label: 'How it works — Step 1 heading',
    type: 'heading',
    value: '1. Share Your Vision',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step1_body',
    pageId: 'custom-orders',
    label: 'How it works — Step 1 body text',
    type: 'text',
    value: 'Describe your desired piece, dimensions, and preferred materials to the maker.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step2_heading',
    pageId: 'custom-orders',
    label: 'How it works — Step 2 heading',
    type: 'heading',
    value: '2. Receive Artisan Proposal',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step2_body',
    pageId: 'custom-orders',
    label: 'How it works — Step 2 body text',
    type: 'text',
    value: 'The maker will review your request, provide a timeline, and send a custom quote.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step3_heading',
    pageId: 'custom-orders',
    label: 'How it works — Step 3 heading',
    type: 'heading',
    value: '3. Handcrafted for You',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },
  {
    id: 'custom_step3_body',
    pageId: 'custom-orders',
    label: 'How it works — Step 3 body text',
    type: 'text',
    value: 'Once approved, your piece is created with careful devotion and shipped directly.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-21 11:45',
    history: [],
  },

  // SEND A GIFT
  {
    id: 'gift_heading',
    pageId: 'send-gift',
    label: 'Send a Gift — page heading',
    type: 'heading',
    value: 'Send a Handcrafted Gift',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_subtitle',
    pageId: 'send-gift',
    label: 'Send a Gift — page subtitle',
    type: 'text',
    value: 'Curate a thoughtful present wrapped in natural linen and sealed with an artisan wax stamp.',
    characterLimit: 180,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step1_heading',
    pageId: 'send-gift',
    label: 'Gift Step 1 — heading',
    type: 'heading',
    value: '1. Choose a Treasure',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step1_body',
    pageId: 'send-gift',
    label: 'Gift Step 1 — body text',
    type: 'text',
    value: 'Select a piece from any verified maker shop.',
    characterLimit: 120,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step2_heading',
    pageId: 'send-gift',
    label: 'Gift Step 2 — heading',
    type: 'heading',
    value: '2. Personalize Your Note',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step2_body',
    pageId: 'send-gift',
    label: 'Gift Step 2 — body text',
    type: 'text',
    value: 'Add a custom calligraphy message or audio scroll.',
    characterLimit: 120,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step3_heading',
    pageId: 'send-gift',
    label: 'Gift Step 3 — heading',
    type: 'heading',
    value: '3. Direct Delivery',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },
  {
    id: 'gift_step3_body',
    pageId: 'send-gift',
    label: 'Gift Step 3 — body text',
    type: 'text',
    value: 'Delivered in eco-friendly packaging with tracking for peace of mind.',
    characterLimit: 120,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-19 14:00',
    history: [],
  },

  // JOURNAL / FIELD NOTES
  {
    id: 'journal_heading',
    pageId: 'journal',
    label: 'Journal — main heading',
    type: 'heading',
    value: 'Field Notes & Workshop Chronicles',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-12 10:00',
    history: [],
  },

  // MAKER STORIES
  {
    id: 'maker_stories_heading',
    pageId: 'maker-stories',
    label: 'Maker Stories — main heading',
    type: 'heading',
    value: 'Stories of the Hands Behind the Craft',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-12 10:00',
    history: [],
  },

  // HELP - FAQS
  {
    id: 'help_faqs_heading',
    pageId: 'help-faqs',
    label: 'Help FAQs — main heading',
    type: 'heading',
    value: 'Frequently Asked Questions',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-10 16:00',
    history: [],
  },

  // HELP - SHIPPING
  {
    id: 'help_shipping_heading',
    pageId: 'help-shipping',
    label: 'Shipping & Returns — main heading',
    type: 'heading',
    value: 'Shipping & Returns Policy',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-10 16:00',
    history: [],
  },

  // HELP - CONTACT
  {
    id: 'help_contact_heading',
    pageId: 'help-contact',
    label: 'Contact Us — main heading',
    type: 'heading',
    value: 'Connect with Guild Care',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-10 16:00',
    history: [],
  },

  // HELP - PRIVACY
  {
    id: 'help_privacy_heading',
    pageId: 'help-privacy',
    label: 'Privacy Policy — main heading',
    type: 'heading',
    value: 'Privacy & Data Protection Policy',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-10 16:00',
    history: [],
  },

  // HELP - TERMS
  {
    id: 'help_terms_heading',
    pageId: 'help-terms',
    label: 'Terms of Service — main heading',
    type: 'heading',
    value: 'Terms & Conditions of Service',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-10 16:00',
    history: [],
  },

  // 404 PAGE
  {
    id: 'p404_heading',
    pageId: 'page-404',
    label: '404 — Heading',
    type: 'heading',
    value: 'Path Lost in the Woodland',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-14 11:30',
    history: [],
  },
  {
    id: 'p404_subtext',
    pageId: 'page-404',
    label: '404 — Subtext',
    type: 'text',
    value: 'The page or creation you are searching for has wandered beyond our map.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-14 11:30',
    history: [],
  },
  {
    id: 'p404_cta1',
    pageId: 'page-404',
    label: '404 — CTA button label 1',
    type: 'button',
    value: 'Return to Home',
    characterLimit: 30,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-14 11:30',
    history: [],
  },
  {
    id: 'p404_cta2',
    pageId: 'page-404',
    label: '404 — CTA button label 2',
    type: 'button',
    value: 'Explore Catalog',
    characterLimit: 30,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-14 11:30',
    history: [],
  },
  {
    id: 'p404_cta3',
    pageId: 'page-404',
    label: '404 — CTA button label 3',
    type: 'button',
    value: 'Contact Guild Support',
    characterLimit: 30,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-14 11:30',
    history: [],
  },

  // MAINTENANCE PAGE
  {
    id: 'maint_heading',
    pageId: 'maintenance-page',
    label: 'Maintenance — Heading',
    type: 'heading',
    value: 'Under Sylvan Care',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-16 08:00',
    history: [],
  },
  {
    id: 'maint_subheading',
    pageId: 'maintenance-page',
    label: 'Maintenance — Subheading / message',
    type: 'text',
    value: 'Our platform is undergoing scheduled maintenance to polish the workshop gears.',
    characterLimit: 180,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-16 08:00',
    history: [],
  },
  {
    id: 'maint_return_time',
    pageId: 'maintenance-page',
    label: 'Maintenance — Estimated return time',
    type: 'text',
    value: 'Expected back online: Today at 06:00 PM EAT',
    characterLimit: 60,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-16 08:00',
    history: [],
  },

  // ORDER CONFIRMATION SCREEN
  {
    id: 'order_confirmed_heading',
    pageId: 'order-confirmation',
    label: 'Order confirmation — main heading',
    type: 'heading',
    value: 'Order confirmed!',
    characterLimit: 50,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-23 15:10',
    history: [],
  },
  {
    id: 'order_confirmed_maker_subtext',
    pageId: 'order-confirmation',
    label: 'Order confirmation — maker notification subtext',
    type: 'text',
    value: 'We have dispatched a notification scroll to the maker\'s workshop.',
    characterLimit: 150,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-23 15:10',
    history: [],
  },
  {
    id: 'order_confirmed_credits_message',
    pageId: 'order-confirmation',
    label: 'Order confirmation — Sol Credits earn message',
    type: 'text',
    value: 'You earned 150 Sol Credits on this purchase!',
    characterLimit: 120,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-23 15:10',
    history: [],
  },
  {
    id: 'order_confirmed_button_label',
    pageId: 'order-confirmation',
    label: 'Order confirmation — back to market button label',
    type: 'button',
    value: 'Return to Shop',
    characterLimit: 30,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-23 15:10',
    history: [],
  },

  // EMAIL TEMPLATES
  {
    id: 'email_receipt_subject',
    pageId: 'email-templates',
    label: 'Order Receipt Email — Subject line',
    type: 'heading',
    value: 'Your Sol Handmades Order Receipt #[Order_ID]',
    characterLimit: 90,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_receipt_heading',
    pageId: 'email-templates',
    label: 'Order Receipt Email — Heading',
    type: 'heading',
    value: 'Thank you for supporting African artisans!',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_receipt_body',
    pageId: 'email-templates',
    label: 'Order Receipt Email — Body text',
    type: 'text',
    value: 'Your order has been received and confirmed by the maker.',
    characterLimit: 250,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_receipt_cta',
    pageId: 'email-templates',
    label: 'Order Receipt Email — CTA button label',
    type: 'button',
    value: 'View Order Tracking',
    characterLimit: 35,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_receipt_footer',
    pageId: 'email-templates',
    label: 'Order Receipt Email — Footer closing line',
    type: 'text',
    value: 'Warm regards, The Sol Handmades Team',
    characterLimit: 100,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_maker_welcome_subject',
    pageId: 'email-templates',
    label: 'Maker Welcome Email — Subject line',
    type: 'heading',
    value: 'Welcome to Sol Handmades Guild!',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_maker_welcome_heading',
    pageId: 'email-templates',
    label: 'Maker Welcome Email — Heading',
    type: 'heading',
    value: 'Your Maker Studio is Active',
    characterLimit: 80,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_maker_welcome_body',
    pageId: 'email-templates',
    label: 'Maker Welcome Email — Body text',
    type: 'text',
    value: 'You can now publish your creations and receive orders from global buyers.',
    characterLimit: 250,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_maker_welcome_cta',
    pageId: 'email-templates',
    label: 'Maker Welcome Email — CTA button label',
    type: 'button',
    value: 'Open Maker Dashboard',
    characterLimit: 35,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
  {
    id: 'email_maker_welcome_footer',
    pageId: 'email-templates',
    label: 'Maker Welcome Email — Footer closing line',
    type: 'text',
    value: 'We are honored to have you in our community.',
    characterLimit: 100,
    lastEditedBy: 'Solar Elder',
    lastEditedAt: '2026-07-24 17:00',
    history: [],
  },
];

const STORAGE_KEY = 'sol_cms_data_v1';
const AUDIT_LOG_KEY = 'sol_cms_audit_logs';

export function getStoredCMSData(): CMSBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CMS_BLOCKS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CMS_BLOCKS;
    
    // Merge any missing default blocks in case new ones were introduced
    const existingIds = new Set(parsed.map((b: any) => b.id));
    const missing = DEFAULT_CMS_BLOCKS.filter(b => !existingIds.has(b.id));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_CMS_BLOCKS;
  }
}

export function saveStoredCMSData(blocks: CMSBlock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch (e) {
    console.error('Failed to save CMS data to localStorage:', e);
  }
}

export function getCMSValue(blockId: string, fallback: string): string {
  const blocks = getStoredCMSData();
  const block = blocks.find(b => b.id === blockId);
  if (!block || block.value === undefined || block.value === null) return fallback;
  return String(block.value);
}

export function getCMSToggle(blockId: string, fallback: boolean): boolean {
  const blocks = getStoredCMSData();
  const block = blocks.find(b => b.id === blockId);
  if (!block || typeof block.value !== 'boolean') return fallback;
  return block.value;
}

export function updateCMSBlock(
  blockId: string,
  newValue: string | boolean,
  adminName: string = 'Solar Elder'
): { success: boolean; updatedBlock?: CMSBlock; message?: string } {
  const blocks = getStoredCMSData();
  const index = blocks.findIndex(b => b.id === blockId);

  if (index === -1) {
    return { success: false, message: 'Content block not found.' };
  }

  const block = blocks[index];

  if (block.readOnly) {
    return { success: false, message: 'This system block is read-only.' };
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const oldValue = block.value;

  // Add history item
  const newHistoryItem: CMSHistoryEntry = {
    id: 'h_' + Date.now(),
    timestamp,
    adminName,
    oldValue,
    newValue,
  };

  const updatedHistory = [newHistoryItem, ...(block.history || [])].slice(0, 5);

  const updatedBlock: CMSBlock = {
    ...block,
    value: newValue,
    lastEditedBy: adminName,
    lastEditedAt: timestamp,
    history: updatedHistory,
  };

  blocks[index] = updatedBlock;
  saveStoredCMSData(blocks);

  // Sync with backend API
  if (typeof window !== 'undefined') {
    fetch('/api/v1/content/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block: updatedBlock, blocks })
    }).catch(err => console.warn('CMS backend sync notice:', err));

    // Dispatch custom event so rest of application refreshes real-time
    window.dispatchEvent(
      new CustomEvent('sol_cms_updated', {
        detail: { blockId, newValue, adminName, timestamp },
      })
    );
  }

  // Record audit log entry
  try {
    const rawLogs = localStorage.getItem(AUDIT_LOG_KEY);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];
    logs.unshift({
      id: 'log_' + Date.now(),
      blockId,
      label: block.label,
      adminName,
      timestamp,
      oldValue,
      newValue,
    });
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Failed to update CMS audit log:', e);
  }

  return { success: true, updatedBlock };
}

export function restoreCMSHistory(
  blockId: string,
  historyEntryId: string,
  adminName: string = 'Solar Elder'
): { success: boolean; restoredValue?: string | boolean; message?: string } {
  const blocks = getStoredCMSData();
  const block = blocks.find(b => b.id === blockId);
  if (!block) return { success: false, message: 'Block not found' };

  const historyItem = block.history?.find(h => h.id === historyEntryId);
  if (!historyItem) return { success: false, message: 'History version not found' };

  const targetVal = historyItem.oldValue;
  return updateCMSBlock(blockId, targetVal, adminName + ' (Restore)');
}

export function useCMSBlock(blockId: string, fallback: string): string {
  const [val, setVal] = useState<string>(() => getCMSValue(blockId, fallback));

  useEffect(() => {
    const handleUpdate = () => {
      setVal(getCMSValue(blockId, fallback));
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [blockId, fallback]);

  return val;
}

export function useCMSToggle(blockId: string, fallback: boolean): boolean {
  const [val, setVal] = useState<boolean>(() => getCMSToggle(blockId, fallback));

  useEffect(() => {
    const handleUpdate = () => {
      setVal(getCMSToggle(blockId, fallback));
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [blockId, fallback]);

  return val;
}

export interface BrandLogoConfig {
  logoType: 'emoji' | 'image';
  logoDisplayMode?: 'image_only' | 'image_with_text' | 'emoji_with_text';
  logoEmoji: string;
  logoImageUrl: string;
  brandName: string;
}

export const getStoredBrandLogo = (): BrandLogoConfig => {
  const blocks = getStoredCMSData();
  const logoTypeBlock = blocks.find(b => b.id === 'global_logo_type');
  const logoDisplayModeBlock = blocks.find(b => b.id === 'global_logo_display_mode');
  const logoEmojiBlock = blocks.find(b => b.id === 'global_logo_emoji');
  const logoImageBlock = blocks.find(b => b.id === 'global_logo_image_url');
  const brandNameBlock = blocks.find(b => b.id === 'global_platform_name');

  return {
    logoType: (logoTypeBlock?.value as 'emoji' | 'image') || 'emoji',
    logoDisplayMode: (logoDisplayModeBlock?.value as 'image_only' | 'image_with_text' | 'emoji_with_text') || 'image_only',
    logoEmoji: (logoEmojiBlock?.value as string) || '🐔',
    logoImageUrl: (logoImageBlock?.value as string) || '',
    brandName: (brandNameBlock?.value as string) || 'ChickMagnet',
  };
};

export const updateBrandLogo = (config: Partial<BrandLogoConfig>, adminName: string = 'Admin') => {
  if (config.logoType !== undefined) {
    updateCMSBlock('global_logo_type', config.logoType, adminName);
  }
  if (config.logoDisplayMode !== undefined) {
    updateCMSBlock('global_logo_display_mode', config.logoDisplayMode, adminName);
  }
  if (config.logoEmoji !== undefined) {
    updateCMSBlock('global_logo_emoji', config.logoEmoji, adminName);
  }
  if (config.logoImageUrl !== undefined) {
    updateCMSBlock('global_logo_image_url', config.logoImageUrl, adminName);
  }
  if (config.brandName !== undefined) {
    updateCMSBlock('global_platform_name', config.brandName, adminName);
  }
  window.dispatchEvent(new Event('chickmagnet_brand_updated'));
};

export function useBrandLogo(): BrandLogoConfig {
  const [brand, setBrand] = useState<BrandLogoConfig>(getStoredBrandLogo);

  useEffect(() => {
    const handleUpdate = () => {
      setBrand(getStoredBrandLogo());
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('chickmagnet_brand_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('chickmagnet_brand_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return brand;
}
