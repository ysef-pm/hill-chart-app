// MCC reference table grouped into ISO 18245 ranges for two-level classification.
//
// The code table lives in mcc-codes.data.js (see its header for provenance).

import codes from './mcc-codes.data.js';

export const ALL_CODES = codes;

export const GROUPS = [
  ['agriculture_contractors', 0, 2999,
    'Agricultural and veterinary services, landscaping, construction and trade contractors (plumbing, electrical, roofing, HVAC), publishing and printing'],
  ['transportation', 4000, 4799,
    'Moving people or goods: railroads, commuter transit, taxis and rideshare, buses, trucking, couriers, shipping, airlines, airports, tolls, travel agencies and tour operators'],
  ['telecom_utilities', 4800, 4999,
    'Telecommunications, phone and internet service, cable/satellite/streaming TV, computer network services, wire transfers and money orders, electric/gas/water utilities'],
  ['wholesale', 5000, 5199,
    'Wholesale distributors and B2B suppliers of durable and nondurable goods'],
  ['retail_general', 5200, 5499,
    'Home improvement and building materials, hardware, garden, online marketplaces, department and discount stores, grocery, supermarkets, convenience and specialty food stores'],
  ['automotive_retail', 5500, 5599,
    'Car, truck, motorcycle, boat and RV dealers, auto parts stores, gas stations, EV charging'],
  ['apparel', 5600, 5699,
    'Clothing, shoes, accessories and apparel stores'],
  ['home_electronics', 5700, 5799,
    'Furniture and home furnishings, appliances, consumer electronics, computer and software stores, music and record stores'],
  ['food_digital_goods', 5800, 5899,
    'Restaurants, fast food, bars, caterers, and digital goods (media, books, music, games, apps) sold for download or streaming'],
  ['misc_retail', 5900, 5999,
    'Drug stores and pharmacies, specialty retail (jewelry, books, sporting goods, toys, pets, florists, cosmetics), direct marketing, catalog and subscription merchants'],
  ['financial', 6000, 6999,
    'Banks, ATMs, quasi-cash, crypto and foreign exchange, stored value, securities brokers, insurance, real estate agents and property management'],
  ['lodging_personal_services', 7000, 7299,
    'Hotels, lodging, campgrounds, timeshares, laundry and dry cleaning, salons and spas, photo studios, dating, funeral and other personal services'],
  ['business_services', 7300, 7499,
    'Business services: advertising, credit reporting, software development, SaaS and data processing, consulting, staffing, security, equipment rental, other B2B services'],
  ['auto_and_repair_services', 7500, 7799,
    'Car rental, parking, auto repair and car washes, electronics and appliance repair, other repair shops'],
  ['entertainment', 7800, 7999,
    'Movies, theaters, concerts, sports clubs, gyms, golf, amusement parks, gaming, betting and lotteries, recreation'],
  ['professional_health_education', 8000, 8999,
    'Doctors, dentists, hospitals, labs and other health services, legal, accounting and architecture firms, schools, colleges and childcare, charities, membership and civic organizations'],
  ['government', 9000, 9999,
    'Government services: courts and fines, taxes, postage, government licensing and lotteries'],
].map(([key, low, high, description]) => ({ key, low, high, description }));

// group key -> { code: description }, empty groups dropped
export const CODES_BY_GROUP = (() => {
  const grouped = Object.fromEntries(GROUPS.map((g) => [g.key, {}]));
  for (const [code, description] of Object.entries(ALL_CODES)) {
    const n = Number(code);
    const group = GROUPS.find((g) => g.low <= n && n <= g.high);
    if (group) grouped[group.key][code] = description;
  }
  return Object.fromEntries(Object.entries(grouped).filter(([, codes]) => Object.keys(codes).length));
})();
