// Seeds a demo catalog through the app's own admin API.
// Usage:
//   BASE_URL=https://your-app.vercel.app ADMIN_USERNAME=admin ADMIN_PASSWORD=... node demo-data/seed.mjs
// Safe to re-run: skips anything already present.
const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

async function api(path, opts = {}, token) {
  const r = await fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) throw new Error(`${opts.method || "GET"} ${path} -> ${r.status}: ${typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const IMG = {
  Indoor: "/cat-indoor.png",
  Outdoor: "/cat-outdoor.png",
  Succulents: "/cat-succulents.jpg",
  Flowering: "/cat-flowering.png",
  "Air-Purifying": "/cat-air-purifying.png",
};

// climateTags match CITY_TAGS in artifacts/api-server/src/routes/plants.ts so the
// homepage "plants that thrive in your city" search returns results.
const PLANTS = [
  { name: "Money Plant", scientificName: "Epipremnum aureum", category: "Indoor", size: "Medium", price: 650, difficulty: "Easy", climateTags: ["shade-tolerant", "humidity-tolerant", "tropical"], description: "The most forgiving indoor vine in Pakistan. Trails happily from a shelf and tolerates low light, making it ideal for apartments and offices." },
  { name: "Snake Plant", scientificName: "Dracaena trifasciata", category: "Air-Purifying", size: "Medium", price: 1200, difficulty: "Easy", climateTags: ["drought-resistant", "heat-tolerant", "arid"], description: "Filters indoor air around the clock and survives weeks without water. A reliable first plant for Lahore and Multan homes." },
  { name: "Peace Lily", scientificName: "Spathiphyllum wallisii", category: "Air-Purifying", size: "Medium", price: 1450, difficulty: "Medium", climateTags: ["shade-tolerant", "humidity-tolerant", "tropical"], description: "Glossy leaves and white blooms. Tells you when it is thirsty by drooping, then recovers within hours of watering." },
  { name: "Areca Palm", scientificName: "Dypsis lutescens", category: "Indoor", size: "Large", price: 2800, difficulty: "Medium", climateTags: ["tropical", "humidity-tolerant", "coastal"], description: "A feathery floor palm that thrives in Karachi's humidity and brings a soft, tropical feel to living rooms." },
  { name: "Rubber Plant", scientificName: "Ficus elastica", category: "Indoor", size: "Large", price: 1850, difficulty: "Easy", climateTags: ["heat-tolerant", "shade-tolerant"], description: "Thick burgundy-green leaves on an upright trunk. Grows into a statement plant with very little intervention." },
  { name: "Jade Plant", scientificName: "Crassula ovata", category: "Succulents", size: "Small", price: 550, difficulty: "Easy", climateTags: ["drought-resistant", "xerophytic", "arid"], description: "A slow-growing succulent shrub considered lucky across South Asia. Needs sun and almost no watering." },
  { name: "Aloe Vera", scientificName: "Aloe barbadensis miller", category: "Succulents", size: "Small", price: 450, difficulty: "Easy", climateTags: ["drought-resistant", "hot-dry", "arid", "xerophytic"], description: "Medicinal gel in every leaf. Handles Multan and Peshawar summers on a sunny windowsill with monthly watering." },
  { name: "Echeveria Elegans", scientificName: "Echeveria elegans", category: "Succulents", size: "Small", price: 700, difficulty: "Medium", climateTags: ["xerophytic", "drought-resistant", "hot-dry"], description: "A pale blue-green rosette that forms tight clusters. Perfect for small desk pots and bright balconies." },
  { name: "Desert Rose Adenium", scientificName: "Adenium obesum", category: "Flowering", size: "Medium", price: 2200, difficulty: "Medium", climateTags: ["heat-tolerant", "drought-resistant", "flowering", "arid"], description: "A swollen-stemmed bonsai-like succulent that flowers heavily in Pakistani heat. Available in several petal colours." },
  { name: "Bougainvillea", scientificName: "Bougainvillea glabra", category: "Outdoor", size: "Large", price: 900, difficulty: "Easy", climateTags: ["heat-tolerant", "drought-resistant", "flowering"], description: "The classic Pakistani boundary-wall climber. Blooms for months in full sun with almost no care." },
  { name: "Hibiscus", scientificName: "Hibiscus rosa-sinensis", category: "Flowering", size: "Medium", price: 1100, difficulty: "Medium", climateTags: ["flowering", "heat-tolerant", "coastal", "humidity-tolerant"], description: "Large dinner-plate flowers through the warm months. A favourite for Karachi courtyards and terraces." },
  { name: "Boston Fern", scientificName: "Nephrolepis exaltata", category: "Indoor", size: "Medium", price: 1350, difficulty: "Hard", climateTags: ["ferns", "shade-tolerant", "cool-climate", "humidity-tolerant"], description: "Lush arching fronds. Rewards consistent moisture and shade - best suited to Islamabad and Murree climates." },
  { name: "Lemon Tree", scientificName: "Citrus limon", category: "Outdoor", size: "Large", price: 3200, difficulty: "Medium", climateTags: ["heat-tolerant", "coastal", "flowering"], description: "Fragrant blossoms followed by real fruit. Grows well in a large terrace pot across most of Pakistan." },
  { name: "Ponytail Palm", scientificName: "Beaucarnea recurvata", category: "Outdoor", size: "Large", price: 4500, difficulty: "Easy", climateTags: ["drought-resistant", "arid", "xerophytic", "hot-dry"], description: "Stores water in a bulbous base, so it shrugs off missed watering. A sculptural, long-lived patio plant." },
];

const ADDONS = [
  { type: "pot",        name: 'Terracotta Pot 8"',        price: 450,  description: "Breathable clay, classic finish" },
  { type: "pot",        name: 'Ceramic White Planter 10"', price: 1200, description: "Glazed, with drainage hole" },
  { type: "pot",        name: 'Self-Watering Pot 9"',      price: 850,  description: "Holds a week of water" },
  { type: "pot",        name: "Hanging Macrame Planter",   price: 650,  description: 'Cotton rope, fits 6" pots' },
  { type: "fertilizer", name: "Organic Compost 2kg",       price: 350,  description: "Rich, locally composted" },
  { type: "fertilizer", name: "NPK Granular Fertiliser 1kg", price: 550, description: "Balanced 20-20-20 feed" },
  { type: "fertilizer", name: "Vermicompost 1kg",          price: 400,  description: "Worm castings, slow release" },
  { type: "tool",       name: "Pruning Shears",            price: 900,  description: "Stainless steel, bypass blade" },
  { type: "tool",       name: "Hand Trowel Set",           price: 750,  description: "Three-piece, wooden handles" },
  { type: "light",      name: "LED Grow Light 20W",        price: 2400, description: "Full spectrum, clip mount" },
];

// Colour variants are surfaced on the plant page for Adenium only.
const VARIANTS = [
  { color: "Red", price: 2200 },
  { color: "Pink", price: 2400 },
  { color: "White", price: 2600 },
  { color: "Double-Petal Red", price: 2900 },
];

const { token } = await api("/admin/login", {
  method: "POST",
  body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
});
console.log("admin login OK");

const existing = await api("/plants");
if (Array.isArray(existing) && existing.length > 0) {
  console.log(`catalog already has ${existing.length} plants - skipping plant seed`);
} else {
  for (const p of PLANTS) {
    await api("/admin/plants", { method: "POST", body: JSON.stringify({ ...p, imageUrl: IMG[p.category], images: [], isAvailable: true }) }, token);
  }
  console.log(`seeded ${PLANTS.length} plants`);
}

const existingAddons = await api("/addons");
if (Array.isArray(existingAddons) && existingAddons.length > 0) {
  console.log(`already has ${existingAddons.length} accessories - skipping`);
} else {
  for (const a of ADDONS) await api("/admin/addons", { method: "POST", body: JSON.stringify(a) }, token);
  console.log(`seeded ${ADDONS.length} accessories`);
}

const existingVariants = await api("/variants").catch(() => []);
if (Array.isArray(existingVariants) && existingVariants.length > 0) {
  console.log(`already has ${existingVariants.length} variants - skipping`);
} else {
  for (const v of VARIANTS) await api("/admin/variants", { method: "POST", body: JSON.stringify({ ...v, isAvailable: true }) }, token);
  console.log(`seeded ${VARIANTS.length} Adenium colour variants`);
}
console.log("SEED DONE");
