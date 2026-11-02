import type {
  District,
  CraftDefinition,
  CraftCategory,
  AssociationType,
  OfficialSourceStatus,
  Product,
} from '@craftsure/shared-types';

export interface CraftDistrictAssoc {
  readonly craftSlug: string;
  readonly districtSlug: string;
  readonly associationType: AssociationType;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly sourceTitle: string;
  readonly sourceUrl: string;
  readonly retrievalDate: string;
  readonly sourceCitation: string;
  readonly sourceDocumentUrl: string | null;
  readonly isOdopRecognized: boolean;
}

export const DISTRICTS: District[] = [
  {
    id: 'dist-lucknow',
    slug: 'lucknow',
    name: 'Lucknow',
    division: 'Lucknow Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'The capital city of Uttar Pradesh, historically renowned for fine Nawabi culture and delicate hand embroidery techniques like Chikankari and Zari-Zardozi.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Chikankari', 'Zari-Zardozi'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-varanasi',
    slug: 'varanasi',
    name: 'Varanasi',
    division: 'Varanasi Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'One of the oldest living cities in the world, renowned for Banarasi silk brocades, delicate Gulabi Meenakari pink enameling, and vibrant wooden lacquerware.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Banarasi Silk & Brocade', 'Gulabi Meenakari', 'Wooden Lacquerware & Toys'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-bhadohi',
    slug: 'bhadohi',
    name: 'Bhadohi',
    division: 'Varanasi Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Known as the "Carpet City of India", Bhadohi houses one of South Asia\'s largest hand-knotted carpet and durrie weaving artisan clusters.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Hand-knotted Carpets & Durries'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-mirzapur',
    slug: 'mirzapur',
    name: 'Mirzapur',
    division: 'Mirzapur Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Famed for centuries of hand-made wool pile carpets and historical brassware utensil casting and hand-engraving.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Hand-made Carpets', 'Brassware & Metal Craft'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-moradabad',
    slug: 'moradabad',
    name: 'Moradabad',
    division: 'Moradabad Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Globally celebrated as the "Peetal Nagri" (Brass City), specializing in sand-casting, engraving, repoussé, and fine metal polishing.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Metal Craft / Brassware'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-saharanpur',
    slug: 'saharanpur',
    name: 'Saharanpur',
    division: 'Saharanpur Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Renowned hub for intricately carved wooden furniture, screens, and handicrafts fashioned primarily from Sheesham and mango wood.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Wood Carving & Wooden Handicrafts'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-gorakhpur',
    slug: 'gorakhpur',
    name: 'Gorakhpur',
    division: 'Gorakhpur Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Famous for centuries-old terracotta pottery and sculptural craft made with natural red alluvial clay from local riverbeds, hand-crafted without molds.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Terracotta Craft'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-azamgarh',
    slug: 'azamgarh',
    name: 'Azamgarh',
    division: 'Azamgarh Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Home to the unique GI-tagged Nizamabad Black Pottery, recognized for its lustrous dark smoky sheen and silver-colored zinc-mercury inlays.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Black Clay Pottery (Nizamabad)'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-firozabad',
    slug: 'firozabad',
    name: 'Firozabad',
    division: 'Agra Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'India\'s "City of Glass", world-renowned for mouth-blown and hand-pressed glassware, chandeliers, decorative artware, and traditional glass bangles.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Glassware & Glass Art'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-mainpuri',
    slug: 'mainpuri',
    name: 'Mainpuri',
    division: 'Agra Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Historic centre of Tarkashi art—fine brass and copper wire inlay meticulously hammered into seasoned Sheesham wood in geometric and floral patterns.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Tarkashi Art (Brass Wire Inlay on Wood)'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-bareilly',
    slug: 'bareilly',
    name: 'Bareilly',
    division: 'Bareilly Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Prominent handicraft cluster famed for intricate Zari-Zardozi metallic thread embroidery on silk and velvet, as well as cane and bamboo craft.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Zari-Zardozi', 'Bamboo & Cane Products'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-pilibhit',
    slug: 'pilibhit',
    name: 'Pilibhit',
    division: 'Bareilly Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'India\'s principal manufacturing centre for handcrafted bamboo and wooden flutes (Bansuri), tuned by master acoustic craftspeople.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Flutes (Bansuri) & Wooden Handicrafts'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-amroha',
    slug: 'amroha',
    name: 'Amroha',
    division: 'Moradabad Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Famous for handcrafted Dholaks and classical percussion instruments, turned from solid mango and Sheesham wood and fitted with animal hide membranes.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Dholak & Musical Instruments'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-prayagraj',
    slug: 'prayagraj',
    name: 'Prayagraj',
    division: 'Prayagraj Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Famed for eco-friendly Moonj grass handicraft, where wild riverine reeds are dried, dyed, and coiled into baskets, mats, and decorative containers.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Moonj Grass Products'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-rampur',
    slug: 'rampur',
    name: 'Rampur',
    division: 'Moradabad Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Renowned for Courtly Appliqué and Patchwork textile craft, featuring geometric fabric cut-outs hand-stitched onto muslin and voile bedcovers and curtains.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Applique and Patchwork'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-bahraich',
    slug: 'bahraich',
    name: 'Bahraich',
    division: 'Devipatan Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Unique rural artisanal tradition utilizing natural wheat straw/stalk to create intricate golden decorative wall hangings, portraits, and temple art.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Wheat-Stalk Handicrafts'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-banda',
    slug: 'banda',
    name: 'Banda',
    division: 'Chitrakoot Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Bundelkhand district world-famed for Shazar Stone craft—a rare agate found in the Ken River containing natural dendrite fossil-like foliage patterns, cut and polished into jewelry.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Shazar Stone Craft'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-chitrakoot',
    slug: 'chitrakoot',
    name: 'Chitrakoot',
    division: 'Chitrakoot Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Spiritual heartland known for handcrafted wooden toys, figures, and lacquer miniatures carved from soft local wood (Dudhi) and painted with non-toxic colors.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Wooden Toys & Lacquerware'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-jalaun',
    slug: 'jalaun',
    name: 'Jalaun',
    division: 'Jhansi Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Home to Kalpi, one of India\'s oldest continuous handmade paper manufacturing centers since the Mughal era, creating textured paper from cotton rags and waste pulp.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Handmade Paper Art (Kalpi)'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'dist-ghazipur',
    slug: 'ghazipur',
    name: 'Ghazipur',
    division: 'Varanasi Division',
    state: 'Uttar Pradesh',
    heroImageUrl: null,
    overview:
      'Eastern UP district known for hand-knotted natural jute wall hangings, macramé screens, and woven jute decorative home furnishings.',
    odopPortalUrl: 'https://odopup.in/en/districts',
    odopFocalCrafts: ['Jute Wall Hangings & Handicrafts'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
];

export const CRAFTS: CraftDefinition[] = [
  {
    id: 'craft-lucknow-chikankari',
    slug: 'lucknow-chikankari',
    name: 'Lucknow Chikankari',
    category: 'textiles_handloom',
    giRegistered: true,
    giRegistrationNumber: 'GI-119',
    giRegistrationYear: 2008,
    description:
      'Delicate white-on-white and pastel needle embroidery executed on fine muslin, georgette, and cotton.',
    historicalContext:
      'Flourished under the Nawabs of Awadh in the 18th century, with Empress Noor Jahan celebrated as a key patron of this delicate floral shadow-work style.',
    standardTechniques: [
      'Bakhiya (Shadow work)',
      'Tepchi (Running stitch)',
      'Murri (Grain knot)',
      'Phanda (Millet knot)',
      'Jaali (Openwork net)',
      'Hool (Eyelet)',
    ],
    typicalMaterials: ['Mulmul Cotton', 'Voile', 'Chanderi Silk', 'Cotton Embroidery Floss'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-banarasi-silk',
    slug: 'banarasi-silk',
    name: 'Varanasi Banarasi Brocade & Silk',
    category: 'textiles_handloom',
    giRegistered: true,
    giRegistrationNumber: 'GI-99',
    giRegistrationYear: 2009,
    description:
      'Heavy and lustrous handloom silk sarees, dupattas, and fabrics featuring intricate floral and foliate motifs woven with metallic zari threads.',
    historicalContext:
      'Documented since ancient Buddhist literature and perfected under Mughal artisans who blended Persian motifs with indigenous silk weaving traditions.',
    standardTechniques: [
      'Kadwa (Interlocking extra-weft)',
      'Fekwa (Continuous brocade)',
      'Tanchoi (Satin-weave multi-colored weft)',
      'Jangla (Floral scroll allover pattern)',
    ],
    typicalMaterials: ['Pure Katan Silk', 'Kora Organza', 'Georgette Silk', 'Tested Metallic Zari'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-moradabad-brassware',
    slug: 'moradabad-brassware',
    name: 'Moradabad Metal Craft & Brassware',
    category: 'metal_glass',
    giRegistered: true,
    giRegistrationNumber: 'GI-497',
    giRegistrationYear: 2014,
    description:
      'Traditional sand-cast, engraved, repoussé, and enameled brass and copper artefacts, ranging from traditional ritual vessels to intricate decor.',
    historicalContext:
      'Dates back to the 16th century when brass craft flourished along the Ramganga river, earning the city the global epithet "Peetal Nagri".',
    standardTechniques: [
      'Sand Casting',
      'Naqqaashi (Fine chiseling and engraving)',
      'Repoussé (Relief embossing)',
      'Tinkering and Polishing',
    ],
    typicalMaterials: ['Brass (Copper-Zinc Alloy)', 'Copper', 'German Silver', 'Natural Lacquer'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-gorakhpur-terracotta',
    slug: 'gorakhpur-terracotta',
    name: 'Gorakhpur Terracotta',
    category: 'pottery_ceramics',
    giRegistered: true,
    giRegistrationNumber: 'GI-693',
    giRegistrationYear: 2020,
    description:
      'Centuries-old unglazed natural red earthen sculptures, ceremonial elephants, horses, and temple bells hand-modeled by traditional potter communities.',
    historicalContext:
      'Rooted in ancient ritual offerings; local Prajapati artisans in Bhathat and Aurangabad clusters model each piece entirely by hand without moulds.',
    standardTechniques: [
      'Hand Modeling without Molds',
      'Clay Filigree & Bell Attachment',
      'Open Pit Wood & Husk Firing',
    ],
    typicalMaterials: ['Natural Alluvial Bed Clay', 'Natural River Sand', 'Wood Ash'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-saharanpur-wood-carving',
    slug: 'saharanpur-wood-carving',
    name: 'Saharanpur Wood Carving',
    category: 'woodwork',
    giRegistered: true,
    giRegistrationNumber: 'GI-457',
    giRegistrationYear: 2021,
    description:
      'Intricately carved wooden screens, furniture, boxes, and wall panels characterized by deep relief floral patterns and delicate perforated jali cutwork.',
    historicalContext:
      'Began in the early 19th century when Kashmiri carvers migrated to the forested foothills of the Shivaliks, establishing a flourishing guild.',
    standardTechniques: [
      'Deep Relief Carving',
      'Perforated Lattice (Jali) Cutwork',
      'Brass Wire Inlay',
      'Beeswax Buffing',
    ],
    typicalMaterials: ['Indian Rosewood (Sheesham)', 'Mango Wood', 'Teak Wood', 'Natural Beeswax'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-nizamabad-black-pottery',
    slug: 'nizamabad-black-pottery',
    name: 'Nizamabad Black Pottery',
    category: 'pottery_ceramics',
    giRegistered: true,
    giRegistrationNumber: 'GI-389',
    giRegistrationYear: 2015,
    description:
      'Lustrous black earthenware decorated with engraved floral designs filled with bright silvery mercury-zinc powder alloy.',
    historicalContext:
      'Originated in Nizamabad, Azamgarh, during the reign of Aurangzeb when royal potters developed an innovative reduction-firing technique in enclosed kilns.',
    standardTechniques: [
      'Smoke Reduction Firing',
      'Mustard Oil Surface Rubbing',
      'Chiseling Fine Grooves',
      'Silver Inlay (Zinc-Mercury amalgamation)',
    ],
    typicalMaterials: ['Local Black Alluvial Clay', 'Mustard Oil', 'Zinc & Lead/Mercury Alloy'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-bhadohi-mirzapur-carpets',
    slug: 'bhadohi-mirzapur-carpets',
    name: 'Bhadohi-Mirzapur Hand-Knotted Carpets',
    category: 'textiles_handloom',
    giRegistered: true,
    giRegistrationNumber: 'GI-171',
    giRegistrationYear: 2010,
    description:
      'Fine hand-knotted wool and silk pile carpets and flat-woven dhurries characterized by high knot density and intricate Persian and Indian motifs.',
    historicalContext:
      'Carpet weaving in the Bhadohi-Mirzapur belt was seeded under Emperor Akbar and expanded over four centuries to become Asia\'s premier hand-knotted carpet cluster.',
    standardTechniques: [
      'Asymmetrical Persian Knots',
      'Hand Tufting & Shearing',
      'Warp/Weft Tensioning on Vertical Looms',
      'Herbal & Acid Dyeing',
    ],
    typicalMaterials: ['Bikaner Wool', 'New Zealand Wool', 'Mulberry Silk', 'Cotton Warp'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-varanasi-gulabi-meenakari',
    slug: 'varanasi-gulabi-meenakari',
    name: 'Varanasi Gulabi Meenakari',
    category: 'metal_glass',
    giRegistered: true,
    giRegistrationNumber: 'GI-542',
    giRegistrationYear: 2016,
    description:
      'Delicate pink and floral enamel art on silver and gold jewellery, miniatures, and figurines, distinct for its translucent pink hues.',
    historicalContext:
      'Introduced by Persian enamellers to Varanasi courts during the 17th century; unique for its soft pink (Gulabi) tint painted over a white enamel base.',
    standardTechniques: [
      'Engraving Fine Recesses (Khudaai)',
      'Glass Enamel Powder Application',
      'Kiln Firing at 800°C',
      'Agate Stone Polishing',
    ],
    typicalMaterials: ['Sterling Silver (92.5)', '22K Gold', 'Vitreous Enamel Glass Pigments'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-firozabad-glassware',
    slug: 'firozabad-glassware',
    name: 'Firozabad Glassware & Glass Art',
    category: 'metal_glass',
    giRegistered: true,
    giRegistrationNumber: 'GI-458',
    giRegistrationYear: 2014,
    description:
      'Mouth-blown, mold-blown, and hand-cut glass decorative items, lighting fixtures, chandeliers, and handcrafted colored bangles.',
    historicalContext:
      'Glassmaking has thrived in Firozabad for over two centuries; modern artisans continue generational mouth-blowing and decorative hand-engraving.',
    standardTechniques: [
      'Mouth Blowing (Phookna)',
      'Mold Pressing',
      'Diamond Wheel Engraving & Etching',
      'Gold Luster Painting',
    ],
    typicalMaterials: ['Silica Sand', 'Soda Ash', 'Metallic Oxide Colorants'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-mainpuri-tarkashi',
    slug: 'mainpuri-tarkashi',
    name: 'Mainpuri Tarkashi Art',
    category: 'woodwork',
    giRegistered: true,
    giRegistrationNumber: 'GI-688',
    giRegistrationYear: 2023,
    description:
      'Intricate brass and copper wire inlay hammered into chiseled grooves of seasoned dark Sheesham wood.',
    historicalContext:
      'A centuries-old craft of Mainpuri district originally patronized by royal houses for decorating palanquins, weaponry scabbards, and wooden sandals (Khadau).',
    standardTechniques: [
      'Pattern Drawing on Hardwood',
      'Fine Chisel Grooving (Khurai)',
      'Flattened Brass Wire Hammering',
      'Surface Planing & Sanding',
    ],
    typicalMaterials: ['Seasoned Sheesham Wood', 'Brass Wire', 'Copper Wire'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-banda-shazar-stone',
    slug: 'banda-shazar-stone',
    name: 'Banda Shazar Stone Craft',
    category: 'stone_inlay',
    giRegistered: true,
    giRegistrationNumber: 'GI-692',
    giRegistrationYear: 2023,
    description:
      'Semi-precious agate stone retrieved from the Ken River beds, cut and polished to reveal naturally embedded dendritic patterns resembling trees and landscapes.',
    historicalContext:
      'Discovered about 400 years ago in Bundelkhand; patronized by the Nawab of Banda and exported across the Arabian Sea.',
    standardTechniques: [
      'Raw Pebble Prospecting & Cleaving',
      'Precision Wheel Cutting (Charkhi)',
      'Multi-Stage Fine Lapping & Polishing',
    ],
    typicalMaterials: ['Natural Ken River Agate / Dendritic Quartz', 'Emery Powder'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
  {
    id: 'craft-kalpi-handmade-paper',
    slug: 'kalpi-handmade-paper',
    name: 'Kalpi Handmade Paper',
    category: 'natural_fibre',
    giRegistered: true,
    giRegistrationNumber: 'GI-695',
    giRegistrationYear: 2023,
    description:
      'Eco-friendly acid-free handmade paper made using traditional deckle frames from recycled cotton hosiery waste, banana fibre, and sunn hemp.',
    historicalContext:
      'Founded in the 16th century by Munshi Kagzi under Mughal ruler Akbar, making Kalpi one of the historic centres of document and ledger paper production in northern India.',
    standardTechniques: [
      'Cotton Rag Beating (Hollander Beater)',
      'Mesh Dipping & Deckle Sheet Lifting',
      'Sun Drying on Plaster Walls',
      'Agate Stone Hand Burnishing',
    ],
    typicalMaterials: ['100% Recycled Cotton Rags', 'Banana Fibre', 'Rice Husk', 'Natural Vegetable Dyes'],
    isActive: true,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  },
];

export const CRAFT_DISTRICT_LINKS: CraftDistrictAssoc[] = [
  {
    craftSlug: 'lucknow-chikankari',
    districtSlug: 'lucknow',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Lucknow District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 119 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'banarasi-silk',
    districtSlug: 'varanasi',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Varanasi District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 99 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'moradabad-brassware',
    districtSlug: 'moradabad',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Moradabad District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 497 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'gorakhpur-terracotta',
    districtSlug: 'gorakhpur',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Gorakhpur District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 693 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'saharanpur-wood-carving',
    districtSlug: 'saharanpur',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Saharanpur District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 457 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'nizamabad-black-pottery',
    districtSlug: 'azamgarh',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Azamgarh District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 389 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'bhadohi-mirzapur-carpets',
    districtSlug: 'bhadohi',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Bhadohi District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 171 Gazette Notification; UP ODOP Official Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'bhadohi-mirzapur-carpets',
    districtSlug: 'mirzapur',
    associationType: 'secondary_cluster',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Mirzapur District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 171 Gazette Notification (Combined Region)',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'varanasi-gulabi-meenakari',
    districtSlug: 'varanasi',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Varanasi District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 542 Gazette Notification',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'firozabad-glassware',
    districtSlug: 'firozabad',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Firozabad District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 458 Gazette Notification; UP ODOP Gazette',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'mainpuri-tarkashi',
    districtSlug: 'mainpuri',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Mainpuri District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 688 Gazette Notification; UP ODOP Gazette',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'banda-shazar-stone',
    districtSlug: 'banda',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Banda District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 692 Gazette Notification; UP ODOP Gazette',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
  {
    craftSlug: 'kalpi-handmade-paper',
    districtSlug: 'jalaun',
    associationType: 'primary_traditional_hub',
    officialSourceStatus: 'verified_official_source',
    sourceTitle: 'Uttar Pradesh ODOP Portal - Jalaun District',
    sourceUrl: 'https://odopup.in/en/districts',
    retrievalDate: '2026-11-02T00:00:00.000Z',
    sourceCitation: 'GI Application No. 695 Gazette Notification; UP ODOP Gazette',
    sourceDocumentUrl: 'https://search.ipindia.gov.in/GIRPublic/',
    isOdopRecognized: true,
  },
];

export const PRODUCTS: Product[] = [
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
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        altText: 'Fine white shadow work embroidery on soft mulmul cotton kurta',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'CraftSure Verified Co-op',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
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
        url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        altText: 'Deep crimson Banarasi silk saree with intricate golden zari motifs',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Kashi Bunkar Sahkari Samiti',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: '2026-11-01T11:00:00.000Z',
    updatedAt: '2026-11-01T11:00:00.000Z',
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
        url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        altText: 'Antique finish engraved brass urn with intricate floral scrollwork',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Peetal Kala Udyog',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
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
        url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
        altText: 'Natural red earthen terracotta elephant adorned with ornate clay bells',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Bhathat Mitti Kala Kendra',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: '2026-11-01T13:00:00.000Z',
    updatedAt: '2026-11-01T13:00:00.000Z',
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
        url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
        altText: 'Intricate floral lattice cutwork in polished dark Sheesham wood screen',
        isPrimary: true,
        displayOrder: 0,
        mediaRightsHolder: 'Sheesham Art Guild',
        licenseType: 'artisan_uploaded',
      },
    ],
    createdAt: '2026-11-01T14:00:00.000Z',
    updatedAt: '2026-11-01T14:00:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getDistrictBySlug(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
}

export function getCraftBySlug(slug: string): CraftDefinition | undefined {
  return CRAFTS.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getCraftsForDistrict(districtSlug: string) {
  const links = CRAFT_DISTRICT_LINKS.filter(
    (l) => l.districtSlug.toLowerCase() === districtSlug.toLowerCase(),
  );
  return links.map((link) => {
    const craft = CRAFTS.find((c) => c.slug === link.craftSlug);
    return {
      craft,
      link,
    };
  }).filter((item): item is { craft: CraftDefinition; link: CraftDistrictAssoc } => !!item.craft);
}

export function getDistrictsForCraft(craftSlug: string) {
  const links = CRAFT_DISTRICT_LINKS.filter(
    (l) => l.craftSlug.toLowerCase() === craftSlug.toLowerCase(),
  );
  return links.map((link) => {
    const district = DISTRICTS.find((d) => d.slug === link.districtSlug);
    return {
      district,
      link,
    };
  }).filter((item): item is { district: District; link: CraftDistrictAssoc } => !!item.district);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function filterProducts(options: {
  district?: string | undefined;
  category?: CraftCategory | undefined;
  craft?: string | undefined;
  giCertifiedOnly?: boolean | undefined;
  minPricePaise?: number | undefined;
  maxPricePaise?: number | undefined;
  sort?: string | undefined;
}): Product[] {
  let list = PRODUCTS.filter((p) => p.status === 'active');

  if (options.district) {
    const dLower = options.district.toLowerCase();
    list = list.filter(
      (p) =>
        p.originDistrict?.toLowerCase() === dLower ||
        p.districtId?.toLowerCase() === `dist-${dLower}`,
    );
  }

  if (options.category) {
    list = list.filter((p) => p.category === options.category);
  }

  if (options.craft) {
    const cLower = options.craft.toLowerCase();
    list = list.filter(
      (p) =>
        p.craftType.toLowerCase() === cLower ||
        p.craftDefinitionId?.toLowerCase().includes(cLower),
    );
  }

  if (options.giCertifiedOnly) {
    list = list.filter((p) => p.isGiCraftItem);
  }

  if (options.minPricePaise && options.minPricePaise > 0) {
    list = list.filter((p) => p.priceInPaise >= options.minPricePaise!);
  }

  if (options.maxPricePaise && options.maxPricePaise > 0) {
    list = list.filter((p) => p.priceInPaise <= options.maxPricePaise!);
  }

  if (options.sort === 'price_asc') {
    list = [...list].sort((a, b) => a.priceInPaise - b.priceInPaise);
  } else if (options.sort === 'price_desc') {
    list = [...list].sort((a, b) => b.priceInPaise - a.priceInPaise);
  } else {
    list = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return list;
}

