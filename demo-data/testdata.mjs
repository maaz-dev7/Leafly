// Creates a demo customer, tracked care plants, two COD orders and a booking,
// through the app's own public API. Run AFTER seed.mjs.
// Usage:
//   BASE_URL=https://your-app.vercel.app ADMIN_USERNAME=admin ADMIN_PASSWORD=... \
//   TEST_EMAIL=ayesha.khan@leafly-demo.test TEST_PASSWORD='DemoPass!2026' node demo-data/testdata.mjs
const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const EMAIL = process.env.TEST_EMAIL || "ayesha.khan@leafly-demo.test";
const PASSWORD = process.env.TEST_PASSWORD || "DemoPass!2026";

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

let userToken;
try {
  userToken = (await api("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name: "Ayesha Khan", email: EMAIL, password: PASSWORD, city: "Lahore" }),
  })).token;
  console.log("created customer Ayesha Khan");
} catch (e) {
  if (!String(e.message).includes("409")) throw e;
  userToken = (await api("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) })).token;
  console.log("customer already existed - logged in");
}

const adminToken = (await api("/admin/login", {
  method: "POST",
  body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
})).token;

const plants = await api("/plants");
const byName = (n) => plants.find((p) => p.name.toLowerCase().includes(n.toLowerCase()));

const mine = await api("/care/my-plants", {}, userToken);
if (mine.length === 0) {
  const picks = [
    { p: byName("Money Plant"), freq: 7 },
    { p: byName("Snake Plant"), freq: 14 },
    { p: byName("Peace Lily"), freq: 5 },
  ].filter((x) => x.p);
  const created = [];
  for (const { p, freq } of picks) {
    created.push(await api("/care/my-plants", { method: "POST", body: JSON.stringify({ plantId: p.id, wateringFrequencyDays: freq }) }, userToken));
  }
  if (created[0]) {
    await api(`/care/my-plants/${created[0].id}/water`, { method: "PATCH" }, userToken);
    await api(`/care/my-plants/${created[0].id}/fertilize`, { method: "PATCH" }, userToken);
  }
  console.log(`added ${created.length} plants to the care dashboard`);
} else {
  console.log(`care dashboard already has ${mine.length} plants - skipping`);
}

const existingOrders = await api("/orders", {}, userToken);
if (existingOrders.length === 0) {
  const pot = (await api("/addons")).find((a) => a.type === "pot");
  const mk = (items) => ({
    customerName: "Ayesha Khan",
    customerPhone: "0300 1234567",
    city: "Lahore",
    address: "House 24, Street 7, Model Town, Lahore",
    paymentMethod: "cod",
    items,
  });
  // NOTE: the item field is `plantName` (not `name`) - the response schema requires it.
  const o1 = await api("/orders", { method: "POST", body: JSON.stringify(mk([
    { plantId: byName("Money Plant")?.id, plantName: "Money Plant", price: byName("Money Plant")?.price ?? 650, quantity: 2, addons: pot ? [{ name: pot.name, price: pot.price }] : [] },
    { plantId: byName("Snake Plant")?.id, plantName: "Snake Plant", price: byName("Snake Plant")?.price ?? 1200, quantity: 1, addons: [] },
  ])) }, userToken);
  const o2 = await api("/orders", { method: "POST", body: JSON.stringify(mk([
    { plantId: byName("Areca Palm")?.id, plantName: "Areca Palm", price: byName("Areca Palm")?.price ?? 2800, quantity: 1, addons: [] },
  ])) }, userToken);
  await api(`/orders/${o1.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "Out for Delivery" }) }, adminToken);
  await api(`/orders/${o2.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "Packed" }) }, adminToken);
  console.log(`placed 2 COD orders (#${o1.id} out for delivery, #${o2.id} packed)`);
} else {
  console.log(`customer already has ${existingOrders.length} orders - skipping`);
}

const bookings = await api("/bookings", {}, adminToken);
if (!Array.isArray(bookings) || bookings.length === 0) {
  await api("/bookings", { method: "POST", body: JSON.stringify({
    name: "Ayesha Khan", phone: "0300 1234567", city: "Lahore",
    address: "House 24, Street 7, Model Town, Lahore",
    serviceType: "gardener", preferredDate: "2026-12-05",
    paymentMethod: "cod", notes: "Monthly terrace maintenance and repotting.",
  }) }, userToken);
  console.log("created 1 Hire-a-Pro booking");
} else {
  console.log(`already has ${bookings.length} bookings - skipping`);
}
console.log("TEST DATA DONE");
