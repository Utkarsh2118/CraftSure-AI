import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  CraftCategory,
} from '@craftsure/shared-types';

export const productsRouter = Router();

// In-memory catalog of initial authentic demonstration products across UP districts
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-chikankari-kurta-01',
    artisanId: 'artisan-lucknow-01',
    artisanShopName: 'Awadh Heritage Crafts',
    craftDefinitionId: 'craft-lucknow-chikankari',
    districtId: 'dist-lucknow',
    title: 'Hand-embroidered Mulmul Chikankari Kurta',
    description:
      'Pure mulmul cotton kurta hand-embroidered with traditional Shadow Work (Bakhiya), Murri, and Jaali openwork by master artisans in Lucknow.',
    category: 'textiles_handloom',
    craftType: 'chikankari',
    techniques: ['Shadow Work (Bakhiya)', 'Murri', 'Jaali'],
    materials: ['Pure Mulmul Cotton', 'Cotton Thread'],
    fabric: 'Pure Mulmul Cotton',
    originCluster: 'Old Chowk Artisan Cluster',
    originDistrict: 'Lucknow',
    isGiCraftItem: true,
    sourceOrganization: 'UP State Handloom & Handicrafts Corp',
    licenseType: 'artisan_consented',
    attributionText: 'Crafted by Awadh Heritage Crafts Co-op',
    priceInPaise: 285000, // ₹2,850
    stockCount: 8,
    status: 'active',
    tags: ['chikankari', 'lucknow', 'handmade', 'cotton', 'summer'],
    images: [
      {
        id: 'img-chikan-01',
        productId: 'prod-chikankari-kurta-01',
        url: '/images/products/chikankari-kurta.jpg',
        altText: 'Fine white shadow work embroidery on soft mulmul cotton kurta',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'CraftSure Verified Co-op',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-banarasi-saree-01',
    artisanId: 'artisan-varanasi-01',
    artisanShopName: 'Kashi Bunkar Sahkari Samiti',
    craftDefinitionId: 'craft-banarasi-silk',
    districtId: 'dist-varanasi',
    title: 'Katan Silk Kadwa Weave Banarasi Saree',
    description:
      'Hand-loomed pure Katan silk saree woven with Kadwa floral jaal technique and tested pure metallic zari borders.',
    category: 'textiles_handloom',
    craftType: 'banarasi_silk',
    techniques: ['Kadwa Weaving', 'Kalga Zari Borders'],
    materials: ['Pure Katan Silk', 'Tested Metallic Zari'],
    fabric: 'Pure Katan Silk',
    originCluster: 'Madanpura Weavers Colony',
    originDistrict: 'Varanasi',
    isGiCraftItem: true,
    sourceOrganization: 'Banaras Bunkar Samiti',
    licenseType: 'artisan_consented',
    attributionText: 'Master Weaver Ramzan Ali',
    priceInPaise: 1850000, // ₹18,500
    stockCount: 3,
    status: 'active',
    tags: ['banarasi', 'silk', 'saree', 'zari', 'varanasi', 'wedding'],
    images: [
      {
        id: 'img-banarasi-01',
        productId: 'prod-banarasi-saree-01',
        url: '/images/products/banarasi-saree.jpg',
        altText: 'Deep crimson Banarasi silk saree with intricate golden zari motifs',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Kashi Bunkar Sahkari Samiti',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-moradabad-brass-vase-01',
    artisanId: 'artisan-moradabad-01',
    artisanShopName: 'Peetal Kala Udyog',
    craftDefinitionId: 'craft-moradabad-brassware',
    districtId: 'dist-moradabad',
    title: 'Hand-engraved Naqqaashi Brass Floral Urn',
    description:
      'Sand-cast solid brass decorative urn with intricate Naqqaashi hand-chasing and antique lacquer patina finish.',
    category: 'metal_glass',
    craftType: 'moradabad_brassware',
    techniques: ['Sand Casting', 'Naqqaashi (Hand Chasing)', 'Antique Patina'],
    materials: ['Solid Brass (Copper-Zinc Alloy)', 'Natural Lacquer'],
    originCluster: 'Prince Road Metal Craft Cluster',
    originDistrict: 'Moradabad',
    isGiCraftItem: true,
    sourceOrganization: 'Moradabad Handicrafts Exporters Association',
    licenseType: 'artisan_consented',
    attributionText: 'Peetal Kala Udyog Workshop',
    priceInPaise: 345000, // ₹3,450
    stockCount: 12,
    status: 'active',
    tags: ['brass', 'metalcraft', 'moradabad', 'urn', 'home-decor'],
    images: [
      {
        id: 'img-brass-01',
        productId: 'prod-moradabad-brass-vase-01',
        url: '/images/products/moradabad-brass-urn.jpg',
        altText: 'Antique finish engraved brass urn with intricate floral scrollwork',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Peetal Kala Udyog',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-gorakhpur-terracotta-elephant-01',
    artisanId: 'artisan-gorakhpur-01',
    artisanShopName: 'Bhathat Mitti Kala Kendra',
    craftDefinitionId: 'craft-gorakhpur-terracotta',
    districtId: 'dist-gorakhpur',
    title: 'Ceremonial Terracotta Elephant Statue',
    description:
      'Traditional hand-modeled natural clay ceremonial elephant figurine featuring delicate clay filigree bells and unglazed natural red terracotta finish.',
    category: 'pottery_ceramics',
    craftType: 'gorakhpur_terracotta',
    techniques: ['Hand Modeling without Mold', 'Clay Filigree Strips', 'Wood Firing'],
    materials: ['Natural Alluvial Clay', 'Wood Ash'],
    originCluster: 'Aurangabad Terracotta Cluster',
    originDistrict: 'Gorakhpur',
    isGiCraftItem: true,
    sourceOrganization: 'Gorakhpur Terracotta Vikas Samiti',
    licenseType: 'artisan_consented',
    attributionText: 'Master Potter Sugreev Prajapati',
    priceInPaise: 165000, // ₹1,650
    stockCount: 15,
    status: 'active',
    tags: ['terracotta', 'gorakhpur', 'clay', 'elephant', 'pottery', 'sculpture'],
    images: [
      {
        id: 'img-terracotta-01',
        productId: 'prod-gorakhpur-terracotta-elephant-01',
        url: '/images/products/terracotta-elephant.jpg',
        altText: 'Natural red earthen terracotta elephant adorned with ornate clay bells',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Bhathat Mitti Kala Kendra',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-saharanpur-wood-screen-01',
    artisanId: 'artisan-saharanpur-01',
    artisanShopName: 'Sheesham Art Guild',
    craftDefinitionId: 'craft-saharanpur-wood-carving',
    districtId: 'dist-saharanpur',
    title: 'Carved Sheesham Wood Jali Partition Screen',
    description:
      'Hand-carved 3-panel folding screen in solid Indian Rosewood (Sheesham) featuring geometric lattice jali work and beeswax polish.',
    category: 'woodwork',
    craftType: 'saharanpur_wood_carving',
    techniques: ['Lattice Cutwork (Jali)', 'Deep Floral Chiseling', 'Beeswax Buffing'],
    materials: ['Seasoned Indian Rosewood (Sheesham)', 'Beeswax Polish'],
    originCluster: 'Railway Road Woodcraft Cluster',
    originDistrict: 'Saharanpur',
    isGiCraftItem: true,
    sourceOrganization: 'Saharanpur Wood Carving Association',
    licenseType: 'artisan_consented',
    attributionText: 'Sheesham Art Guild Artisans',
    priceInPaise: 950000, // ₹9,500
    stockCount: 4,
    status: 'active',
    tags: ['woodwork', 'saharanpur', 'sheesham', 'jali', 'partition', 'furniture'],
    images: [
      {
        id: 'img-screen-01',
        productId: 'prod-saharanpur-wood-screen-01',
        url: '/images/products/saharanpur-screen.jpg',
        altText: 'Intricate floral lattice cutwork in polished dark Sheesham wood screen',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Sheesham Art Guild',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * GET /api/products
 * Multi-facet filtering by district, category, craft, technique, material, GI status, and price range.
 */
productsRouter.get('/', (req: Request, res: Response) => {
  const district = typeof req.query['district'] === 'string' ? req.query['district'] : undefined;
  const category = req.query['category'] as CraftCategory | undefined;
  const craft = typeof req.query['craft'] === 'string' ? req.query['craft'] : undefined;
  const giCertifiedOnly = req.query['giCertifiedOnly'] === 'true';
  const minPrice = parseInt(String(req.query['minPricePaise'] ?? '0'), 10) || 0;
  const maxPrice = parseInt(String(req.query['maxPricePaise'] ?? '0'), 10) || 0;
  const sort = req.query['sort'] as string | undefined;

  const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(String(req.query['pageSize'] ?? '20'), 10) || 20),
  );

  let items = DEMO_PRODUCTS.filter((p) => p.status === 'active');

  if (district) {
    items = items.filter(
      (p) =>
        p.originDistrict?.toLowerCase() === district.toLowerCase() ||
        p.districtId === `dist-${district.toLowerCase()}`,
    );
  }

  if (category) {
    items = items.filter((p) => p.category === category);
  }

  if (craft) {
    items = items.filter(
      (p) =>
        p.craftType.toLowerCase() === craft.toLowerCase() ||
        p.craftDefinitionId?.includes(craft.toLowerCase()),
    );
  }

  if (giCertifiedOnly) {
    items = items.filter((p) => p.isGiCraftItem);
  }

  if (minPrice > 0) {
    items = items.filter((p) => p.priceInPaise >= minPrice);
  }

  if (maxPrice > 0) {
    items = items.filter((p) => p.priceInPaise <= maxPrice);
  }

  // Sort
  if (sort === 'price_asc') {
    items.sort((a, b) => a.priceInPaise - b.priceInPaise);
  } else if (sort === 'price_desc') {
    items.sort((a, b) => b.priceInPaise - a.priceInPaise);
  } else {
    // Default 'latest'
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const responseBody: ApiResponse<PaginatedResponse<Product>> = {
    ok: true,
    data: {
      items: paginatedItems,
      total,
      page,
      pageSize,
      hasNextPage: startIndex + pageSize < total,
    },
  };

  res.json(responseBody);
});

/**
 * GET /api/products/:id
 * Retrieves product details with provenance, materials, techniques, and GI badge status.
 */
productsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = DEMO_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `Product with id "${id}" was not found.`,
      },
    };
    res.status(404).json(errorBody);
    return;
  }

  const responseBody: ApiResponse<Product> = {
    ok: true,
    data: product,
  };

  res.json(responseBody);
});
