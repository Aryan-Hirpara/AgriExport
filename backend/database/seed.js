import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export async function seedDatabase() {
  console.log('🌱 Starting AgriExport Connect database seeding...');

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Clear existing data
    console.log('🧹 Clearing tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'activity_logs', 'announcements', 'export_guides', 'mandi_prices',
      'complaints', 'saved_searches', 'saved_items', 'notifications',
      'reviews', 'messages', 'deal_documents', 'deal_status_history',
      'deals', 'offers', 'buyer_requirements', 'listing_images',
      'produce_listings', 'crops', 'verification_documents',
      'enterprise_profiles', 'farmer_profiles', 'users'
    ];
    for (const t of tables) {
      await connection.query(`TRUNCATE TABLE ${t}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Hash passwords
    const userPasswordHash = await bcrypt.hash('demo1234', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);

    // 3. Seed Users
    console.log('👤 Seeding Users...');
    // Admin
    const [adminRes] = await connection.query(
      `INSERT INTO users (email, phone, password_hash, role, name, avatar, is_verified)
       VALUES (?, ?, ?, 'admin', ?, ?, true)`,
      ['admin@agriexport.in', '9999900000', adminPasswordHash, 'AgriExport Admin', '🛡️']
    );
    const adminId = adminRes.insertId;

    // Farmers
    const farmersData = [
      { id: 'f1', email: 'ramesh@unjha.com', phone: '9876543210', name: 'Ramesh Patel', village: 'Unjha', district: 'Mehsana', state: 'Gujarat', land: '12 bigha', crops: ['jeera', 'isabgol'], rating: 4.8, reviews: 34, verified: true, avatar: '🧑‍🌾', exp: 15 },
      { id: 'f2', email: 'bhavna@gir.com', phone: '9765432109', name: 'Bhavna Ben Desai', village: 'Talala Gir', district: 'Junagadh', state: 'Gujarat', land: '8 bigha', crops: ['kesar-mango', 'banana'], rating: 4.6, reviews: 21, verified: true, avatar: '👩‍🌾', exp: 12 },
      { id: 'f3', email: 'karsan@viramgam.com', phone: '9654321098', name: 'Karsan Bhai Solanki', village: 'Viramgam', district: 'Ahmedabad', state: 'Gujarat', land: '20 bigha', crops: ['cotton', 'castor', 'groundnut'], rating: 4.4, reviews: 18, verified: true, avatar: '🧑‍🌾', exp: 20 },
      { id: 'f4', email: 'geeta@gondal.com', phone: '9543210987', name: 'Geeta Vaghela', village: 'Gondal', district: 'Rajkot', state: 'Gujarat', land: '6 bigha', crops: ['groundnut', 'sesame'], rating: 4.9, reviews: 12, verified: false, avatar: '👩‍🌾', exp: 7 },
      { id: 'f5', email: 'harsukh@mahuva.com', phone: '9432109876', name: 'Harsukhbhai Mer', village: 'Mahuva', district: 'Bhavnagar', state: 'Gujarat', land: '14 bigha', crops: ['onion', 'garlic'], rating: 4.5, reviews: 29, verified: true, avatar: '🧑‍🌾', exp: 18 },
      { id: 'f6', email: 'jagruti@patan.com', phone: '9321098765', name: 'Jagruti Barot', village: 'Patan', district: 'Patan', state: 'Gujarat', land: '10 bigha', crops: ['jeera', 'wheat'], rating: 4.3, reviews: 9, verified: true, avatar: '👩‍🌾', exp: 8 },
      { id: 'f7', email: 'dhruv@surendranagar.com', phone: '9210987654', name: 'Dhruv Chauhan', village: 'Surendranagar', district: 'Surendranagar', state: 'Gujarat', land: '22 bigha', crops: ['cotton', 'bajra', 'wheat'], rating: 4.7, reviews: 41, verified: true, avatar: '🧑‍🌾', exp: 22 },
      { id: 'f8', email: 'shantaben@deesa.com', phone: '9109876543', name: 'Shantaben Rabari', village: 'Deesa', district: 'Banaskantha', state: 'Gujarat', land: '16 bigha', crops: ['castor', 'isabgol'], rating: 4.2, reviews: 7, verified: false, avatar: '👩‍🌾', exp: 10 },
      { id: 'f9', email: 'aryanhirpara650@gmail.com', phone: '8160315302', name: 'Aryan Hirpara', village: 'Unjha', district: 'Mehsana', state: 'Gujarat', land: '15 bigha', crops: ['jeera', 'groundnut'], rating: 5.0, reviews: 12, verified: true, avatar: '🧑‍🌾', exp: 8 },
    ];

    const farmerIdMap = {};
    for (const f of farmersData) {
      const [res] = await connection.query(
        `INSERT INTO users (email, phone, password_hash, role, name, avatar, is_verified, rating, reviews_count)
         VALUES (?, ?, ?, 'farmer', ?, ?, ?, ?, ?)`,
        [f.email, f.phone, userPasswordHash, f.name, f.avatar, f.verified, f.rating, f.reviews]
      );
      farmerIdMap[f.id] = res.insertId;

      await connection.query(
        `INSERT INTO farmer_profiles (user_id, village, district, state, land_size, experience_years, primary_crops)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [res.insertId, f.village, f.district, f.state, f.land, f.exp, JSON.stringify(f.crops)]
      );
    }

    // Enterprises
    const enterprisesData = [
      { id: 'e1', email: 'ahmed@spiceexports.in', phone: '9825011223', name: 'Ahmed Spice Exports', type: 'Exporter', city: 'Ahmedabad', countries: ['UAE', 'Saudi Arabia', 'UK', 'USA'], crops: ['jeera', 'isabgol', 'sesame'], minOrder: '5 MT', gst: '24AAACA1234B1Z5', iec: 'AAACA1234B', rating: 4.7, reviews: 52, verified: true, logo: '🌶️', since: 2012 },
      { id: 'e2', email: 'patel@agrotraders.in', phone: '9824055667', name: 'Patel Agro Traders', type: 'Trader', city: 'Rajkot', countries: ['India', 'Vietnam', 'Indonesia'], crops: ['groundnut', 'sesame', 'castor'], minOrder: '10 MT', gst: '24AAACB5678C2Z6', iec: 'AAACB5678C', rating: 4.5, reviews: 38, verified: true, logo: '🌱', since: 2015 },
      { id: 'e3', email: 'kesar@mangoworld.in', phone: '9725088990', name: 'Kesar Mango World Pvt Ltd', type: 'Exporter', city: 'Junagadh', countries: ['UAE', 'UK', 'Canada', 'Germany'], crops: ['kesar-mango', 'banana'], minOrder: '1 MT', gst: '24AAACE9012D3Z7', iec: 'AAACE9012D', rating: 4.9, reviews: 87, verified: true, logo: '🥭', since: 2008 },
      { id: 'e4', email: 'gujarat@agrograin.in', phone: '9879033445', name: 'Gujarat Agro Grain Corp', type: 'Processor', city: 'Surat', countries: ['India', 'Bangladesh'], crops: ['wheat', 'bajra', 'castor'], minOrder: '20 MT', gst: '24AAACD3456E4Z8', iec: 'AAACD3456E', rating: 4.2, reviews: 24, verified: true, logo: '🌾', since: 2018 },
      { id: 'e5', email: 'saurashtra@oilind.in', phone: '9825123456', name: 'Saurashtra Oil Industries', type: 'Processor', city: 'Rajkot', countries: ['India'], crops: ['groundnut', 'castor', 'sesame'], minOrder: '10 MT', gst: '24AAACE7890F5Z9', iec: '', rating: 4.1, reviews: 16, verified: true, logo: '🏭', since: 2010 },
      { id: 'e6', email: 'nexus@agroexports.in', phone: '9909012345', name: 'Nexus Agro Exports Ltd', type: 'Exporter', city: 'Ahmedabad', countries: ['Japan', 'South Korea', 'China'], crops: ['sesame', 'isabgol', 'castor'], minOrder: '5 MT', gst: '24AABCN1234F1Z5', iec: 'AABCN1234F', rating: 4.6, reviews: 31, verified: true, logo: '🏢', since: 2014 },
      { id: 'e7', email: 'girvalley@fruitexports.in', phone: '9898123456', name: 'Gir Valley Fruit Exports', type: 'Exporter', city: 'Junagadh', countries: ['UAE', 'Qatar', 'Saudi Arabia'], crops: ['kesar-mango', 'banana', 'onion'], minOrder: '500 kg', gst: '24AAACG5555H2Z3', iec: 'AAACG5555H', rating: 4.4, reviews: 19, verified: true, logo: '🌴', since: 2019 },
      { id: 'e8', email: 'mahuva@oniontraders.in', phone: '9876044332', name: 'Mahuva Onion Traders', type: 'Trader', city: 'Bhavnagar', countries: ['UAE', 'Sri Lanka', 'Bangladesh'], crops: ['onion', 'garlic'], minOrder: '5 MT', gst: '24AAACH7777J3Z4', iec: 'AAACH7777J', rating: 4.3, reviews: 22, verified: true, logo: '🧅', since: 2016 },
      { id: 'e9', email: 'cotton@crowntrading.in', phone: '9824987654', name: 'Cotton Crown Trading Co', type: 'Trader', city: 'Surat', countries: ['Bangladesh', 'Vietnam', 'Pakistan'], crops: ['cotton'], minOrder: '20 MT', gst: '24AAACI8888K4Z5', iec: 'AAACI8888K', rating: 4.0, reviews: 11, verified: true, logo: '🌸', since: 2017 },
      { id: 'e10', email: 'shreelaxmi@agrofoods.in', phone: '9724088776', name: 'Shree Laxmi Agro Foods', type: 'Processor', city: 'Gondal', countries: ['India', 'UAE'], crops: ['groundnut', 'garlic', 'onion'], minOrder: '2 MT', gst: '24AAACJ2222L5Z6', iec: 'AAACJ2222L', rating: 4.5, reviews: 28, verified: true, logo: '🍱', since: 2013 },
      { id: 'e11', email: 'biofresh@india.in', phone: '9925067890', name: 'BioFresh India Pvt Ltd', type: 'Exporter', city: 'Ahmedabad', countries: ['Germany', 'Netherlands', 'France'], crops: ['jeera', 'sesame', 'isabgol'], minOrder: '1 MT', gst: '24AAACK3333M6Z7', iec: 'AAACK3333M', rating: 4.8, reviews: 44, verified: true, logo: '🌿', since: 2011 },
    ];

    const enterpriseIdMap = {};
    for (const e of enterprisesData) {
      const [res] = await connection.query(
        `INSERT INTO users (email, phone, password_hash, role, name, avatar, is_verified, rating, reviews_count)
         VALUES (?, ?, ?, 'enterprise', ?, ?, ?, ?, ?)`,
        [e.email, e.phone, userPasswordHash, e.name, e.logo, e.verified, e.rating, e.reviews]
      );
      enterpriseIdMap[e.id] = res.insertId;

      await connection.query(
        `INSERT INTO enterprise_profiles (user_id, company_name, business_type, gst_number, iec_number, city, countries_exported_to, min_order_mt, established_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [res.insertId, e.name, e.type, e.gst, e.iec, e.city, JSON.stringify(e.countries), e.minOrder, e.since]
      );
    }

    // 4. Seed Crops
    console.log('🌾 Seeding Crops...');
    const cropsData = [
      { slug: 'groundnut', name: 'Groundnut', gujarati: 'મગફળી', emoji: '🥜', price: 65, unit: 'kg', grade: 'Bold 40/50', desc: 'Premium Gujarat Saurashtra Groundnut. High oil content, export grade bold kernels.' },
      { slug: 'jeera', name: 'Jeera (Cumin)', gujarati: 'જીરું', emoji: '🌿', price: 318, unit: 'kg', grade: 'Premium Bold', desc: 'World-renowned Unjha Cumin. Machine cleaned 99.5% purity, high volatile oil.' },
      { slug: 'sesame', name: 'Sesame (Til)', gujarati: 'તલ', emoji: '🌱', price: 162, unit: 'kg', grade: 'Natural White 99/1', desc: 'Natural white and hulled sesame seeds. Premium sortex cleaned for export.' },
      { slug: 'castor', name: 'Castor Seeds', gujarati: 'દિવેલા', emoji: '🟤', price: 116, unit: 'kg', grade: 'FAQ GCH-7', desc: 'High oil yielding castor seeds from Banaskantha and Ahmedabad regions.' },
      { slug: 'isabgol', name: 'Isabgol (Psyllium)', gujarati: 'ઇસબગોલ', emoji: '🌾', price: 148, unit: 'kg', grade: 'Husk 99%', desc: 'Top pharmaceutical grade Psyllium husk and seeds with high swelling factor.' },
      { slug: 'cotton', name: 'Cotton (Kapas)', gujarati: 'કપાસ', emoji: '🌸', price: 61, unit: 'kg', grade: 'Shankar-6', desc: 'Shankar-6 staple cotton, 29-30mm length with excellent ginning turnout.' },
      { slug: 'kesar-mango', name: 'Kesar Mango', gujarati: 'કેસર કેરી', emoji: '🥭', price: 188, unit: 'kg', grade: 'Export A (GI Tagged)', desc: 'Geographically Indicated Talala Gir Kesar mangoes. Tree-ripened, Brix 22°+.' },
      { slug: 'banana', name: 'Banana', gujarati: 'કેળાં', emoji: '🍌', price: 26, unit: 'kg', grade: 'Grand Naine', desc: 'Grand Naine Cavendish bananas from Anand and South Gujarat with high shelf life.' },
      { slug: 'onion', name: 'Onion', gujarati: 'ડુંગળી', emoji: '🧅', price: 28, unit: 'kg', grade: 'Export Grade A', desc: 'Mahuva & Bhavnagar Red Onions with dry neck and long storage capability.' },
      { slug: 'garlic', name: 'Garlic', gujarati: 'લસણ', emoji: '🧄', price: 112, unit: 'kg', grade: 'Export Sortex', desc: 'Gujarat sortex cleaned large bulb garlic with pungent aroma and firm cloves.' },
      { slug: 'wheat', name: 'Wheat (Ghau)', gujarati: 'ઘઉં', emoji: '🌾', price: 24, unit: 'kg', grade: 'Bold FAQ (GW-322)', desc: 'Bhalia and GW-322 high-protein durum wheat, optimal for flour and export.' },
      { slug: 'bajra', name: 'Bajra (Pearl Millet)', gujarati: 'બાજરો', emoji: '🟡', price: 22, unit: 'kg', grade: 'Bold GHB-719', desc: 'Nutrient-rich pearl millet for human consumption and international feed market.' },
    ];

    const cropIdMap = {};
    for (const c of cropsData) {
      const [res] = await connection.query(
        `INSERT INTO crops (slug, name, gujarati_name, emoji, indicative_price, default_unit, export_grade, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.slug, c.name, c.gujarati, c.emoji, c.price, c.unit, c.grade, c.desc]
      );
      cropIdMap[c.slug] = res.insertId;
    }

    // 5. Seed Produce Listings (42 listings)
    console.log('📦 Seeding Produce Listings...');
    const rawListings = [
      { id: 'l1', farmerId: 'f1', crop: 'jeera', title: 'High-quality Unjha Premium Jeera', variety: 'Gujarat Jeera-4', qty: 8000, price: 315, grade: 'Premium Bold', organic: true, district: 'Mehsana', village: 'Unjha', desc: 'High-quality Unjha Premium Jeera. Sun-dried, hand-cleaned, 99.5% purity. FSSAI certified. Available from Oct 15.', specs: { purity: '99.5%', moisture: 'Max 7%', volatileOil: '2.8%', packaging: '50 kg PP Bags' } },
      { id: 'l2', farmerId: 'f6', crop: 'jeera', title: 'Patan District Jeera FAQ', variety: 'Local FAQ', qty: 5000, price: 298, grade: 'FAQ', organic: false, district: 'Patan', village: 'Patan', desc: 'Patan district jeera, FAQ grade, machine cleaned. Good aroma. Suitable for domestic spice traders.', specs: { purity: '97%', moisture: 'Max 9%', volatileOil: '2.2%', packaging: '50 kg Jute Bags' } },
      { id: 'l3', farmerId: 'f3', crop: 'groundnut', title: 'Viramgam Bold 40/50 Groundnut', variety: 'Bold 40/50', qty: 15000, price: 65, grade: 'Bold 40/50', organic: false, district: 'Ahmedabad', village: 'Viramgam', desc: 'Viramgam Bold 40/50 groundnut. Machine-sorted, aflatoxin <4ppb tested. Ideal for SE Asia export.', specs: { count: '40/50', moisture: 'Max 7%', aflatoxin: 'Below 4 ppb', packaging: '25 kg Vacuum Bags' } },
      { id: 'l4', farmerId: 'f4', crop: 'groundnut', title: 'Gondal Java Groundnut 60/70', variety: 'Java', qty: 6000, price: 60, grade: 'Java 60/70', organic: false, district: 'Rajkot', village: 'Gondal', desc: 'Gondal Java groundnut, 60/70 count, suitable for oil extraction or confectionery.', specs: { count: '60/70', moisture: 'Max 8%', oilContent: '46%', packaging: '50 kg Jute Bags' } },
      { id: 'l5', farmerId: 'f3', crop: 'groundnut', title: 'Bulk Domestic Oil-Grade Groundnut', variety: 'TJ-11', qty: 20000, price: 58, grade: 'Domestic Oil Grade', organic: false, district: 'Ahmedabad', village: 'Viramgam', desc: 'Bulk domestic oil-grade groundnut, TJ-11 variety. Direct from farm, loose truck delivery.', specs: { variety: 'TJ-11', moisture: 'Max 9%', oilContent: '44%', packaging: 'Loose Truck' } },
      { id: 'l6', farmerId: 'f4', crop: 'sesame', title: 'Organic Natural White Sesame 99/1', variety: 'White 99/1', qty: 4000, price: 162, grade: 'Natural White 99/1', organic: true, district: 'Rajkot', village: 'Gondal', desc: 'Organic certified natural white sesame, 99/1 sortex, oil content 49%+. Suitable for Japan/Korea.', specs: { purity: '99/1', moisture: 'Max 5%', oilContent: '49%+', packaging: '25 kg Inner Poly Bags' } },
      { id: 'l7', farmerId: 'f3', crop: 'sesame', title: 'Machine Cleaned White Sesame', variety: 'White Sortex', qty: 3000, price: 155, grade: 'Machine Cleaned', organic: false, district: 'Ahmedabad', village: 'Viramgam', desc: 'Machine-cleaned white sesame. Good oil content. Domestic traders / processors welcome.', specs: { purity: '98%', moisture: 'Max 7%', oilContent: '47%', packaging: '50 kg Jute Bags' } },
      { id: 'l8', farmerId: 'f8', crop: 'castor', title: 'GCH-7 Castor Seeds High Oil', variety: 'GCH-7', qty: 10000, price: 116, grade: 'Bold High Oil (GCH-7)', organic: false, district: 'Banaskantha', village: 'Deesa', desc: 'GCH-7 castor, high oil 49.2%. New crop 2026. Available at Deesa. Lab report available.', specs: { variety: 'GCH-7', oilContent: '49.2%', moisture: 'Max 6%', packaging: 'Gunny Bags' } },
      { id: 'l9', farmerId: 'f3', crop: 'castor', title: 'Jwala Variety Castor Seeds', variety: 'Jwala', qty: 7000, price: 112, grade: 'FAQ', organic: false, district: 'Ahmedabad', village: 'Viramgam', desc: 'FAQ castor seeds, Jwala variety. Loose truck load available for crushing mills.', specs: { variety: 'Jwala', oilContent: '47.5%', moisture: 'Max 7%', packaging: 'Loose Truck' } },
      { id: 'l10', farmerId: 'f1', crop: 'isabgol', title: 'NPOP Certified Organic Isabgol Husk', variety: 'Gujarat Isabgol-2', qty: 5000, price: 150, grade: 'Husk 99% Organic', organic: true, district: 'Mehsana', village: 'Unjha', desc: 'NPOP certified organic isabgol husk, 99% purity, swelling factor 45+. EU export ready.', specs: { purity: '99%', swellingFactor: '45+ ml/g', moisture: 'Max 8%', packaging: '25 kg Food-Grade Bags' } },
      { id: 'l11', farmerId: 'f8', crop: 'isabgol', title: 'Isabgol Husk 85% Grade', variety: 'Commercial', qty: 3000, price: 138, grade: 'Husk 85%', organic: false, district: 'Banaskantha', village: 'Deesa', desc: 'Isabgol husk 85% grade. Domestic pharma/FMCGs. Good swelling factor.', specs: { purity: '85%', swellingFactor: '38+ ml/g', moisture: 'Max 10%', packaging: '25 kg Bags' } },
      { id: 'l12', farmerId: 'f3', crop: 'cotton', title: 'Shankar-6 Cotton Kapas 29mm', variety: 'Shankar-6', qty: 25000, price: 62, grade: 'Shankar-6 (29mm)', organic: false, district: 'Ahmedabad', village: 'Viramgam', desc: 'Shankar-6 cotton kapas, 29mm staple, ginning outturn 38%. Fresh from field, low trash.', specs: { variety: 'Shankar-6', stapleLength: '29mm', ginningOutturn: '38%', packaging: 'Loose Truck' } },
      { id: 'l13', farmerId: 'f7', crop: 'cotton', title: 'Premium Shankar-6 Cotton 30mm+', variety: 'Shankar-6', qty: 40000, price: 63, grade: 'Shankar-6 (30mm+)', organic: false, district: 'Surendranagar', village: 'Surendranagar', desc: 'Premium Shankar-6 long staple cotton, 30mm+, GO 39%. Suitable for spinning mills.', specs: { variety: 'Shankar-6', stapleLength: '30mm+', ginningOutturn: '39%', packaging: '50 kg Gunny Bags' } },
      { id: 'l14', farmerId: 'f2', crop: 'kesar-mango', title: 'GI-Tagged Talala Gir Kesar Mango', variety: 'Gir Kesar', qty: 3000, price: 185, grade: 'Export Grade A', organic: false, district: 'Junagadh', village: 'Talala Gir', desc: 'GI-tagged Gir Kesar mangoes from Talala. Brix 22°+. HWT done. 3 kg export cartons available.', specs: { grade: 'Export A (GI)', brix: '22°+', weight: '250–300g', treatment: 'HWT' } },
      { id: 'l15', farmerId: 'f2', crop: 'kesar-mango', title: 'Domestic Premium Kesar Mangoes', variety: 'Gir Kesar', qty: 1000, price: 165, grade: 'Domestic Premium', organic: false, district: 'Junagadh', village: 'Talala Gir', desc: 'Domestic premium Kesar mangoes, Brix 20°+. B-grade fruit size. Good for retail gifting boxes.', specs: { grade: 'Domestic Premium', brix: '20°+', weight: '180–220g', treatment: 'Untreated' } },
      { id: 'l16', farmerId: 'f2', crop: 'banana', title: 'Grand Naine Export Bananas', variety: 'Grand Naine', qty: 8000, price: 26, grade: 'Grand Naine Export A', organic: false, district: 'Junagadh', village: 'Talala Gir', desc: 'Grand Naine bananas, 18–22cm finger, export grade. 13 kg CFB boxes available. Phytosanitary ready.', specs: { variety: 'Grand Naine', fingerLength: '18–22cm', maturity: '75% (export)', packaging: '13 kg CFB Boxes' } },
      { id: 'l17', farmerId: 'f5', crop: 'banana', title: 'Robusta Banana Domestic Grade', variety: 'Robusta', qty: 5000, price: 22, grade: 'Robusta Domestic', organic: false, district: 'Bhavnagar', village: 'Mahuva', desc: 'Robusta banana, domestic market grade. Ripe supply possible within 5 days of harvesting.', specs: { variety: 'Robusta', fingerLength: '15–18cm', maturity: 'Full Green', packaging: '15 kg Local Crates' } },
      { id: 'l18', farmerId: 'f5', crop: 'onion', title: 'Gujarat Red Onion Export Grade A', variety: 'Gujarat Red', qty: 20000, price: 30, grade: 'Export Grade A (60mm+)', organic: false, district: 'Bhavnagar', village: 'Mahuva', desc: 'Gujarat Red onion, Export Grade A, 60mm+, dry neck. MRL test done. 25 kg mesh bags.', specs: { size: '60–70mm', moisture: 'Max 82%', dryNeck: 'Fully Dry Neck', packaging: '25 kg Mesh Bags' } },
      { id: 'l19', farmerId: 'f5', crop: 'onion', title: 'Grade B Red Onion (40-60mm)', variety: 'Gujarat Red', qty: 12000, price: 24, grade: 'Grade B (40–60mm)', organic: false, district: 'Bhavnagar', village: 'Mahuva', desc: 'Grade B onion, medium size 40–60mm. Domestic wholesale market quality.', specs: { size: '40–60mm', moisture: 'Max 85%', dryNeck: 'Semi-dry', packaging: '25 kg Mesh Bags' } },
      { id: 'l20', farmerId: 'f7', crop: 'onion', title: 'Surendranagar Red Onion 60mm+', variety: 'Nashik Red', qty: 15000, price: 28, grade: 'Export Grade A', organic: false, district: 'Surendranagar', village: 'Surendranagar', desc: 'Surendranagar Gujarat Red onion 60mm+. Export grade. Available for immediate loading.', specs: { size: '60mm+', moisture: 'Max 80%', dryNeck: 'Fully Dry Neck', packaging: '25 kg Mesh Bags' } },
      { id: 'l21', farmerId: 'f5', crop: 'garlic', title: 'G-1 Hybrid Garlic Export Sortex', variety: 'G-1 Hybrid', qty: 8000, price: 120, grade: 'Export Sortex (40mm+)', organic: false, district: 'Bhavnagar', village: 'Mahuva', desc: 'G-1 hybrid garlic, 40mm+ sortex cleaned, fully sheathed. MRL tested. 10 kg mesh bags.', specs: { bulbSize: '40–50mm', moisture: 'Max 62%', variety: 'Hybrid G-1', packaging: '10 kg Mesh Bags' } },
      { id: 'l22', farmerId: 'f5', crop: 'garlic', title: 'Medium Grade Desi Garlic', variety: 'Desi', qty: 5000, price: 100, grade: 'Medium (25–40mm)', organic: false, district: 'Bhavnagar', village: 'Mahuva', desc: 'Medium grade garlic, 25–40mm. Good for domestic market processing.', specs: { bulbSize: '25–40mm', moisture: 'Max 65%', variety: 'Desi', packaging: '20 kg Bags' } },
      { id: 'l23', farmerId: 'f6', crop: 'wheat', title: 'GW-322 Bold Wheat (60g+ TKW)', variety: 'GW-322', qty: 30000, price: 25, grade: 'Bold FAQ (GW-322)', organic: false, district: 'Patan', village: 'Patan', desc: 'GW-322 bold wheat, 60g TKW+, protein 11.5%. Good for flour mills. 50 kg jute bags.', specs: { variety: 'GW-322', moisture: 'Max 12%', protein: '11.5%', packaging: '50 kg Jute Bags' } },
      { id: 'l24', farmerId: 'f7', crop: 'wheat', title: 'Lok-1 Standard Grade Wheat', variety: 'Lok-1', qty: 50000, price: 24, grade: 'Standard', organic: false, district: 'Surendranagar', village: 'Surendranagar', desc: 'Standard grade wheat, Lok-1 variety. Bulk truck delivery available. Suitable for flour mills.', specs: { variety: 'Lok-1', moisture: 'Max 12%', protein: '10.5%', packaging: '50 kg HDPE Bags' } },
      { id: 'l25', farmerId: 'f6', crop: 'wheat', title: 'Sharbati Premium High Protein Wheat', variety: 'Sharbati', qty: 10000, price: 27, grade: 'Sharbati Premium', organic: false, district: 'Patan', village: 'Patan', desc: 'Sharbati premium wheat. High protein 12.5%. Premium bakeries only.', specs: { variety: 'Sharbati', moisture: 'Max 10%', protein: '12.5%', packaging: '50 kg Jute Bags' } },
      { id: 'l26', farmerId: 'f7', crop: 'bajra', title: 'GHB-719 Bold Bajra 98% Purity', variety: 'GHB-719', qty: 40000, price: 22, grade: 'Bold GHB-719', organic: false, district: 'Surendranagar', village: 'Surendranagar', desc: 'GHB-719 bold bajra, 98% purity. Good for poultry feed and domestic flour. 50 kg bags.', specs: { variety: 'GHB-719', moisture: 'Max 12%', purity: '98%', packaging: '50 kg Jute Bags' } },
      { id: 'l27', farmerId: 'f7', crop: 'bajra', title: 'Animal Feed Grade Bajra', variety: 'Mixed', qty: 20000, price: 20, grade: 'Animal Feed Grade', organic: false, district: 'Surendranagar', village: 'Surendranagar', desc: 'Feed grade bajra. Moisture tested. Suitable for ME animal feed export via traders.', specs: { variety: 'Mixed', moisture: 'Max 14%', purity: '94%', packaging: 'Bulk Truck' } },
      { id: 'l28', farmerId: 'f1', crop: 'jeera', title: 'Machine Cleaned Jeera 99% Purity', variety: 'Gujarat Jeera-4', qty: 12000, price: 310, grade: 'Machine Cleaned (99%)', organic: false, district: 'Mehsana', village: 'Unjha', desc: 'Machine cleaned jeera, 99% purity, Unjha origin. Saudi/UAE shipment ready.', specs: { purity: '99%', moisture: 'Max 8%', volatileOil: '2.5%', packaging: '50 kg PP Bags' } },
      { id: 'l29', farmerId: 'f9', crop: 'jeera', title: 'Premium Bold Unjha Cumin (Jeera)', variety: 'Gujarat Jeera-4', qty: 6000, price: 320, grade: 'Export Grade A', organic: true, district: 'Mehsana', village: 'Unjha', desc: 'Premium sun-dried unjha cumin seeds, 99.5% purity, high volatile oil content. Ready for immediate loading.', specs: { purity: '99.5%', moisture: 'Max 7%', packaging: '50 kg PP Bags' } },
      { id: 'l30', farmerId: 'f9', crop: 'groundnut', title: 'Saurashtra Bold 40/50 Groundnut', variety: 'Bold 40/50', qty: 10000, price: 68, grade: 'Bold 40/50', organic: false, district: 'Mehsana', village: 'Unjha', desc: 'Machine sorted bold 40/50 groundnut with low aflatoxin (<4ppb). Moisture tested.', specs: { count: '40/50', moisture: 'Max 7%', packaging: '25 kg Vacuum Bags' } },
    ];

    const listingIdMap = {};
    for (const l of rawListings) {
      const fUserId = farmerIdMap[l.farmerId] || adminId;
      const cId = cropIdMap[l.crop];
      if (!cId) continue;

      const [res] = await connection.query(
        `INSERT INTO produce_listings (farmer_id, crop_id, title, variety, quantity, unit, price_per_unit, location_village, location_district, quality_grade, organic_certified, lab_tested, attributes, description, status)
         VALUES (?, ?, ?, ?, ?, 'kg', ?, ?, ?, ?, ?, true, ?, ?, 'active')`,
        [fUserId, cId, l.title, l.variety, l.qty, l.price, l.village, l.district, l.grade, l.organic, JSON.stringify(l.specs), l.desc]
      );
      listingIdMap[l.id] = res.insertId;

      // Add a primary image placeholder
      await connection.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (?, ?, true)`,
        [res.insertId, `/images/crops/${l.crop}.jpg`]
      );
    }

    // 6. Seed Buyer Requirements (8 requirements)
    console.log('📋 Seeding Buyer Requirements...');
    const rawReqs = [
      { id: 'br1', enterpriseId: 'e1', title: 'Require 15 Tons Premium Unjha Jeera for UAE Shipment', crop: 'jeera', qty: 15, unit: 'ton', targetPrice: 322, priceRange: '₹318–₹325 / kg', destination: 'UAE (Dubai)', flag: '🇦🇪', urgency: 'urgent', urgencyLabel: 'Urgent Requirement', specs: { purity: '99.5% Machine Cleaned (Singapore Quality)', moisture: 'Below 8%', grade: 'Premium Bold', packaging: '50 kg PP / Jute bags' }, deliveryTerms: 'Ex-Farm Pickup or Unjha APMC delivery', paymentTerms: '30% Advance, 70% on weight slip', deadline: '2026-10-20', notes: 'Urgent shipment for Jebel Ali port. Ready produce preferred. Farmgate inspection available.' },
      { id: 'br2', enterpriseId: 'e2', title: 'Need 25 Tons Groundnut Bold 40/50 for Vietnam', crop: 'groundnut', qty: 25, unit: 'ton', targetPrice: 68, priceRange: '₹65–₹70 / kg', destination: 'Vietnam & Indonesia', flag: '🇻🇳', urgency: 'high-volume', urgencyLabel: 'High Volume Demand', specs: { count: '40/50 Kernels/ounce', moisture: 'Max 7.0%', aflatoxin: 'Below 4 ppb (Export)', packaging: '25 kg vacuum bags' }, deliveryTerms: 'Rajkot Warehouse or Gondal Yard', paymentTerms: '48 hrs after quality approval', deadline: '2026-10-28', notes: 'SE Asian confectionery buyers. High quality sorting required.' },
      { id: 'br3', enterpriseId: 'e3', title: '5 Tons GI-Tagged Kesar Mango for UK Airfreight', crop: 'kesar-mango', qty: 5, unit: 'ton', targetPrice: 188, priceRange: '₹180–₹195 / kg', destination: 'UK & Canada', flag: '🇬🇧', urgency: 'urgent', urgencyLabel: 'Air Freight Urgent', specs: { grade: 'Export A (GI Registered)', brix: 'Min 20°+', weight: '220–300g per fruit', treatment: 'HWT / APEDA packhouse approved' }, deliveryTerms: 'Farm pickup in Junagadh / Talala Gir', paymentTerms: '100% on crate loading', deadline: '2026-10-15', notes: 'Crates provided by buyer. Same-day payment guaranteed.' },
      { id: 'br4', enterpriseId: 'e6', title: '20 Tons Natural White Sesame 99/1 for Japan', crop: 'sesame', qty: 20, unit: 'ton', targetPrice: 165, priceRange: '₹160–₹168 / kg', destination: 'Japan & South Korea', flag: '🇯🇵', urgency: 'active', urgencyLabel: 'Active Requirement', specs: { purity: '99/1 Sortex Cleaned', oilContent: 'Min 48%', moisture: 'Max 6%', packaging: '25 kg bags inner poly' }, deliveryTerms: 'Rajkot APMC or Mundra CFS', paymentTerms: 'NEFT within 24 hours', deadline: '2026-10-31', notes: 'Long-term contract farmers preferred for Rabi season too.' },
      { id: 'br5', enterpriseId: 'e4', title: '40 Tons Castor Seeds (High Oil) for Oil Processing', crop: 'castor', qty: 40, unit: 'ton', targetPrice: 118, priceRange: '₹115–₹122 / kg', destination: 'Domestic (Surat / Deesa)', flag: '🇮🇳', urgency: 'high-volume', urgencyLabel: 'High Volume Demand', specs: { oilContent: 'Min 48.5%', moisture: 'Max 6.5%', foreignMatter: 'Max 1.0%', packaging: 'Gunny bags / Loose' }, deliveryTerms: 'Mill delivery at Surat / Deesa', paymentTerms: 'On arrival + lab test', deadline: '2026-11-10', notes: 'High oil content lots get bonus ₹2/kg.' },
      { id: 'br6', enterpriseId: 'e11', title: '8 Tons Isabgol Husk 99% for Germany (Organic)', crop: 'isabgol', qty: 8, unit: 'ton', targetPrice: 158, priceRange: '₹152–₹162 / kg', destination: 'Germany & Netherlands', flag: '🇩🇪', urgency: 'urgent', urgencyLabel: 'Organic Urgent', specs: { purity: '99%+ Husk', swellingFactor: 'Min 45 ml/g', certification: 'NPOP / EU Organic', packaging: '25 kg food-grade bags' }, deliveryTerms: 'Unjha warehouse pickup', paymentTerms: '100% advance on bill', deadline: '2026-10-22', notes: 'Organic certificate + heavy metals test mandatory.' },
      { id: 'br7', enterpriseId: 'e8', title: '30 Tons Gujarat Red Onion (Export Grade A) for UAE', crop: 'onion', qty: 30, unit: 'ton', targetPrice: 32, priceRange: '₹28–₹35 / kg', destination: 'UAE & Sri Lanka', flag: '🇦🇪', urgency: 'active', urgencyLabel: 'Regular Demand', specs: { size: '60mm+ diameter', moisture: 'Max 85%', dryNeck: 'Fully Dry Neck', packaging: '25 kg mesh bags' }, deliveryTerms: 'Mahuva or Bhavnagar yard delivery', paymentTerms: '50% advance, 50% on LR', deadline: '2026-11-05', notes: 'Regular monthly requirement through season.' },
      { id: 'br8', enterpriseId: 'e10', title: '10 Tons Export Sortex Garlic for ME Markets', crop: 'garlic', qty: 10, unit: 'ton', targetPrice: 118, priceRange: '₹112–₹125 / kg', destination: 'UAE & Qatar', flag: '🇦🇪', urgency: 'active', urgencyLabel: 'Active Requirement', specs: { bulbSize: '40mm+ Export Sortex', moisture: 'Max 65%', variety: 'Hybrid G-1 or G-3', packaging: '10 kg mesh bags' }, deliveryTerms: 'Gondal / Rajkot warehouse', paymentTerms: '25% advance, rest on loading', deadline: '2026-11-15', notes: 'Good-looking, well-sheathed bulbs essential.' },
    ];

    const reqIdMap = {};
    for (const r of rawReqs) {
      const eUserId = enterpriseIdMap[r.enterpriseId];
      const cId = cropIdMap[r.crop];
      if (!eUserId || !cId) continue;

      const [res] = await connection.query(
        `INSERT INTO buyer_requirements (enterprise_id, crop_id, title, quantity, unit, target_price, price_range, destination, destination_flag, urgency, urgency_label, specs, delivery_terms, payment_terms, deadline, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
        [eUserId, cId, r.title, r.qty, r.unit, r.targetPrice, r.priceRange, r.destination, r.flag, r.urgency, r.urgencyLabel, JSON.stringify(r.specs), r.deliveryTerms, r.paymentTerms, r.deadline, r.notes]
      );
      reqIdMap[r.id] = res.insertId;
    }

    // 7. Seed Initial Offers & Quotes
    console.log('🤝 Seeding Offers & Quotes...');
    // Direct offers on produce listings
    const [offer1] = await connection.query(
      `INSERT INTO offers (listing_id, enterprise_id, farmer_id, sender_role, offered_price, quantity, unit, total_amount, delivery_terms, payment_terms, validity_date, notes, status)
       VALUES (?, ?, ?, 'enterprise', 308.00, 5000, 'kg', 1540000.00, 'Farm pickup (Unjha warehouse)', '50% advance, 50% on delivery', '2026-10-30', 'Interested in Unjha jeera. We export to UAE regularly. Prompt loading guaranteed.', 'new')`,
      [listingIdMap['l1'], enterpriseIdMap['e1'], farmerIdMap['f1']]
    );

    const [offer2] = await connection.query(
      `INSERT INTO offers (listing_id, enterprise_id, farmer_id, sender_role, offered_price, quantity, unit, total_amount, delivery_terms, payment_terms, validity_date, notes, status)
       VALUES (?, ?, ?, 'enterprise', 180.00, 2000, 'kg', 360000.00, 'Pickup from farm', '100% advance', '2026-10-25', 'We have export orders from UAE. Brix 22°+ confirmed?', 'accepted')`,
      [listingIdMap['l14'], enterpriseIdMap['e3'], farmerIdMap['f2']]
    );

    // Quotes on buyer requirements
    await connection.query(
      `INSERT INTO offers (requirement_id, enterprise_id, farmer_id, sender_role, offered_price, quantity, unit, total_amount, delivery_terms, payment_terms, validity_date, notes, status, lot_specs)
       VALUES (?, ?, ?, 'farmer', 320.00, 5000, 'kg', 1600000.00, 'Ex-Farm Pickup', '30% Advance, 70% on weight slip', '2026-10-28', 'Unjha Premium Jeera ready in warehouse. Sun-dried and machine-cleaned.', 'new', ?)`,
      [reqIdMap['br1'], enterpriseIdMap['e1'], farmerIdMap['f1'], JSON.stringify({ grade: 'Premium Bold', purity: '99.5% Machine Cleaned', moisture: '7.2%' })]
    );

    await connection.query(
      `INSERT INTO offers (requirement_id, enterprise_id, farmer_id, sender_role, offered_price, quantity, unit, total_amount, delivery_terms, payment_terms, validity_date, notes, status, lot_specs)
       VALUES (?, ?, ?, 'farmer', 67.00, 15000, 'kg', 1005000.00, 'Ex-Farm Pickup', '50% advance, 50% on weight slip', '2026-10-30', '40/50 count groundnuts sorted and bagged.', 'new', ?)`,
      [reqIdMap['br2'], enterpriseIdMap['e2'], farmerIdMap['f3'], JSON.stringify({ count: '40/50 Kernels/ounce', moisture: '6.5%', aflatoxin: 'Below 2 ppb' })]
    );

    // 8. Seed Deals (Converted from accepted offer2)
    console.log('📜 Seeding Deals...');
    const dealCode = 'DEAL-2026-001';
    const [dealRes] = await connection.query(
      `INSERT INTO deals (deal_code, offer_id, listing_id, farmer_id, enterprise_id, crop_id, quantity, unit, agreed_price, total_amount, advance_amount, payment_terms, delivery_terms, status, milestone_progress)
       VALUES (?, ?, ?, ?, ?, ?, 2000, 'kg', 180.00, 360000.00, 180000.00, '50% Advance, 50% on Delivery', 'Pickup from Talala Gir farm', 'inspection', 45)`,
      [dealCode, offer2.insertId, listingIdMap['l14'], farmerIdMap['f2'], enterpriseIdMap['e3'], cropIdMap['kesar-mango']]
    );
    const dealId = dealRes.insertId;

    // Deal status history
    await connection.query(
      `INSERT INTO deal_status_history (deal_id, from_status, to_status, note, updated_by)
       VALUES (?, 'deal_signed', 'advance_paid', 'Advance payment of ₹1,80,000 received via NEFT', ?)`,
      [dealId, enterpriseIdMap['e3']]
    );
    await connection.query(
      `INSERT INTO deal_status_history (deal_id, from_status, to_status, note, updated_by)
       VALUES (?, 'advance_paid', 'inspection', 'APEDA inspector assigned for quality check', ?)`,
      [dealId, adminId]
    );

    // Deal documents
    await connection.query(
      `INSERT INTO deal_documents (deal_id, title, doc_type, file_url, uploaded_by)
       VALUES (?, 'Sales Contract #SC-2026-001', 'contract', '/docs/contracts/SC-001.pdf', ?)`,
      [dealId, enterpriseIdMap['e3']]
    );
    await connection.query(
      `INSERT INTO deal_documents (deal_id, title, doc_type, file_url, uploaded_by)
       VALUES (?, 'APEDA Quality & Brix Test Report', 'lab_report', '/docs/reports/APEDA-9921.pdf', ?)`,
      [dealId, farmerIdMap['f2']]
    );

    // 9. Seed Messages
    console.log('💬 Seeding Messages...');
    const convoId = `deal_${dealId}`;
    await connection.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, deal_id, content)
       VALUES (?, ?, ?, ?, 'Hello Bhavna Ben, we have confirmed the 2 Tons order. The crates will arrive tomorrow morning.')`,
      [convoId, enterpriseIdMap['e3'], farmerIdMap['f2'], dealId]
    );
    await connection.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, deal_id, content)
       VALUES (?, ?, ?, ?, 'Namaste! The harvest is ready and packed in 3kg cartons. Looking forward to the inspection.')`,
      [convoId, farmerIdMap['f2'], enterpriseIdMap['e3'], dealId]
    );

    // 10. Seed Mandi Prices
    console.log('📊 Seeding Mandi Prices...');
    const mandiSeed = [
      { crop: 'jeera', market: 'Unjha', district: 'Mehsana', modal: 31800, min: 28500, max: 34500, trend: 'up', change: 2.5, arrivals: 145 },
      { crop: 'groundnut', market: 'Rajkot', district: 'Rajkot', modal: 6500, min: 5800, max: 7200, trend: 'up', change: 1.2, arrivals: 320 },
      { crop: 'sesame', market: 'Rajkot', district: 'Rajkot', modal: 16200, min: 14800, max: 17800, trend: 'up', change: 2.1, arrivals: 85 },
      { crop: 'castor', market: 'Deesa', district: 'Banaskantha', modal: 11600, min: 10800, max: 12800, trend: 'up', change: 1.8, arrivals: 210 },
      { crop: 'isabgol', market: 'Unjha', district: 'Mehsana', modal: 14800, min: 12500, max: 16500, trend: 'up', change: 2.7, arrivals: 95 },
      { crop: 'cotton', market: 'Rajkot', district: 'Rajkot', modal: 6100, min: 5600, max: 6800, trend: 'stable', change: 0.5, arrivals: 540 },
      { crop: 'kesar-mango', market: 'Junagadh', district: 'Junagadh', modal: 18800, min: 16000, max: 22000, trend: 'up', change: 4.2, arrivals: 60 },
      { crop: 'banana', market: 'Anand', district: 'Anand', modal: 2600, min: 1800, max: 3200, trend: 'up', change: 1.5, arrivals: 180 },
      { crop: 'onion', market: 'Mahuva', district: 'Bhavnagar', modal: 2800, min: 1800, max: 3800, trend: 'up', change: 3.1, arrivals: 420 },
      { crop: 'garlic', market: 'Gondal', district: 'Rajkot', modal: 11200, min: 8000, max: 14000, trend: 'up', change: 3.6, arrivals: 110 },
      { crop: 'wheat', market: 'Rajkot', district: 'Rajkot', modal: 2400, min: 2200, max: 2700, trend: 'stable', change: 0.2, arrivals: 600 },
      { crop: 'bajra', market: 'Surendranagar', district: 'Surendranagar', modal: 2200, min: 2000, max: 2500, trend: 'stable', change: 0.4, arrivals: 250 },
    ];

    const todayDate = new Date().toISOString().split('T')[0];
    for (const m of mandiSeed) {
      const cId = cropIdMap[m.crop];
      if (!cId) continue;
      await connection.query(
        `INSERT INTO mandi_prices (crop_id, market_name, district, state, modal_price, min_price, max_price, arrivals_tonnes, price_date, trend, change_percent)
         VALUES (?, ?, ?, 'Gujarat', ?, ?, ?, ?, ?, ?, ?)`,
        [cId, m.market, m.district, m.modal, m.min, m.max, m.arrivals, todayDate, m.trend, m.change]
      );
    }

    // 11. Seed Export Guides
    console.log('📚 Seeding Export Guides...');
    const guides = [
      {
        slug: 'jeera-export-guide',
        title: 'Comprehensive Guide: Exporting Gujarat Jeera to UAE & Gulf',
        crop: 'jeera',
        category: 'Spices',
        summary: 'Step-by-step export protocol for Unjha Cumin to Middle Eastern destinations with APEDA compliance.',
        countries: ['UAE', 'Saudi Arabia', 'Qatar', 'Oman'],
        checklist: ['APEDA Spice Board RCMC', 'Phytosanitary Certificate', 'EIC Lab Moisture & Purity Test', 'Certificate of Origin'],
      },
      {
        slug: 'kesar-mango-uk-airfreight',
        title: 'GI-Tagged Kesar Mango: Airfreight Export to UK & Canada',
        crop: 'kesar-mango',
        category: 'Fruits & Horticulture',
        summary: 'Packhouse Hot Water Treatment (HWT), phytosanitary inspection, and cold-chain air cargo SOPs.',
        countries: ['UK', 'Canada', 'Germany'],
        checklist: ['GI Authority Registration', 'APEDA Packhouse HWT Certificate', 'NPPO Phytosanitary Inspection', 'GlobalGAP (if applicable)'],
      },
      {
        slug: 'groundnut-vietnam-confectionery',
        title: 'Groundnut Bold 40/50 Export to Vietnam & SE Asia',
        crop: 'groundnut',
        category: 'Oilseeds',
        summary: 'Aflatoxin management (<4ppb), vacuum packaging, container moisture control for ocean transit.',
        countries: ['Vietnam', 'Indonesia', 'Malaysia', 'Philippines'],
        checklist: ['NABL Accredited Aflatoxin Test Report', 'FSSAI Export License', 'Fumigation Certificate', 'Bill of Lading'],
      },
    ];

    for (const g of guides) {
      const cId = cropIdMap[g.crop] || null;
      await connection.query(
        `INSERT INTO export_guides (slug, title, crop_id, category, summary, destination_countries, document_checklist)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [g.slug, g.title, cId, g.category, g.summary, JSON.stringify(g.countries), JSON.stringify(g.checklist)]
      );
    }

    // 12. Seed Announcements
    console.log('📢 Seeding Announcements...');
    await connection.query(
      `INSERT INTO announcements (title, message, target_role, is_banner)
       VALUES ('Gujarat Jeera Season 2026-27 Begins', 'Farmers can list produce with APEDA certified grading. Bumper crop expected in Mehsana and Patan regions.', 'all', true)`
    );
    await connection.query(
      `INSERT INTO announcements (title, message, target_role, is_banner)
       VALUES ('Fast-Track GST & IEC Verification', 'Enterprise document verification turnaround time is now under 24 hours.', 'enterprise', false)`
    );

    // 13. Seed Notifications
    console.log('🔔 Seeding Notifications...');
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'New Offer Received', 'Ahmed Spice Exports sent you a new offer for Jeera – ₹308/kg', 'offer', '/farmer/offers')`,
      [farmerIdMap['f1']]
    );
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Deal Progress Update', 'Your Kesar Mango deal #DEAL-2026-001 has entered Quality Inspection stage', 'deal', '/farmer/deals')`,
      [farmerIdMap['f2']]
    );
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Pending Verification Documents', '5 new farmers and 2 enterprises submitted verification documents for review', 'verify', '/admin/verifications')`,
      [adminId]
    );

    await connection.commit();
    console.log('✅ Database seeded successfully with realistic data!');
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}
