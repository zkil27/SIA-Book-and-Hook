/**
 * The Hook & Box catalog definition: one source for the seed (prisma/seed.ts)
 * and for the storefront's offline fallback (lib/catalog.ts).
 *
 * Prices are in PESOS here for readability; the seed converts to centavos.
 * `opening` is opening stock written as a ledger movement, never a stored count.
 * Images are static files in /public/products (credits: docs/design/photo-credits.md).
 */

export type Dish = "sinigang" | "inihaw" | "ginataan" | "kilawin" | "paksiw" | "fried";

export const DISHES: { id: Dish; label: string }[] = [
  { id: "sinigang", label: "Sinigang" },
  { id: "inihaw", label: "Inihaw" },
  { id: "fried", label: "Fried" },
  { id: "ginataan", label: "Ginataan" },
  { id: "paksiw", label: "Paksiw" },
  { id: "kilawin", label: "Kilawin" },
];

export type VariantSeed = { name: string; sku: string; price: number; opening: number };
export type ProductSeed = {
  name: string;
  description: string;
  image: string;
  dishes: Dish[];
  variants: VariantSeed[];
};
export type CategorySeed = { name: string; slug: string; products: ProductSeed[] };

export const CATALOG: CategorySeed[] = [
  {
    name: "Fish",
    slug: "fish",
    products: [
      { name: "Bangus (Milkfish)", description: "Whole milkfish from the morning catch. Scaled and gutted free.", image: "/products/bangus.jpg", dishes: ["sinigang", "inihaw", "paksiw", "fried"], variants: [
        { name: "Whole 1kg", sku: "FISH-BANGUS-W1", price: 180, opening: 42 },
        { name: "Boneless 500g", sku: "FISH-BANGUS-BL500", price: 130, opening: 30 },
      ]},
      { name: "Tilapia", description: "Freshwater tilapia, cleaned on request.", image: "/products/tilapia.jpg", dishes: ["fried", "inihaw", "paksiw"], variants: [
        { name: "Whole 1kg", sku: "FISH-TILAPIA-W1", price: 150, opening: 60 },
      ]},
      { name: "Galunggong (Round Scad)", description: "The everyday round scad, best fried crisp.", image: "/products/galunggong.jpg", dishes: ["fried", "paksiw"], variants: [
        { name: "1kg", sku: "FISH-GG-1", price: 200, opening: 35 },
      ]},
      { name: "Tamban (Sardines)", description: "Small fresh sardines, great for paksiw.", image: "/products/tamban.jpg", dishes: ["paksiw", "fried"], variants: [
        { name: "1kg", sku: "FISH-TAMBAN-1", price: 120, opening: 28 },
      ]},
      { name: "Tulingan (Mackerel Tuna)", description: "Firm-fleshed mackerel tuna for slow-cooked dishes.", image: "/products/tulingan.jpg", dishes: ["paksiw", "ginataan"], variants: [
        { name: "Whole 1kg", sku: "FISH-TULINGAN-W1", price: 220, opening: 18 },
      ]},
      { name: "Maya-Maya (Red Snapper)", description: "Premium red snapper, whole or filleted.", image: "/products/maya-maya.jpg", dishes: ["sinigang", "inihaw", "fried"], variants: [
        { name: "Whole 1kg", sku: "FISH-SNAPPER-W1", price: 480, opening: 12 },
        { name: "Fillet 500g", sku: "FISH-SNAPPER-F500", price: 320, opening: 8 },
      ]},
      { name: "Lapu-Lapu (Grouper)", description: "Prized grouper, ideal for steaming or sweet-and-sour.", image: "/products/lapu-lapu.jpg", dishes: ["sinigang", "fried"], variants: [
        { name: "Whole 1kg", sku: "FISH-GROUPER-W1", price: 550, opening: 9 },
      ]},
      { name: "Dilis (Anchovies)", description: "Tiny anchovies for frying or kinilaw.", image: "/products/dilis.jpg", dishes: ["fried", "kilawin"], variants: [
        { name: "500g", sku: "FISH-DILIS-500", price: 140, opening: 24 },
      ]},
      { name: "Salmon Belly", description: "Rich salmon belly strips.", image: "/products/salmon-belly.jpg", dishes: ["sinigang", "inihaw"], variants: [
        { name: "500g", sku: "FISH-SALMON-B500", price: 380, opening: 15 },
      ]},
      { name: "Tanigue (Spanish Mackerel)", description: "Steak-cut Spanish mackerel, the kinilaw favorite.", image: "/products/tanigue.jpg", dishes: ["kilawin", "fried", "inihaw"], variants: [
        { name: "Steak 1kg", sku: "FISH-TANIGUE-S1", price: 600, opening: 7 },
      ]},
    ],
  },
  {
    name: "Shellfish",
    slug: "shellfish",
    products: [
      { name: "Hipon (Suahe Shrimp)", description: "Sweet suahe shrimp, sold by weight.", image: "/products/hipon.jpg", dishes: ["sinigang", "ginataan", "fried"], variants: [
        { name: "1kg", sku: "SHELL-HIPON-1", price: 350, opening: 18 },
        { name: "500g", sku: "SHELL-HIPON-500", price: 185, opening: 20 },
      ]},
      { name: "Tahong (Mussels)", description: "Green mussels, cleaned and debearded.", image: "/products/tahong.jpg", dishes: ["ginataan"], variants: [
        { name: "500g", sku: "SHELL-TAHONG-500", price: 120, opening: 4 },
        { name: "1kg", sku: "SHELL-TAHONG-1", price: 220, opening: 6 },
      ]},
      { name: "Talaba (Oysters)", description: "Fresh oysters by the dozen.", image: "/products/talaba.jpg", dishes: ["kilawin", "inihaw"], variants: [
        { name: "Dozen", sku: "SHELL-TALABA-DOZ", price: 200, opening: 0 },
      ]},
      { name: "Halaan (Clams)", description: "Small clams for tinola and soup.", image: "/products/halaan.jpg", dishes: ["sinigang", "ginataan"], variants: [
        { name: "1kg", sku: "SHELL-HALAAN-1", price: 160, opening: 22 },
      ]},
      { name: "Scallops", description: "Half-shell scallops, ready for the grill.", image: "/products/scallops.jpg", dishes: ["inihaw"], variants: [
        { name: "500g", sku: "SHELL-SCALLOP-500", price: 300, opening: 10 },
      ]},
      { name: "Sugpo (Tiger Prawn)", description: "Large tiger prawns.", image: "/products/sugpo.jpg", dishes: ["inihaw", "ginataan", "sinigang"], variants: [
        { name: "1kg", sku: "SHELL-SUGPO-1", price: 750, opening: 8 },
        { name: "500g", sku: "SHELL-SUGPO-500", price: 390, opening: 9 },
      ]},
      { name: "Curacha (Spanner Crab)", description: "Sweet spanner crab.", image: "/products/curacha.jpg", dishes: ["ginataan"], variants: [
        { name: "1kg", sku: "SHELL-CURACHA-1", price: 520, opening: 5 },
      ]},
    ],
  },
  {
    name: "Crab",
    slug: "crab",
    products: [
      { name: "Alimasag (Blue Crab)", description: "Meaty blue swimming crab.", image: "/products/alimasag.jpg", dishes: ["ginataan", "sinigang"], variants: [
        { name: "1kg", sku: "CRAB-ALIMASAG-1", price: 420, opening: 9 },
      ]},
      { name: "Alimango (Mud Crab)", description: "Large mud crab, sold live.", image: "/products/alimango.jpg", dishes: ["ginataan"], variants: [
        { name: "1kg", sku: "CRAB-ALIMANGO-1", price: 650, opening: 12 },
        { name: "Jumbo 1.5kg", sku: "CRAB-ALIMANGO-J15", price: 980, opening: 4 },
      ]},
      { name: "Talangka (River Crab)", description: "Tiny river crabs for taba ng talangka.", image: "/products/talangka.jpg", dishes: ["fried"], variants: [
        { name: "500g", sku: "CRAB-TALANGKA-500", price: 260, opening: 14 },
      ]},
    ],
  },
  {
    name: "Squid",
    slug: "squid",
    products: [
      { name: "Pusit (Squid)", description: "Fresh squid, cleaned on request.", image: "/products/pusit.jpg", dishes: ["inihaw", "fried", "paksiw"], variants: [
        { name: "1kg", sku: "SQUID-PUSIT-1", price: 280, opening: 25 },
        { name: "500g", sku: "SQUID-PUSIT-500", price: 150, opening: 18 },
      ]},
      { name: "Pusit Bisaya (Baby Squid)", description: "Small, tender baby squid.", image: "/products/pusit-bisaya.jpg", dishes: ["fried", "paksiw"], variants: [
        { name: "500g", sku: "SQUID-BISAYA-500", price: 190, opening: 11 },
      ]},
      { name: "Pugita (Octopus)", description: "Whole octopus, great for grilling.", image: "/products/pugita.jpg", dishes: ["inihaw", "kilawin"], variants: [
        { name: "1kg", sku: "SQUID-PUGITA-1", price: 420, opening: 6 },
      ]},
    ],
  },
  {
    name: "Prepared",
    slug: "prepared",
    products: [
      { name: "Daing na Bangus (Marinated)", description: "Butterflied milkfish in vinegar and garlic, ready to fry.", image: "/products/daing.jpg", dishes: ["fried"], variants: [
        { name: "Pack (2 pcs)", sku: "PREP-DAING-2", price: 210, opening: 20 },
      ]},
      { name: "Tinapa (Smoked Fish)", description: "Traditional smoked fish.", image: "/products/tinapa.jpg", dishes: ["fried"], variants: [
        { name: "Pack (5 pcs)", sku: "PREP-TINAPA-5", price: 180, opening: 16 },
      ]},
      { name: "Bangus Sisig", description: "Ready-to-cook milkfish sisig for the sizzling plate.", image: "/products/sisig.jpg", dishes: ["fried"], variants: [
        { name: "Tub 500g", sku: "PREP-SISIG-500", price: 250, opening: 12 },
      ]},
      { name: "Fish Tocino", description: "Sweet-cured fish tocino.", image: "/products/tocino.jpg", dishes: ["fried"], variants: [
        { name: "Pack 500g", sku: "PREP-TOCINO-500", price: 190, opening: 14 },
      ]},
    ],
  },
];

/** Image for a product name, used when a DB row predates `imageUrl`. */
export function imageForName(name: string): string | null {
  for (const cat of CATALOG) {
    for (const p of cat.products) {
      if (p.name === name) return p.image;
    }
  }
  return null;
}

/** Dishes for a product name (dish tags are catalog metadata, not a DB column). */
export function dishesForName(name: string): Dish[] {
  for (const cat of CATALOG) {
    for (const p of cat.products) {
      if (p.name === name) return p.dishes;
    }
  }
  return [];
}

/** All static product images available to pick from in the admin editor. */
export const PRODUCT_IMAGES: string[] = Array.from(
  new Set(CATALOG.flatMap(c => c.products.map(p => p.image)))
).sort();
