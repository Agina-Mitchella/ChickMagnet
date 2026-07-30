import { PrismaClient, UserRole, ShopStatus, LoreMode, ProductCategory, ProductIntention, ProductType, OrderStatus, GiftStatus, TransactionType, PromotionType, DiscountType, DisputeReason, DesiredOutcome, DisputeStatus, SenderRole, Recommendation, QAStatus, BlogCategory, ChangeType, NotificationType, RewardType, ReferralStatus, GDPRRequestType, GDPRStatus, ConsentType, IncidentStatus, SeasonalSeason, HearthEventType, PayoutStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Password hashing
  const passwordHash = await bcrypt.hash('SylvanDream2026!', 12);

  // 1. Create Admins and Staff
  console.log('Creating Admin & Staff users...');
  const admin1 = await prisma.user.create({
    data: {
      email: 'elder.willow@solhandmades.com',
      name: 'Elder Willow',
      passwordHash,
      role: UserRole.ADMIN,
      avatarEmoji: '🌳',
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'uxagina@gmail.com', // User's email as Admin
      name: 'Pip Thistlewood',
      passwordHash,
      role: UserRole.ADMIN,
      avatarEmoji: '🧚',
    }
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'fern.oakley@solhandmades.com',
      name: 'Fern Oakley',
      passwordHash,
      role: UserRole.STAFF,
      avatarEmoji: '🌿',
    }
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'moss.glimmer@solhandmades.com',
      name: 'Moss Glimmer',
      passwordHash,
      role: UserRole.STAFF,
      avatarEmoji: '🍄',
    }
  });

  // 2. Create 6 Keepers
  console.log('Creating Keeper profiles...');
  const keeperData = [
    { name: 'Marigold Lightweaver', email: 'marigold@sylvan.fae', shopName: 'Lightweaver Lanterns', slug: 'lightweaver-lanterns', category: ProductCategory.ENCHANTED_DECOR, lore: LoreMode.SOLAR, away: false },
    { name: 'Bramble Thornbark', email: 'bramble@sylvan.fae', shopName: 'Thornbark Carvings', slug: 'thornbark-carvings', category: ProductCategory.OUTDOOR_MAGIC, lore: LoreMode.WOODLAND, away: false },
    { name: 'Dewdrop Glimmer', email: 'dewdrop@sylvan.fae', shopName: 'Dewdrop Apothecary', slug: 'dewdrop-apothecary', category: ProductCategory.PIXIE_POTIONS_AND_BALMS, lore: LoreMode.WOODLAND, away: true, awayMsg: 'Away gathering morning dew in the High Misty Peaks until next solstice.' },
    { name: 'Zephyr Whispering', email: 'zephyr@sylvan.fae', shopName: 'Zephyr Silkweavers', slug: 'zephyr-silkweavers', category: ProductCategory.WANDERING_WEARABLES, lore: LoreMode.SOLAR, away: false },
    { name: 'Acorn Nutkin', email: 'acorn@sylvan.fae', shopName: 'The Cozy Hollow', slug: 'the-cozy-hollow', category: ProductCategory.ENCHANTED_DECOR, lore: LoreMode.WOODLAND, away: true, awayMsg: 'Hibernate season is active. Enjoying warm cider by the fireplace.' },
    { name: 'Celestia Sunbloom', email: 'celestia@sylvan.fae', shopName: 'Sunbloom Terrariums', slug: 'sunbloom-terrariums', category: ProductCategory.OUTDOOR_MAGIC, lore: LoreMode.SOLAR, away: false }
  ];

  const keepers: any[] = [];
  for (const k of keeperData) {
    const user = await prisma.user.create({
      data: {
        email: k.email,
        name: k.name,
        passwordHash,
        role: UserRole.KEEPER,
        avatarEmoji: k.away ? '💤' : '✨',
      }
    });

    const keeper = await prisma.keeperProfile.create({
      data: {
        userId: user.id,
        shopSlug: k.slug,
        shopName: k.shopName,
        bio: `Authentic handmade wonders crafted by ${k.name} in the heart of Sol Handmades.`,
        shopStatus: ShopStatus.LAUNCHED,
        loreMode: k.lore,
        awayMode: k.away,
        awayMessage: k.awayMsg,
        returnDate: k.away ? new Date('2026-08-01') : null,
        announcementText: '✨ Golden Solstice Sale! Enjoy 15% off all glowing decor.',
        announcementExpiry: new Date('2026-07-20'),
        accentColour: k.lore === LoreMode.SOLAR ? '#FAF5EC' : '#EAF4EC',
        sectionOrder: ['Featured', 'All Wonders']
      }
    });
    keepers.push(keeper);
  }

  // 3. Create 24 Products (4 per Keeper)
  console.log('Creating products, tags, and digital files...');
  const products: any[] = [];
  const productAuras = [ProductIntention.COZINESS, ProductIntention.PROTECTION, ProductIntention.WILD_WHIMSY, ProductIntention.SUNSET_WARMTH];

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i];
    const defaultCat = keeperData[i].category;

    for (let j = 0; j < 4; j++) {
      const isDigital = j === 3; // 4th product of each is digital
      const title = `${isDigital ? 'Digital guide to' : 'Handcrafted'} ${keeperData[i].shopName.split(' ')[0]} Wonder ${j + 1}`;
      
      const product = await prisma.product.create({
        data: {
          keeperId: keeper.id,
          title,
          description: `A masterfully styled masterpiece, designed for comfort and magic. Formed by hand under optimal astral coordinates.`,
          originStory: `Crafted in the deep circles of the Sol Forest, utilizing sustainable fibers and ancestral songs.`,
          loreTag: j % 2 === 0 ? 'Fae blessed' : 'Solar solaris',
          price: (15 + j * 10) * 100, // stored in minor units
          currency: 'KES',
          stockQuantity: isDigital ? 9999 : (j === 0 ? 0 : 5 + j), // One product out of stock for back-in-stock test
          lowStockThreshold: 2,
          category: defaultCat,
          intention: productAuras[j % 4],
          productType: isDigital ? ProductType.DIGITAL : ProductType.PHYSICAL,
          images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'],
          isActive: true,
          isEventFeatured: i === 0 && j === 0,
          visibilityScore: 90 + j,
          tags: {
            create: [
              { name: 'artisan' },
              { name: 'cozy' }
            ]
          }
        }
      });

      if (isDigital) {
        await prisma.digitalFile.create({
          data: {
            productId: product.id,
            filename: `${title.toLowerCase().replace(/ /g, '_')}_guide.pdf`,
            fileSize: 2048576,
            fileType: 'application/pdf',
            s3Key: `digital_files/${product.id}/guide.pdf`,
            downloadLimit: 5
          }
        });
      }

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: 'Standard Twilight Size',
          stock: isDigital ? 9999 : 5
        }
      });

      products.push(product);
    }
  }

  // 4. Create Seasonal Events
  console.log('Creating seasonal events...');
  const activeEvent = await prisma.event.create({
    data: {
      name: 'Summer Solstice Gathering',
      description: 'The sun rests at its highest peak, filling every leaf with molten gold.',
      season: SeasonalSeason.SUMMER_SOLSTICE,
      accentColour: '#E97451',
      icon: '🌞',
      startDate: new Date('2026-06-20'),
      endDate: new Date('2026-07-30'),
      isActive: true,
    }
  });

  const upcomingEvent = await prisma.event.create({
    data: {
      name: 'Autumn Equinox Whispers',
      description: 'The golden hour transitions into the warm amber of rustling leaves.',
      season: SeasonalSeason.AUTUMN_EQUINOX,
      accentColour: '#D27D2D',
      icon: '🍂',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-10-31'),
      isActive: false,
    }
  });

  // Link products to events
  for (let i = 0; i < 6; i++) {
    await prisma.eventProduct.create({
      data: {
        eventId: activeEvent.id,
        productId: products[i].id
      }
    });
  }

  // 5. Create 8 Buyers
  console.log('Creating buyer users...');
  const buyers: any[] = [];
  for (let i = 1; i <= 8; i++) {
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@glade.fae`,
        name: `Gatherer ${i}`,
        passwordHash,
        role: UserRole.BUYER,
        avatarEmoji: '🎒',
        referralCode: {
          create: {
            code: `GATHER-${i}-COZY`,
            rewardType: RewardType.FIXED_COINS
          }
        },
        consentRecords: {
          createMany: {
            data: [
              { consentType: ConsentType.COOKIES, version: '1.0', isGranted: true },
              { consentType: ConsentType.MARKETING, version: '1.0', isGranted: i % 2 === 0 },
              { consentType: ConsentType.LORE_TRACKING, version: '1.0', isGranted: true }
            ]
          }
        },
        addresses: {
          create: {
            fullName: `Gatherer ${i} Oakley`,
            line1: `${i * 12} Elderberry Lane`,
            city: 'Nairobi',
            postalCode: '00100',
            country: 'Kenya',
            isDefault: true
          }
        },
        savedPaymentMethods: {
          create: {
            stripePaymentMethodId: `pm_mock_${i}`,
            last4: `424${i}`,
            brand: 'visa',
            expMonth: 12,
            expYear: 2028,
            isDefault: true
          }
        }
      }
    });
    buyers.push(buyer);
  }

  // 6. Create 20 Orders in Varied Statuses
  console.log('Creating historical orders, payouts, and reviews...');
  const orderStatuses = [
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.SHIPPED, OrderStatus.SHIPPED, OrderStatus.PREPARING, OrderStatus.PREPARING,
    OrderStatus.PENDING, OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.RETURNED
  ];

  for (let i = 0; i < 20; i++) {
    const buyer = buyers[i % buyers.length];
    const product = products[i % products.length];
    const status = orderStatuses[i % orderStatuses.length];
    const isGift = i === 4 || i === 9; // 2 gifts

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        status,
        isGift,
        giftMessage: isGift ? 'May the forest spirits bless your home with warmth!' : null,
        buyerNote: 'Please wrap carefully in twilight moss.',
        subtotal: product.price,
        platformFee: Math.floor(product.price * 0.05),
        transactionFee: 200,
        total: Math.floor(product.price * 1.05) + 200,
        currency: 'KES',
        stripePaymentIntentId: `pi_mock_${i}`,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceAtPurchase: product.price
          }
        },
        statusHistory: {
          createMany: {
            data: [
              { status: OrderStatus.PENDING, note: 'Order submitted to the elder scroll.' },
              { status, note: `Status transitioned to ${status}.` }
            ]
          }
        }
      }
    });

    // Add payouts for completed orders
    if (status === OrderStatus.DELIVERED) {
      await prisma.payout.create({
        data: {
          keeperId: product.keeperId,
          amount: Math.floor(product.price * 0.95),
          currency: 'KES',
          status: PayoutStatus.PAID,
          periodStart: new Date('2026-07-01'),
          periodEnd: new Date('2026-07-07'),
        }
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          orderId: order.id,
          type: TransactionType.CHARGE,
          amount: product.price,
          platformFee: Math.floor(product.price * 0.05),
          netAmount: Math.floor(product.price * 0.95),
          stripeChargeId: `ch_mock_${i}`
        }
      });

      // Add reviews
      if (i < 8) {
        await prisma.review.create({
          data: {
            orderId: order.id,
            buyerId: buyer.id,
            productId: product.id,
            rating: 5 - (i % 2),
            comment: 'Simply magical. The orange wood scent fills my whole forest dwelling with pure joy.',
            photos: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'],
            caption: 'Beautiful warm orange glow!',
            recommendation: Recommendation.YES,
            keeperReply: i % 3 === 0 ? 'Thank you so much, dear gatherer! May it shine bright.' : null,
            keeperRepliedAt: i % 3 === 0 ? new Date() : null
          }
        });
      }
    }

    // Gift link creation for gift orders
    if (isGift) {
      await prisma.giftLink.create({
        data: {
          orderId: order.id,
          token: `gift-token-uuid-${i}`,
          recipientEmail: `friend_of_gatherer${i}@whispering.fae`,
          senderName: buyer.name,
          personalMessage: 'Here is a little forest charm for your heart.',
          expiresAt: new Date('2026-10-13'),
          status: i === 4 ? GiftStatus.CLAIMED : GiftStatus.SEALED,
          claimedAt: i === 4 ? new Date() : null,
        }
      });
    }

    // Dispute creation for a failed order
    if (i === 12) {
      const dispute = await prisma.dispute.create({
        data: {
          orderId: order.id,
          buyerId: buyer.id,
          keeperId: product.keeperId,
          reason: DisputeReason.DAMAGED,
          description: 'The glowing orb arrived with a crack in the crystal. The warm light is escaping!',
          photos: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'],
          desiredOutcome: DesiredOutcome.FULL_REFUND,
          status: DisputeStatus.OPEN,
          adminNote: 'Pending Keeper response.'
        }
      });

      await prisma.disputeMessage.create({
        data: {
          disputeId: dispute.id,
          senderId: buyer.id,
          senderRole: SenderRole.BUYER,
          content: 'Here is the image showing the cracked base.',
          attachments: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600']
        }
      });
    }
  }

  // 7. Promotions
  console.log('Creating promotions...');
  const promo1 = await prisma.promotion.create({
    data: {
      name: 'Autumn Equinox Earlybird',
      type: PromotionType.SALE,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      startsAt: new Date('2026-07-01'),
      endsAt: new Date('2026-08-31'),
      isActive: true
    }
  });

  const promo2 = await prisma.promotion.create({
    data: {
      name: 'COZYNEST',
      type: PromotionType.COUPON,
      discountType: DiscountType.FIXED,
      discountValue: 500, // 500 KES
      startsAt: new Date('2026-07-01'),
      endsAt: new Date('2026-12-31'),
      isActive: true
    }
  });

  const promo3 = await prisma.promotion.create({
    data: {
      name: 'Forest Dweller Set',
      type: PromotionType.BUNDLE,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      startsAt: new Date('2026-07-01'),
      endsAt: new Date('2026-07-31'),
      isActive: true
    }
  });

  // Link products to promotions
  await prisma.promotionProduct.create({
    data: {
      promotionId: promo1.id,
      productId: products[0].id
    }
  });

  // 8. Field Notes (5 posts)
  console.log('Creating Field Notes...');
  const blogCats = [BlogCategory.TALES, BlogCategory.RECIPES, BlogCategory.SPELLS, BlogCategory.KEEPER_NEWS, BlogCategory.TALES];
  for (let i = 0; i < 5; i++) {
    await prisma.fieldNote.create({
      data: {
        title: `Sylvan Secret Ledger Volume ${i + 1}`,
        slug: `sylvan-secret-ledger-volume-${i + 1}`,
        category: blogCats[i],
        excerpt: 'Ancient ways to treat raw materials with starlight and sun-cleansed linen.',
        body: 'In the oldest days of the Sylvan Glade, the elders wrote about treating birch wood with wild honey at twilight to lock in positive vibrations...',
        authorId: admin1.id,
        readTimeMinutes: 4 + i,
        isPublished: true,
        publishedAt: new Date(),
      }
    });
  }

  // 9. Keeper Stories
  console.log('Creating Keeper Stories...');
  await prisma.keeperStory.create({
    data: {
      keeperId: keepers[0].id,
      sections: [
        { title: 'The Call of Starlight', content: 'Marigold recalls the first day she captured twilight inside a glass orb.' },
        { title: 'Meticulous Glass Weaving', content: 'Our lanterns use double-layered glass blown near active mineral geysers.' }
      ],
      pullQuote: 'Every spark is a miniature sun warming the soul.',
      featuredListingId: products[0].id,
      publishedAt: new Date()
    }
  });

  await prisma.keeperStory.create({
    data: {
      keeperId: keepers[1].id,
      sections: [
        { title: 'Voices in the Timber', content: 'Bramble carves only from fallen trees that whisper their name during autumn.' }
      ],
      pullQuote: 'Wood remembers the forest songs.',
      featuredListingId: products[4].id,
      publishedAt: new Date()
    }
  });

  // 10. Changelog entries
  console.log('Creating Changelog...');
  await prisma.changelogEntry.create({
    data: {
      title: 'Hearth Feed Active Broadcasting',
      description: 'The glade hearth now broadcasts real-time craft events to all users.',
      version: '1.2.0',
      audience: ['BUYER', 'KEEPER'],
      changeType: ChangeType.FEATURE,
      isDraft: false,
      publishedAt: new Date()
    }
  });

  // 11. Active Platform Incident
  console.log('Creating Status incident...');
  await prisma.platformIncident.create({
    data: {
      title: 'Stripe Connect sync delays',
      affectedServices: ['Keeper Dashboard', 'Payouts'],
      status: IncidentStatus.INVESTIGATING,
      startedAt: new Date()
    }
  });

  // 12. Public Hearth feed
  console.log('Creating hearth feed entries...');
  await prisma.heartheEvent.create({
    data: {
      type: HearthEventType.LISTING_CREATED,
      message: '✨ Marigold Lightweaver listed a stunning new Glowing Oak Sconce.',
      metadata: { productId: products[0].id },
      expiresAt: new Date('2026-07-14')
    }
  });

  console.log('🌱 Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
