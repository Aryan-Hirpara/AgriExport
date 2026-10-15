import pool from '../config/db.js';
import { syncAgmarknetPrices } from '../services/mandiSync.js';

export const ALL_STATES_MANDIS = [
  // GUJARAT (All initial markets restored & verified)
  { state: 'Gujarat', district: 'Mehsana', market: 'Unjha APMC', commodity: 'Jeera (Cumin)', variety: 'Selected Bold', grade: 'Export Grade', modal: 31800, min: 28500, max: 35000, trend: 'up', change: 4.2, arrivals: 520 },
  { state: 'Gujarat', district: 'Mehsana', market: 'Unjha APMC', commodity: 'Isabgol (Psyllium)', variety: 'Gujarat Isabgol-2', grade: 'Husk 99%', modal: 14800, min: 13200, max: 16500, trend: 'up', change: 1.8, arrivals: 95 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Rajkot APMC', commodity: 'Groundnut', variety: 'Bold 40/50', grade: 'Export Grade', modal: 6500, min: 5800, max: 7200, trend: 'up', change: 2.1, arrivals: 340 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Rajkot APMC', commodity: 'Sesame (Til)', variety: 'Natural White', grade: 'Grade 99/1', modal: 16200, min: 14500, max: 17800, trend: 'stable', change: 0.5, arrivals: 140 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Rajkot APMC', commodity: 'Durum Wheat', variety: 'Bhalia Durum', grade: 'Milling Grade 1', modal: 2400, min: 2200, max: 2700, trend: 'stable', change: 0.2, arrivals: 600 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Rajkot APMC', commodity: 'Cotton', variety: 'Shankar-6', grade: 'Staple 29mm+', modal: 6150, min: 5600, max: 6850, trend: 'stable', change: 0.5, arrivals: 540 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Gondal APMC', commodity: 'Garlic', variety: 'Export Sortex', grade: 'FAQ', modal: 11200, min: 8000, max: 14000, trend: 'up', change: 3.6, arrivals: 110 },
  { state: 'Gujarat', district: 'Rajkot', market: 'Gondal APMC', commodity: 'Groundnut', variety: 'Java 60/70', grade: 'Export A', modal: 6350, min: 5700, max: 7000, trend: 'up', change: 1.5, arrivals: 280 },
  { state: 'Gujarat', district: 'Banaskantha', market: 'Deesa APMC', commodity: 'Castor Seeds', variety: 'GCH-7', grade: 'Bold High Oil', modal: 11600, min: 10800, max: 12400, trend: 'down', change: -1.2, arrivals: 290 },
  { state: 'Gujarat', district: 'Banaskantha', market: 'Deesa APMC', commodity: 'Potato', variety: 'Kufri Pukhraj', grade: 'FAQ', modal: 1450, min: 1200, max: 1750, trend: 'stable', change: 0.8, arrivals: 650 },
  { state: 'Gujarat', district: 'Bhavnagar', market: 'Mahuva APMC', commodity: 'Red Onion', variety: 'Export 60mm+', grade: 'Grade A', modal: 2800, min: 1800, max: 3800, trend: 'up', change: 3.1, arrivals: 420 },
  { state: 'Gujarat', district: 'Bhavnagar', market: 'Mahuva APMC', commodity: 'White Onion', variety: 'Dehydrated Sort', grade: 'FAQ', modal: 3100, min: 2200, max: 4100, trend: 'up', change: 2.8, arrivals: 280 },
  { state: 'Gujarat', district: 'Surendranagar', market: 'Surendranagar APMC', commodity: 'Cotton', variety: 'Shankar-6', grade: 'Staple 29mm+', modal: 6100, min: 5500, max: 6800, trend: 'down', change: -0.8, arrivals: 820 },
  { state: 'Gujarat', district: 'Surendranagar', market: 'Surendranagar APMC', commodity: 'Pearl Millet', variety: 'GHB-719', grade: 'Bold Standard', modal: 2200, min: 2000, max: 2500, trend: 'stable', change: 0.4, arrivals: 250 },
  { state: 'Gujarat', district: 'Junagadh', market: 'Junagadh APMC', commodity: 'Kesar Mango', variety: 'GI Talala Kesar', grade: 'Export Grade A', modal: 18800, min: 16000, max: 22000, trend: 'up', change: 4.2, arrivals: 60 },
  { state: 'Gujarat', district: 'Anand', market: 'Anand APMC', commodity: 'Banana', variety: 'Grand Naine', grade: 'Grade A Export', modal: 2600, min: 1800, max: 3200, trend: 'up', change: 1.5, arrivals: 180 },
  { state: 'Gujarat', district: 'Surat', market: 'Surat APMC', commodity: 'Banana', variety: 'Cavendish', grade: 'Grade A', modal: 2750, min: 1900, max: 3400, trend: 'up', change: 1.8, arrivals: 310 },
  { state: 'Gujarat', district: 'Surat', market: 'Surat APMC', commodity: 'Tomato', variety: 'Hybrid Round', grade: 'Grade A', modal: 1800, min: 1400, max: 2300, trend: 'stable', change: 0.6, arrivals: 410 },
  { state: 'Gujarat', district: 'Ahmedabad', market: 'Ahmedabad APMC (Jamalpur)', commodity: 'Durum Wheat', variety: 'GW-496', grade: 'Grade 1', modal: 2450, min: 2150, max: 2750, trend: 'stable', change: 0.4, arrivals: 550 },
  { state: 'Gujarat', district: 'Amreli', market: 'Amreli APMC', commodity: 'Sesame (Til)', variety: 'Black Sesame', grade: 'Sortex 99/1', modal: 17400, min: 15200, max: 19000, trend: 'up', change: 2.9, arrivals: 90 },

  // MAHARASHTRA
  { state: 'Maharashtra', district: 'Thane', market: 'APMC Vashi (Navi Mumbai)', commodity: 'Onion', variety: 'Nasik Red', grade: 'Export Grade A', modal: 2950, min: 2100, max: 3800, trend: 'up', change: 2.4, arrivals: 1200 },
  { state: 'Maharashtra', district: 'Thane', market: 'APMC Vashi (Navi Mumbai)', commodity: 'Paddy(Basmati)', variety: 'Pusa 1121', grade: 'Super', modal: 3850, min: 3200, max: 4500, trend: 'up', change: 1.7, arrivals: 850 },
  { state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon APMC', commodity: 'Onion', variety: 'Pol Onion', grade: 'Big Export', modal: 2850, min: 1900, max: 3650, trend: 'up', change: 3.4, arrivals: 2100 },
  { state: 'Maharashtra', district: 'Pune', market: 'Pune APMC (Gultekdi)', commodity: 'Potato', variety: 'Jyoti', grade: 'FAQ', modal: 1550, min: 1250, max: 1900, trend: 'stable', change: 0.3, arrivals: 890 },
  { state: 'Maharashtra', district: 'Jalgaon', market: 'Jalgaon APMC', commodity: 'Banana', variety: 'Grand Naine', grade: 'Export Grade', modal: 2650, min: 1850, max: 3300, trend: 'up', change: 1.6, arrivals: 1450 },
  { state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC (Kalamna)', commodity: 'Soyabean', variety: 'JS-335', grade: 'FAQ', modal: 4850, min: 4200, max: 5400, trend: 'down', change: -1.1, arrivals: 620 },

  // PUNJAB
  { state: 'Punjab', district: 'Ludhiana', market: 'Khanna APMC', commodity: 'Durum Wheat', variety: 'PBW-725', grade: 'Grade 1', modal: 2425, min: 2275, max: 2600, trend: 'stable', change: 0.1, arrivals: 1800 },
  { state: 'Punjab', district: 'Ludhiana', market: 'Khanna APMC', commodity: 'Paddy(Basmati)', variety: '1509 Basmati', grade: 'FAQ', modal: 3650, min: 3100, max: 4100, trend: 'up', change: 2.2, arrivals: 2200 },
  { state: 'Punjab', district: 'Amritsar', market: 'Amritsar APMC (Bhagtanwala)', commodity: 'Paddy(Basmati)', variety: 'Traditional Basmati', grade: 'Export Grade', modal: 4200, min: 3600, max: 4800, trend: 'up', change: 3.5, arrivals: 1400 },
  { state: 'Punjab', district: 'Jalandhar', market: 'Jalandhar APMC', commodity: 'Potato', variety: 'Kufri Jyoti', grade: 'Grade A Seed', modal: 1600, min: 1300, max: 1950, trend: 'stable', change: 0.2, arrivals: 750 },
  { state: 'Punjab', district: 'Patiala', market: 'Patiala APMC', commodity: 'Mustard', variety: 'Pusa Bold', grade: 'FAQ', modal: 5650, min: 5100, max: 6200, trend: 'up', change: 1.4, arrivals: 380 },

  // HARYANA
  { state: 'Haryana', district: 'Karnal', market: 'Karnal APMC', commodity: 'Paddy(Basmati)', variety: 'Super Basmati', grade: 'Export Quality', modal: 4150, min: 3500, max: 4750, trend: 'up', change: 2.8, arrivals: 1600 },
  { state: 'Haryana', district: 'Sirsa', market: 'Sirsa APMC', commodity: 'Cotton', variety: 'Bt Cotton', grade: 'Medium Staple', modal: 6350, min: 5700, max: 6950, trend: 'down', change: -0.6, arrivals: 920 },
  { state: 'Haryana', district: 'Sirsa', market: 'Sirsa APMC', commodity: 'Mustard', variety: 'RH-30', grade: 'FAQ High Oil', modal: 5700, min: 5200, max: 6300, trend: 'up', change: 1.2, arrivals: 440 },
  { state: 'Haryana', district: 'Hisar', market: 'Hisar APMC', commodity: 'Durum Wheat', variety: 'HD-2967', grade: 'FAQ', modal: 2410, min: 2275, max: 2580, trend: 'stable', change: 0.1, arrivals: 1100 },

  // RAJASTHAN
  { state: 'Rajasthan', district: 'Kota', market: 'Kota APMC (Bhamashah Mandi)', commodity: 'Soyabean', variety: 'Yellow Soyabean', grade: 'FAQ', modal: 4750, min: 4100, max: 5300, trend: 'down', change: -0.9, arrivals: 870 },
  { state: 'Rajasthan', district: 'Kota', market: 'Kota APMC (Bhamashah Mandi)', commodity: 'Durum Wheat', variety: 'Lokwan', grade: 'Grade 1 Sharbati', modal: 2650, min: 2350, max: 2950, trend: 'up', change: 1.1, arrivals: 1300 },
  { state: 'Rajasthan', district: 'Bikaner', market: 'Bikaner APMC (Anaj Mandi)', commodity: 'Guar', variety: 'Guar Seed (Gum)', grade: 'Standard Fast Splitting', modal: 5450, min: 4800, max: 6100, trend: 'up', change: 3.2, arrivals: 490 },
  { state: 'Rajasthan', district: 'Bikaner', market: 'Bikaner APMC (Anaj Mandi)', commodity: 'Groundnut', variety: 'Bold 50/60', grade: 'FAQ', modal: 6300, min: 5600, max: 7000, trend: 'up', change: 1.8, arrivals: 410 },
  { state: 'Rajasthan', district: 'Jodhpur', market: 'Jodhpur APMC (Mandore)', commodity: 'Jeera (Cumin)', variety: 'Marwar Jeera', grade: 'Bold Machine Cleaned', modal: 31200, min: 27800, max: 34500, trend: 'up', change: 3.8, arrivals: 280 },
  { state: 'Rajasthan', district: 'Sri Ganganagar', market: 'Sri Ganganagar APMC', commodity: 'Mustard', variety: 'High Oil 42%', grade: 'Grade 1', modal: 5850, min: 5300, max: 6450, trend: 'up', change: 2.1, arrivals: 720 },

  // MADHYA PRADESH
  { state: 'Madhya Pradesh', district: 'Indore', market: 'Indore APMC (Choithram Mandi)', commodity: 'Soyabean', variety: 'JS-9560', grade: 'FAQ Cleaned', modal: 4800, min: 4200, max: 5350, trend: 'down', change: -0.8, arrivals: 1650 },
  { state: 'Madhya Pradesh', district: 'Indore', market: 'Indore APMC (Choithram Mandi)', commodity: 'Durum Wheat', variety: 'Sharbati High Protein', grade: 'Export Grade', modal: 3100, min: 2700, max: 3600, trend: 'up', change: 2.5, arrivals: 1200 },
  { state: 'Madhya Pradesh', district: 'Neemuch', market: 'Neemuch APMC', commodity: 'Garlic', variety: 'Ooty / Neemuch Bold', grade: 'Export Grade A', modal: 12400, min: 9500, max: 15500, trend: 'up', change: 4.8, arrivals: 580 },
  { state: 'Madhya Pradesh', district: 'Neemuch', market: 'Neemuch APMC', commodity: 'Isabgol (Psyllium)', variety: 'Psyllium Husk Feed', grade: 'Semi Husk 90%', modal: 14200, min: 12600, max: 15800, trend: 'up', change: 2.3, arrivals: 210 },
  { state: 'Madhya Pradesh', district: 'Mandsaur', market: 'Mandsaur APMC', commodity: 'Garlic', variety: 'Desi Rasi', grade: 'Sortex 45mm+', modal: 11900, min: 9200, max: 14800, trend: 'up', change: 3.9, arrivals: 620 },

  // DELHI (NCT)
  { state: 'Delhi', district: 'North Delhi', market: 'Azadpur APMC', commodity: 'Apple', variety: 'Kashmiri Delicious', grade: 'Grade A Export', modal: 9500, min: 7200, max: 12500, trend: 'up', change: 3.1, arrivals: 1650 },
  { state: 'Delhi', district: 'North Delhi', market: 'Azadpur APMC', commodity: 'Onion', variety: 'Nasik Red Medium', grade: 'FAQ', modal: 2900, min: 2100, max: 3750, trend: 'up', change: 2.6, arrivals: 2200 },
  { state: 'Delhi', district: 'North Delhi', market: 'Azadpur APMC', commodity: 'Potato', variety: 'Pukhraj Yellow', grade: 'Grade 1', modal: 1520, min: 1220, max: 1850, trend: 'stable', change: 0.5, arrivals: 1900 },
  { state: 'Delhi', district: 'East Delhi', market: 'Ghazipur APMC', commodity: 'Banana', variety: 'Robusta Green', grade: 'FAQ', modal: 2700, min: 1950, max: 3350, trend: 'up', change: 1.3, arrivals: 650 },

  // KARNATAKA
  { state: 'Karnataka', district: 'Bengaluru Urban', market: 'Yeshwanthpur APMC (Bengaluru)', commodity: 'Rice', variety: 'Sona Masoori Raw', grade: 'Super Cleaned', modal: 5200, min: 4500, max: 6000, trend: 'up', change: 1.8, arrivals: 1100 },
  { state: 'Karnataka', district: 'Bengaluru Urban', market: 'Yeshwanthpur APMC (Bengaluru)', commodity: 'Groundnut', variety: 'TMV-2 Kernel', grade: 'FAQ', modal: 6600, min: 5900, max: 7350, trend: 'stable', change: 0.6, arrivals: 420 },
  { state: 'Karnataka', district: 'Dharwad', market: 'Hubballi APMC (Amaragol)', commodity: 'Chili Red', variety: 'Byadagi Kaddi', grade: 'High Color ASTA 120+', modal: 21500, min: 17500, max: 26000, trend: 'up', change: 5.4, arrivals: 680 },
  { state: 'Karnataka', district: 'Haveri', market: 'Byadgi APMC', commodity: 'Chili Red', variety: 'Byadagi Dabbi', grade: 'Deep Red Wrinkled', modal: 24500, min: 19500, max: 29000, trend: 'up', change: 6.2, arrivals: 850 },

  // TAMIL NADU
  { state: 'Tamil Nadu', district: 'Chennai', market: 'Koyambedu APMC (Chennai)', commodity: 'Banana', variety: 'Poovan / Cavendish', grade: 'Grade A', modal: 2850, min: 2100, max: 3600, trend: 'up', change: 1.5, arrivals: 920 },
  { state: 'Tamil Nadu', district: 'Erode', market: 'Erode APMC (Perundurai)', commodity: 'Turmeric', variety: 'Erode Finger Turmeric', grade: 'GI Certified High Curcumin', modal: 14200, min: 11800, max: 16800, trend: 'up', change: 4.8, arrivals: 650 },
  { state: 'Tamil Nadu', district: 'Madurai', market: 'Madurai APMC (Mattuthavani)', commodity: 'Rice', variety: 'Ponni Boiled', grade: 'Export Sortex', modal: 4900, min: 4200, max: 5600, trend: 'up', change: 1.2, arrivals: 580 },

  // ANDHRA PRADESH
  { state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur APMC (Mirchi Yard)', commodity: 'Chili Red', variety: 'Teja S17 Stemless', grade: 'Export Grade High Pungency', modal: 19800, min: 16500, max: 23500, trend: 'up', change: 5.1, arrivals: 1850 },
  { state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur APMC (Mirchi Yard)', commodity: 'Cotton', variety: 'MCU-5', grade: 'Long Staple 31mm', modal: 6700, min: 6000, max: 7400, trend: 'stable', change: 0.3, arrivals: 920 },

  // TELANGANA
  { state: 'Telangana', district: 'Warangal Urban', market: 'Warangal APMC (Enumamula)', commodity: 'Cotton', variety: 'Cotton Super Fine', grade: 'Grade A', modal: 6650, min: 5950, max: 7350, trend: 'stable', change: 0.2, arrivals: 1250 },
  { state: 'Telangana', district: 'Nizamabad', market: 'Nizamabad APMC', commodity: 'Turmeric', variety: 'Nizamabad Finger', grade: 'Polished Yellow', modal: 13800, min: 11200, max: 16200, trend: 'up', change: 3.7, arrivals: 580 },

  // WEST BENGAL
  { state: 'West Bengal', district: 'Darjeeling', market: 'Siliguri APMC (Regulated Market)', commodity: 'Tea', variety: 'Darjeeling Autumn Flush', grade: 'FTGFOP1 Orthodox', modal: 38500, min: 25000, max: 55000, trend: 'up', change: 5.2, arrivals: 180 },
  { state: 'West Bengal', district: 'Kolkata', market: 'Kolkata APMC (Posta Bazar)', commodity: 'Rice', variety: 'Gobindobhog Aromatic', grade: 'GI Certified Fragrant', modal: 7200, min: 6100, max: 8400, trend: 'up', change: 2.1, arrivals: 440 },

  // BIHAR
  { state: 'Bihar', district: 'Purnia', market: 'Gulabbagh APMC', commodity: 'Maize', variety: 'Purnia Yellow Corn', grade: 'Export Moisture <14%', modal: 2450, min: 2200, max: 2700, trend: 'up', change: 1.7, arrivals: 2400 },
  { state: 'Bihar', district: 'Patna', market: 'Patna APMC (Mithapur)', commodity: 'Durum Wheat', variety: 'HD-2733', grade: 'FAQ', modal: 2420, min: 2240, max: 2600, trend: 'stable', change: 0.1, arrivals: 850 },

  // KERALA / KERALAM
  { state: 'Keralam', district: 'Ernakulam', market: 'Kochi APMC (Willingdon Island)', commodity: 'Black Pepper', variety: 'Malabar Garbled (MG1)', grade: 'Export Grade High Piperine', modal: 64500, min: 58000, max: 71000, trend: 'up', change: 4.8, arrivals: 220 },
  { state: 'Keralam', district: 'Idukki', market: 'Nedumkandam Spices Market', commodity: 'Cardamom', variety: 'Small Cardamom 8mm Bold', grade: 'Green Bold Deep Color', modal: 225000, min: 195000, max: 260000, trend: 'up', change: 6.5, arrivals: 95 },

  // HIMACHAL PRADESH
  { state: 'Himachal Pradesh', district: 'Shimla', market: 'Shimla APMC (Dhalli Mandi)', commodity: 'Apple', variety: 'Royal Delicious', grade: 'Export Grade Extra Fancy', modal: 9800, min: 7500, max: 13000, trend: 'up', change: 3.8, arrivals: 1100 },

  // JAMMU AND KASHMIR
  { state: 'Jammu and Kashmir', district: 'Baramulla', market: 'Sopore Fruit Mandi', commodity: 'Apple', variety: 'Kashmiri Kulu Delicious', grade: 'Grade A Red Delicious', modal: 9200, min: 7000, max: 12000, trend: 'up', change: 3.2, arrivals: 1850 },
  { state: 'Jammu and Kashmir', district: 'Jammu', market: 'Jammu APMC (Narwal)', commodity: 'Paddy(Basmati)', variety: 'RS Pura Basmati', grade: 'Aromatic Long Grain', modal: 4400, min: 3800, max: 5100, trend: 'up', change: 2.4, arrivals: 490 },

  // ASSAM
  { state: 'Assam', district: 'Kamrup Metropolitan', market: 'Guwahati APMC (Pamohi)', commodity: 'Tea', variety: 'Assam CTC Golden Pekoe', grade: 'BOP Strong Liquoring', modal: 28500, min: 21000, max: 36000, trend: 'up', change: 2.8, arrivals: 620 },

  // UTTAR PRADESH
  { state: 'Uttar Pradesh', district: 'Agra', market: 'Agra APMC', commodity: 'Potato', variety: 'Kufri Bahar', grade: 'Cold Store Grade A', modal: 1480, min: 1180, max: 1780, trend: 'stable', change: 0.3, arrivals: 1450 },
  { state: 'Uttar Pradesh', district: 'Kanpur', market: 'Kanpur APMC (Chakeri)', commodity: 'Durum Wheat', variety: 'Desi Dara', grade: 'FAQ', modal: 2430, min: 2250, max: 2620, trend: 'stable', change: 0.2, arrivals: 980 }
];

export async function populateAndSyncMandis() {
  console.log('🔄 Populating All-India Mandis and Syncing Data.gov.in API...');

  // Map crops
  const [crops] = await pool.query('SELECT id, name, slug FROM crops');
  const cropMap = new Map();
  for (const c of crops) {
    cropMap.set(c.name.toLowerCase().trim(), c.id);
    cropMap.set(c.slug.toLowerCase().trim(), c.id);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  for (const m of ALL_STATES_MANDIS) {
    let matchedCropId = null;
    const commLower = m.commodity.toLowerCase();
    for (const [key, cid] of cropMap.entries()) {
      if (commLower.includes(key) || key.includes(commLower)) {
        matchedCropId = cid;
        break;
      }
    }

    const [existing] = await pool.query(
      `SELECT id FROM mandi_prices WHERE market_name = ? AND commodity = ? LIMIT 1`,
      [m.market, m.commodity]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO mandi_prices 
          (crop_id, state, district, market_name, commodity, variety, grade, modal_price, min_price, max_price, price_date, trend, change_percent, arrivals_tonnes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          matchedCropId,
          m.state,
          m.district,
          m.market,
          m.commodity,
          m.variety || 'General',
          m.grade || 'FAQ',
          m.modal,
          m.min,
          m.max,
          todayStr,
          m.trend || 'stable',
          m.change || 0,
          m.arrivals || 150,
        ]
      );
    }
  }

  // Next, run live Data.gov.in Agmarknet API sync to overlay all official government records
  if (process.env.DATA_GOV_API_KEY) {
    try {
      console.log('📡 Syncing live Data.gov.in API records...');
      await syncAgmarknetPrices(process.env.DATA_GOV_API_KEY, 5000);
    } catch (e) {
      console.warn('API sync warning:', e.message);
    }
  }

  const [[stat]] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT state) as states,
      COUNT(DISTINCT district) as cities,
      COUNT(DISTINCT market_name) as mandis,
      COUNT(DISTINCT commodity) as crops
    FROM mandi_prices
  `);

  console.log(`✅ COMPLETE MANDI NETWORK: ${stat.total} records across ${stat.states} States, ${stat.cities} Cities/Districts, ${stat.mandis} APMC Mandis, and ${stat.crops} Crops.`);
}

populateAndSyncMandis()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Population failed:', err);
    process.exit(1);
  });
