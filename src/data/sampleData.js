// ============================================================
//  AgriExport Connect – Full Realistic Gujarat Agricultural Data
//  ⚠️  All prices are INDICATIVE and for demonstration only.
//  Data last refreshed: October 2026
//  Sources: AGMARKNET, IndiaMART, APEDA (indicative / unverified)
// ============================================================

export const CROPS = [
  { id: 'groundnut', name: 'Groundnut', emoji: '🥜', price: 65, unit: 'kg', grade: 'Bold 40/50' },
  { id: 'jeera', name: 'Jeera (Cumin)', emoji: '🌿', price: 318, unit: 'kg', grade: 'Premium Bold' },
  { id: 'sesame', name: 'Sesame (Til)', emoji: '🌱', price: 162, unit: 'kg', grade: 'Natural White 99/1' },
  { id: 'castor', name: 'Castor Seeds', emoji: '🟤', price: 116, unit: 'kg', grade: 'FAQ' },
  { id: 'isabgol', name: 'Isabgol', emoji: '🌾', price: 148, unit: 'kg', grade: 'Husk 99%' },
  { id: 'cotton', name: 'Cotton (Kapas)', emoji: '🌸', price: 61, unit: 'kg', grade: 'Shankar-6' },
  { id: 'kesar-mango', name: 'Kesar Mango', emoji: '🥭', price: 188, unit: 'kg', grade: 'Export A' },
  { id: 'banana', name: 'Banana', emoji: '🍌', price: 26, unit: 'kg', grade: 'Grand Naine' },
  { id: 'onion', name: 'Onion', emoji: '🧅', price: 28, unit: 'kg', grade: 'Export Grade A' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄', price: 112, unit: 'kg', grade: 'Export Sortex' },
  { id: 'wheat', name: 'Wheat (Ghau)', emoji: '🌾', price: 24, unit: 'kg', grade: 'Bold FAQ' },
  { id: 'bajra', name: 'Bajra (Pearl Millet)', emoji: '🟡', price: 22, unit: 'kg', grade: 'Bold' },
];

export const FARMERS = [
  { id: 'f1', name: 'Ramesh Patel', village: 'Unjha', district: 'Mehsana', state: 'Gujarat', phone: '9876543210', land: '12 bigha', crops: ['jeera', 'isabgol'], rating: 4.8, reviews: 34, verified: true, avatar: '🧑‍🌾', since: '2023', listings: 4, activeDeals: 2 },
  { id: 'f2', name: 'Bhavna Ben Desai', village: 'Talala Gir', district: 'Junagadh', state: 'Gujarat', phone: '9765432109', land: '8 bigha', crops: ['kesar-mango', 'banana'], rating: 4.6, reviews: 21, verified: true, avatar: '👩‍🌾', since: '2024', listings: 3, activeDeals: 1 },
  { id: 'f3', name: 'Karsan Bhai Solanki', village: 'Viramgam', district: 'Ahmedabad', state: 'Gujarat', phone: '9654321098', land: '20 bigha', crops: ['cotton', 'castor', 'groundnut'], rating: 4.4, reviews: 18, verified: true, avatar: '🧑‍🌾', since: '2023', listings: 5, activeDeals: 0 },
  { id: 'f4', name: 'Geeta Vaghela', village: 'Gondal', district: 'Rajkot', state: 'Gujarat', phone: '9543210987', land: '6 bigha', crops: ['groundnut', 'sesame'], rating: 4.9, reviews: 12, verified: false, avatar: '👩‍🌾', since: '2024', listings: 2, activeDeals: 0 },
  { id: 'f5', name: 'Harsukhbhai Mer', village: 'Mahuva', district: 'Bhavnagar', state: 'Gujarat', phone: '9432109876', land: '14 bigha', crops: ['onion', 'garlic'], rating: 4.5, reviews: 29, verified: true, avatar: '🧑‍🌾', since: '2022', listings: 3, activeDeals: 1 },
  { id: 'f6', name: 'Jagruti Barot', village: 'Patan', district: 'Patan', state: 'Gujarat', phone: '9321098765', land: '10 bigha', crops: ['jeera', 'wheat'], rating: 4.3, reviews: 9, verified: true, avatar: '👩‍🌾', since: '2024', listings: 2, activeDeals: 0 },
  { id: 'f7', name: 'Dhruv Chauhan', village: 'Surendranagar', district: 'Surendranagar', state: 'Gujarat', phone: '9210987654', land: '22 bigha', crops: ['cotton', 'bajra', 'wheat'], rating: 4.7, reviews: 41, verified: true, avatar: '🧑‍🌾', since: '2022', listings: 4, activeDeals: 2 },
  { id: 'f8', name: 'Shantaben Rabari', village: 'Deesa', district: 'Banaskantha', state: 'Gujarat', phone: '9109876543', land: '16 bigha', crops: ['castor', 'isabgol'], rating: 4.2, reviews: 7, verified: false, avatar: '👩‍🌾', since: '2025', listings: 2, activeDeals: 0 },
];

export const ENTERPRISES = [
  { id: 'e1', name: 'Ahmed Spice Exports', type: 'Exporter', city: 'Ahmedabad', country: 'India', countries: ['UAE', 'Saudi Arabia', 'UK', 'USA'], flags: ['🇦🇪', '🇸🇦', '🇬🇧', '🇺🇸'], crops: ['jeera', 'isabgol', 'sesame'], minOrder: '5 MT', gst: '24AAACA1234B1Z5', iec: 'AAACA1234B', rating: 4.7, reviews: 52, verified: true, logo: '🌶️', since: '2012' },
  { id: 'e2', name: 'Patel Agro Traders', type: 'Trader', city: 'Rajkot', country: 'India', countries: ['India', 'Vietnam', 'Indonesia'], flags: ['🇮🇳', '🇻🇳', '🇮🇩'], crops: ['groundnut', 'sesame', 'castor'], minOrder: '10 MT', gst: '24AAACB5678C2Z6', iec: 'AAACB5678C', rating: 4.5, reviews: 38, verified: true, logo: '🌱', since: '2015' },
  { id: 'e3', name: 'Kesar Mango World Pvt Ltd', type: 'Exporter', city: 'Junagadh', country: 'India', countries: ['UAE', 'UK', 'Canada', 'Germany'], flags: ['🇦🇪', '🇬🇧', '🇨🇦', '🇩🇪'], crops: ['kesar-mango', 'banana'], minOrder: '1 MT', gst: '24AAACE9012D3Z7', iec: 'AAACE9012D', rating: 4.9, reviews: 87, verified: true, logo: '🥭', since: '2008' },
  { id: 'e4', name: 'Gujarat Agro Grain Corp', type: 'Processor', city: 'Surat', country: 'India', countries: ['India', 'Bangladesh'], flags: ['🇮🇳', '🇧🇩'], crops: ['wheat', 'bajra', 'castor'], minOrder: '20 MT', gst: '24AAACD3456E4Z8', iec: 'AAACD3456E', rating: 4.2, reviews: 24, verified: true, logo: '🌾', since: '2018' },
  { id: 'e5', name: 'Saurashtra Oil Industries', type: 'Processor', city: 'Rajkot', country: 'India', countries: ['India'], flags: ['🇮🇳'], crops: ['groundnut', 'castor', 'sesame'], minOrder: '10 MT', gst: '24AAACE7890F5Z9', iec: '', rating: 4.1, reviews: 16, verified: true, logo: '🏭', since: '2010' },
  { id: 'e6', name: 'Nexus Agro Exports Ltd', type: 'Exporter', city: 'Ahmedabad', country: 'India', countries: ['Japan', 'South Korea', 'China'], flags: ['🇯🇵', '🇰🇷', '🇨🇳'], crops: ['sesame', 'isabgol', 'castor'], minOrder: '5 MT', gst: '24AABCN1234F1Z5', iec: 'AABCN1234F', rating: 4.6, reviews: 31, verified: true, logo: '🏢', since: '2014' },
  { id: 'e7', name: 'Gir Valley Fruit Exports', type: 'Exporter', city: 'Junagadh', country: 'India', countries: ['UAE', 'Qatar', 'Saudi Arabia'], flags: ['🇦🇪', '🇶🇦', '🇸🇦'], crops: ['kesar-mango', 'banana', 'onion'], minOrder: '500 kg', gst: '24AAACG5555H2Z3', iec: 'AAACG5555H', rating: 4.4, reviews: 19, verified: true, logo: '🌴', since: '2019' },
  { id: 'e8', name: 'Mahuva Onion Traders', type: 'Trader', city: 'Bhavnagar', country: 'India', countries: ['ME', 'Sri Lanka', 'Bangladesh'], flags: ['🇦🇪', '🇱🇰', '🇧🇩'], crops: ['onion', 'garlic'], minOrder: '5 MT', gst: '24AAACH7777J3Z4', iec: 'AAACH7777J', rating: 4.3, reviews: 22, verified: true, logo: '🧅', since: '2016' },
  { id: 'e9', name: 'Cotton Crown Trading Co', type: 'Trader', city: 'Surat', country: 'India', countries: ['Bangladesh', 'Vietnam', 'Pakistan'], flags: ['🇧🇩', '🇻🇳', '🇵🇰'], crops: ['cotton'], minOrder: '20 MT', gst: '24AAACI8888K4Z5', iec: 'AAACI8888K', rating: 4.0, reviews: 11, verified: true, logo: '🌸', since: '2017' },
  { id: 'e10', name: 'Shree Laxmi Agro Foods', type: 'Processor', city: 'Gondal', country: 'India', countries: ['India', 'ME'], flags: ['🇮🇳', '🇦🇪'], crops: ['groundnut', 'garlic', 'onion'], minOrder: '2 MT', gst: '24AAACJ2222L5Z6', iec: 'AAACJ2222L', rating: 4.5, reviews: 28, verified: true, logo: '🍱', since: '2013' },
  { id: 'e11', name: 'BioFresh India Pvt Ltd', type: 'Exporter', city: 'Ahmedabad', country: 'India', countries: ['Germany', 'Netherlands', 'France'], flags: ['🇩🇪', '🇳🇱', '🇫🇷'], crops: ['jeera', 'sesame', 'isabgol'], minOrder: '1 MT', gst: '24AAACK3333M6Z7', iec: 'AAACK3333M', rating: 4.8, reviews: 44, verified: true, logo: '🌿', since: '2011' },
];

export const BUYER_REQUIREMENTS = [
  { id: 'br1', enterpriseId: 'e1', enterpriseName: 'Ahmed Spice Exports', buyerType: 'Export House', verified: true, logo: '🌶️', title: 'Require 15 Tons Premium Unjha Jeera for UAE Shipment', crop: 'jeera', cropName: 'Jeera (Cumin)', emoji: '🌿', qty: 15, unit: 'ton', minLot: '2 MT', targetPrice: 322, priceRange: '₹318–₹325 / kg', destination: 'UAE (Dubai)', flag: '🇦🇪', urgency: 'urgent', urgencyLabel: 'Urgent Requirement', specs: { purity: '99.5% Machine Cleaned (Singapore Quality)', moisture: 'Below 8%', grade: 'Premium Bold', packaging: '50 kg PP / Jute bags' }, deliveryTerms: 'Ex-Farm Pickup or Unjha APMC delivery', paymentTerms: '30% Advance, 70% on weight slip', posted: '1 day ago', deadline: '2026-10-20', quotesCount: 8, phone: '+91 98250 11223', city: 'Unjha / Ahmedabad', notes: 'Urgent shipment for Jebel Ali port. Ready produce preferred. Farmgate inspection available.',},
  { id: 'br2', enterpriseId: 'e2', enterpriseName: 'Patel Agro Traders', buyerType: 'Major Trader', verified: true, logo: '🌱', title: 'Need 25 Tons Groundnut Bold 40/50 for Vietnam', crop: 'groundnut', cropName: 'Groundnut (Mungfali)', emoji: '🥜', qty: 25, unit: 'ton', minLot: '5 MT', targetPrice: 68, priceRange: '₹65–₹70 / kg', destination: 'Vietnam & Indonesia', flag: '🇻🇳', urgency: 'high-volume', urgencyLabel: 'High Volume Demand', specs: { count: '40/50 Kernels/ounce', moisture: 'Max 7.0%', aflatoxin: 'Below 4 ppb (Export)', packaging: '25 kg vacuum bags' }, deliveryTerms: 'Rajkot Warehouse or Gondal Yard', paymentTerms: '48 hrs after quality approval', posted: '2 days ago', deadline: '2026-10-28', quotesCount: 14, phone: '+91 98240 55667', city: 'Rajkot / Gondal', notes: 'SE Asian confectionery buyers. High quality sorting required.',},
  { id: 'br3', enterpriseId: 'e3', enterpriseName: 'Kesar Mango World Pvt Ltd', buyerType: 'Govt Recognized Exporter', verified: true, logo: '🥭', title: '5 Tons GI-Tagged Kesar Mango for UK Airfreight', crop: 'kesar-mango', cropName: 'Kesar Mango', emoji: '🥭', qty: 5, unit: 'ton', minLot: '500 kg', targetPrice: 188, priceRange: '₹180–₹195 / kg', destination: 'UK & Canada', flag: '🇬🇧', urgency: 'urgent', urgencyLabel: 'Air Freight Urgent', specs: { grade: 'Export A (GI Registered)', brix: 'Min 20°+', weight: '220–300g per fruit', treatment: 'HWT / APEDA packhouse approved' }, deliveryTerms: 'Farm pickup in Junagadh / Talala Gir', paymentTerms: '100% on crate loading', posted: '3 hours ago', deadline: '2026-10-15', quotesCount: 6, phone: '+91 97250 88990', city: 'Junagadh', notes: 'Crates provided by buyer. Same-day payment guaranteed.',},
  { id: 'br4', enterpriseId: 'e6', enterpriseName: 'Nexus Agro Exports Ltd', buyerType: 'Export House', verified: true, logo: '🏢', title: '20 Tons Natural White Sesame 99/1 for Japan', crop: 'sesame', cropName: 'Sesame (Til)', emoji: '🌱', qty: 20, unit: 'ton', minLot: '2 MT', targetPrice: 165, priceRange: '₹160–₹168 / kg', destination: 'Japan & South Korea', flag: '🇯🇵', urgency: 'active', urgencyLabel: 'Active Requirement', specs: { purity: '99/1 Sortex Cleaned', oilContent: 'Min 48%', moisture: 'Max 6%', packaging: '25 kg bags inner poly' }, deliveryTerms: 'Rajkot APMC or Mundra CFS', paymentTerms: 'NEFT within 24 hours', posted: '4 days ago', deadline: '2026-10-31', quotesCount: 9, phone: '+91 99090 12345', city: 'Rajkot', notes: 'Long-term contract farmers preferred for Rabi season too.',},
  { id: 'br5', enterpriseId: 'e4', enterpriseName: 'Gujarat Agro Grain Corp', buyerType: 'Agro Processor', verified: true, logo: '🌾', title: '40 Tons Castor Seeds (High Oil) for Oil Processing', crop: 'castor', cropName: 'Castor Seeds', emoji: '🟤', qty: 40, unit: 'ton', minLot: '5 MT', targetPrice: 118, priceRange: '₹115–₹122 / kg', destination: 'Domestic (Surat / Deesa)', flag: '🇮🇳', urgency: 'high-volume', urgencyLabel: 'High Volume Demand', specs: { oilContent: 'Min 48.5%', moisture: 'Max 6.5%', foreignMatter: 'Max 1.0%', packaging: 'Gunny bags / Loose' }, deliveryTerms: 'Mill delivery at Surat / Deesa', paymentTerms: 'On arrival + lab test', posted: '5 days ago', deadline: '2026-11-10', quotesCount: 18, phone: '+91 98790 33445', city: 'Surat / Deesa', notes: 'High oil content lots get bonus ₹2/kg.',},
  { id: 'br6', enterpriseId: 'e11', enterpriseName: 'BioFresh India Pvt Ltd', buyerType: 'EU Organic Exporter', verified: true, logo: '🌿', title: '8 Tons Isabgol Husk 99% for Germany (Organic)', crop: 'isabgol', cropName: 'Isabgol (Psyllium)', emoji: '🌾', qty: 8, unit: 'ton', minLot: '1 MT', targetPrice: 158, priceRange: '₹152–₹162 / kg', destination: 'Germany & Netherlands', flag: '🇩🇪', urgency: 'urgent', urgencyLabel: 'Organic Urgent', specs: { purity: '99%+ Husk', swellingFactor: 'Min 45 ml/g', certification: 'NPOP / EU Organic', packaging: '25 kg food-grade bags' }, deliveryTerms: 'Unjha warehouse pickup', paymentTerms: '100% advance on bill', posted: '2 days ago', deadline: '2026-10-22', quotesCount: 5, phone: '+91 99250 67890', city: 'Unjha / Ahmedabad', notes: 'Organic certificate + heavy metals test mandatory.',},
  { id: 'br7', enterpriseId: 'e8', enterpriseName: 'Mahuva Onion Traders', buyerType: 'Export Trader', verified: true, logo: '🧅', title: '30 Tons Gujarat Red Onion (Export Grade A) for UAE', crop: 'onion', cropName: 'Onion (Dungri)', emoji: '🧅', qty: 30, unit: 'ton', minLot: '5 MT', targetPrice: 32, priceRange: '₹28–₹35 / kg', destination: 'UAE & Sri Lanka', flag: '🇦🇪', urgency: 'active', urgencyLabel: 'Regular Demand', specs: { size: '60mm+ diameter', moisture: 'Max 85%', dryNeck: 'Fully Dry Neck', packaging: '25 kg mesh bags' }, deliveryTerms: 'Mahuva or Bhavnagar yard delivery', paymentTerms: '50% advance, 50% on LR', posted: '3 days ago', deadline: '2026-11-05', quotesCount: 12, phone: '+91 98760 44332', city: 'Mahuva / Bhavnagar', notes: 'Regular monthly requirement through season.',},
  { id: 'br8', enterpriseId: 'e10', enterpriseName: 'Shree Laxmi Agro Foods', buyerType: 'Processor / Exporter', verified: true, logo: '🍱', title: '10 Tons Export Sortex Garlic for ME Markets', crop: 'garlic', cropName: 'Garlic (Lasan)', emoji: '🧄', qty: 10, unit: 'ton', minLot: '2 MT', targetPrice: 118, priceRange: '₹112–₹125 / kg', destination: 'UAE & Qatar', flag: '🇦🇪', urgency: 'active', urgencyLabel: 'Active Requirement', specs: { bulbSize: '40mm+ Export Sortex', moisture: 'Max 65%', variety: 'Hybrid G-1 or G-3', packaging: '10 kg mesh bags' }, deliveryTerms: 'Gondal / Rajkot warehouse', paymentTerms: '25% advance, rest on loading', posted: '1 week ago', deadline: '2026-11-15', quotesCount: 7, phone: '+91 97240 88776', city: 'Gondal', notes: 'Good-looking, well-sheathed bulbs essential.',},
];

// ============================================================
//  LISTINGS – 40+ realistic produce listings across all 12 crops
//  ⚠️  All prices INDICATIVE. Fictional people & companies only.
// ============================================================
export const LISTINGS = [
  // --- JEERA ---
  { id: 'l1', farmerId: 'f1', crop: 'jeera', cropName: 'Jeera (Cumin)', qty: 8, unit: 'ton', price: 315, grade: 'Premium Bold', organic: true, exportReady: true, district: 'Mehsana', village: 'Unjha', state: 'Gujarat', status: 'active', offers: 4, photos: ['🌿', '🌿', '📦'], description: 'High-quality Unjha Premium Jeera. Sun-dried, hand-cleaned, 99.5% purity. FSSAI certified. Available from Oct 15.', posted: '2 days ago', expires: '2026-11-01', specs: { purity: '99.5%', moisture: 'Max 7%', volatileOil: '2.8%', packaging: '50 kg PP Bags' } },
  { id: 'l2', farmerId: 'f6', crop: 'jeera', cropName: 'Jeera (Cumin)', qty: 5, unit: 'ton', price: 298, grade: 'FAQ', organic: false, exportReady: false, district: 'Patan', village: 'Patan', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌿', '📦'], description: 'Patan district jeera, FAQ grade, machine cleaned. Good aroma. Suitable for domestic spice traders.', posted: '4 days ago', expires: '2026-11-10', specs: { purity: '97%', moisture: 'Max 9%', volatileOil: '2.2%', packaging: '50 kg Jute Bags' } },
  // --- GROUNDNUT ---
  { id: 'l3', farmerId: 'f3', crop: 'groundnut', cropName: 'Groundnut', qty: 15, unit: 'ton', price: 65, grade: 'Bold 40/50', organic: false, exportReady: true, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 6, photos: ['🥜', '🥜', '📦'], description: 'Viramgam Bold 40/50 groundnut. Machine-sorted, aflatoxin <4ppb tested. Ideal for SE Asia export.', posted: '1 day ago', expires: '2026-10-30', specs: { count: '40/50', moisture: 'Max 7%', aflatoxin: 'Below 4 ppb', packaging: '25 kg Vacuum Bags' } },
  { id: 'l4', farmerId: 'f4', crop: 'groundnut', cropName: 'Groundnut', qty: 6, unit: 'ton', price: 60, grade: 'Java 60/70', organic: false, exportReady: false, district: 'Rajkot', village: 'Gondal', state: 'Gujarat', status: 'active', offers: 2, photos: ['🥜', '📦'], description: 'Gondal Java groundnut, 60/70 count, suitable for oil extraction or confectionery.', posted: '5 days ago', expires: '2026-11-05', specs: { count: '60/70', moisture: 'Max 8%', oilContent: '46%', packaging: '50 kg Jute Bags' } },
  { id: 'l5', farmerId: 'f3', crop: 'groundnut', cropName: 'Groundnut', qty: 20, unit: 'ton', price: 58, grade: 'Domestic Oil Grade', organic: false, exportReady: false, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'sold', offers: 3, photos: ['🥜', '📦'], description: 'Bulk domestic oil-grade groundnut, TJ-11 variety. Direct from farm, loose truck delivery.', posted: '2 weeks ago', expires: '2026-10-20', specs: { variety: 'TJ-11', moisture: 'Max 9%', oilContent: '44%', packaging: 'Loose Truck' } },
  // --- SESAME ---
  { id: 'l6', farmerId: 'f4', crop: 'sesame', cropName: 'Sesame (Til)', qty: 4, unit: 'ton', price: 162, grade: 'Natural White 99/1', organic: true, exportReady: true, district: 'Rajkot', village: 'Gondal', state: 'Gujarat', status: 'active', offers: 5, photos: ['🌱', '🌱', '📦'], description: 'Organic certified natural white sesame, 99/1 sortex, oil content 49%+. Suitable for Japan/Korea.', posted: '3 days ago', expires: '2026-11-08', specs: { purity: '99/1', moisture: 'Max 5%', oilContent: '49%+', packaging: '25 kg Inner Poly Bags' } },
  { id: 'l7', farmerId: 'f3', crop: 'sesame', cropName: 'Sesame (Til)', qty: 3, unit: 'ton', price: 155, grade: 'Machine Cleaned', organic: false, exportReady: false, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌱', '📦'], description: 'Machine-cleaned white sesame. Good oil content. Domestic traders / processors welcome.', posted: '1 week ago', expires: '2026-11-20', specs: { purity: '98%', moisture: 'Max 7%', oilContent: '47%', packaging: '50 kg Jute Bags' } },
  // --- CASTOR ---
  { id: 'l8', farmerId: 'f8', crop: 'castor', cropName: 'Castor Seeds', qty: 10, unit: 'ton', price: 116, grade: 'Bold High Oil (GCH-7)', organic: false, exportReady: false, district: 'Banaskantha', village: 'Deesa', state: 'Gujarat', status: 'active', offers: 7, photos: ['🟤', '📦'], description: 'GCH-7 castor, high oil 49.2%. New crop 2026. Available at Deesa. Lab report available.', posted: '2 days ago', expires: '2026-11-01', specs: { variety: 'GCH-7', oilContent: '49.2%', moisture: 'Max 6%', packaging: 'Gunny Bags' } },
  { id: 'l9', farmerId: 'f3', crop: 'castor', cropName: 'Castor Seeds', qty: 7, unit: 'ton', price: 112, grade: 'FAQ', organic: false, exportReady: false, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 3, photos: ['🟤', '📦'], description: 'FAQ castor seeds, Jwala variety. Loose truck load available for crushing mills.', posted: '6 days ago', expires: '2026-11-10', specs: { variety: 'Jwala', oilContent: '47.5%', moisture: 'Max 7%', packaging: 'Loose Truck' } },
  // --- ISABGOL ---
  { id: 'l10', farmerId: 'f1', crop: 'isabgol', cropName: 'Isabgol', qty: 5, unit: 'ton', price: 150, grade: 'Husk 99% Organic', organic: true, exportReady: true, district: 'Mehsana', village: 'Unjha', state: 'Gujarat', status: 'active', offers: 4, photos: ['🌾', '🌾', '📦'], description: 'NPOP certified organic isabgol husk, 99% purity, swelling factor 45+. EU export ready.', posted: '1 day ago', expires: '2026-10-28', specs: { purity: '99%', swellingFactor: '45+ ml/g', moisture: 'Max 8%', packaging: '25 kg Food-Grade Bags' } },
  { id: 'l11', farmerId: 'f8', crop: 'isabgol', cropName: 'Isabgol', qty: 3, unit: 'ton', price: 138, grade: 'Husk 85%', organic: false, exportReady: false, district: 'Banaskantha', village: 'Deesa', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌾', '📦'], description: 'Isabgol husk 85% grade. Domestic pharma/FMCGs. Good swelling factor.', posted: '1 week ago', expires: '2026-11-20', specs: { purity: '85%', swellingFactor: '38+ ml/g', moisture: 'Max 10%', packaging: '25 kg Bags' } },
  // --- COTTON ---
  { id: 'l12', farmerId: 'f3', crop: 'cotton', cropName: 'Cotton (Kapas)', qty: 25, unit: 'ton', price: 62, grade: 'Shankar-6 (29mm)', organic: false, exportReady: false, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 2, photos: ['🌸', '📦'], description: 'Shankar-6 cotton kapas, 29mm staple, ginning outturn 38%. Fresh from field, low trash.', posted: '3 days ago', expires: '2026-11-15', specs: { variety: 'Shankar-6', stapleLenght: '29mm', ginnigOutturn: '38%', packaging: 'Loose Truck' } },
  { id: 'l13', farmerId: 'f7', crop: 'cotton', cropName: 'Cotton (Kapas)', qty: 40, unit: 'ton', price: 63, grade: 'Shankar-6 (30mm+)', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 5, photos: ['🌸', '🌸', '📦'], description: 'Premium Shankar-6 long staple cotton, 30mm+, GO 39%. Suitable for spinning mills.', posted: '1 day ago', expires: '2026-11-20', specs: { variety: 'Shankar-6', stapleLenght: '30mm+', ginnigOutturn: '39%', packaging: '50 kg Gunny Bags' } },
  // --- KESAR MANGO ---
  { id: 'l14', farmerId: 'f2', crop: 'kesar-mango', cropName: 'Kesar Mango', qty: 3, unit: 'ton', price: 185, grade: 'Export Grade A', organic: false, exportReady: true, district: 'Junagadh', village: 'Talala Gir', state: 'Gujarat', status: 'active', offers: 8, photos: ['🥭', '🥭', '📦'], description: 'GI-tagged Gir Kesar mangoes from Talala. Brix 22°+. HWT done. 3 kg export cartons available.', posted: '5 days ago', expires: '2026-10-30', specs: { grade: 'Export A (GI)', brix: '22°+', weight: '250–300g', treatment: 'HWT' } },
  { id: 'l15', farmerId: 'f2', crop: 'kesar-mango', cropName: 'Kesar Mango', qty: 1, unit: 'ton', price: 165, grade: 'Domestic Premium', organic: false, exportReady: false, district: 'Junagadh', village: 'Talala Gir', state: 'Gujarat', status: 'active', offers: 2, photos: ['🥭', '📦'], description: 'Domestic premium Kesar mangoes, Brix 20°+. B-grade fruit size. Good for retail gifting boxes.', posted: '1 week ago', expires: '2026-10-28', specs: { grade: 'Domestic Premium', brix: '20°+', weight: '180–220g', treatment: 'Untreated' } },
  // --- BANANA ---
  { id: 'l16', farmerId: 'f2', crop: 'banana', cropName: 'Banana', qty: 8, unit: 'ton', price: 26, grade: 'Grand Naine Export A', organic: false, exportReady: true, district: 'Junagadh', village: 'Talala Gir', state: 'Gujarat', status: 'active', offers: 3, photos: ['🍌', '🍌', '📦'], description: 'Grand Naine bananas, 18–22cm finger, export grade. 13 kg CFB boxes available. Phytosanitary ready.', posted: '2 days ago', expires: '2026-10-22', specs: { variety: 'Grand Naine', fingerLength: '18–22cm', maturity: '75% (export)', packaging: '13 kg CFB Boxes' } },
  { id: 'l17', farmerId: 'f5', crop: 'banana', cropName: 'Banana', qty: 5, unit: 'ton', price: 22, grade: 'Robusta Domestic', organic: false, exportReady: false, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 1, photos: ['🍌', '📦'], description: 'Robusta banana, domestic market grade. Ripe supply possible within 5 days of harvesting.', posted: '4 days ago', expires: '2026-10-20', specs: { variety: 'Robusta', fingerLength: '15–18cm', maturity: 'Full Green', packaging: '15 kg Local Crates' } },
  // --- ONION ---
  { id: 'l18', farmerId: 'f5', crop: 'onion', cropName: 'Onion', qty: 20, unit: 'ton', price: 30, grade: 'Export Grade A (60mm+)', organic: false, exportReady: true, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 9, photos: ['🧅', '🧅', '📦'], description: 'Gujarat Red onion, Export Grade A, 60mm+, dry neck. MRL test done. 25 kg mesh bags.', posted: '1 day ago', expires: '2026-11-01', specs: { size: '60–70mm', moisture: 'Max 82%', dryNeck: 'Fully Dry Neck', packaging: '25 kg Mesh Bags' } },
  { id: 'l19', farmerId: 'f5', crop: 'onion', cropName: 'Onion', qty: 12, unit: 'ton', price: 24, grade: 'Grade B (40–60mm)', organic: false, exportReady: false, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 4, photos: ['🧅', '📦'], description: 'Grade B onion, medium size 40–60mm. Domestic wholesale market quality.', posted: '3 days ago', expires: '2026-11-08', specs: { size: '40–60mm', moisture: 'Max 85%', dryNeck: 'Semi-dry', packaging: '25 kg Mesh Bags' } },
  { id: 'l20', farmerId: 'f7', crop: 'onion', cropName: 'Onion', qty: 15, unit: 'ton', price: 28, grade: 'Export Grade A', organic: false, exportReady: true, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 6, photos: ['🧅', '🧅', '📦'], description: 'Surendranagar Gujarat Red onion 60mm+. Export grade. Available for immediate loading.', posted: '2 days ago', expires: '2026-11-05', specs: { size: '60mm+', moisture: 'Max 80%', dryNeck: 'Fully Dry Neck', packaging: '25 kg Mesh Bags' } },
  // --- GARLIC ---
  { id: 'l21', farmerId: 'f5', crop: 'garlic', cropName: 'Garlic', qty: 8, unit: 'ton', price: 120, grade: 'Export Sortex (40mm+)', organic: false, exportReady: true, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 7, photos: ['🧄', '🧄', '📦'], description: 'G-1 hybrid garlic, 40mm+ sortex cleaned, fully sheathed. MRL tested. 10 kg mesh bags.', posted: '2 days ago', expires: '2026-11-02', specs: { bulbSize: '40–50mm', moisture: 'Max 62%', variety: 'Hybrid G-1', packaging: '10 kg Mesh Bags' } },
  { id: 'l22', farmerId: 'f5', crop: 'garlic', cropName: 'Garlic', qty: 5, unit: 'ton', price: 100, grade: 'Medium (25–40mm)', organic: false, exportReady: false, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 2, photos: ['🧄', '📦'], description: 'Medium grade garlic, 25–40mm. Good for domestic market processing.', posted: '1 week ago', expires: '2026-11-15', specs: { bulbSize: '25–40mm', moisture: 'Max 65%', variety: 'Desi', packaging: '20 kg Bags' } },
  // --- WHEAT ---
  { id: 'l23', farmerId: 'f6', crop: 'wheat', cropName: 'Wheat', qty: 30, unit: 'ton', price: 25, grade: 'Bold FAQ (GW-322)', organic: false, exportReady: false, district: 'Patan', village: 'Patan', state: 'Gujarat', status: 'active', offers: 3, photos: ['🌾', '📦'], description: 'GW-322 bold wheat, 60g TKW+, protein 11.5%. Good for flour mills. 50 kg jute bags.', posted: '3 days ago', expires: '2026-11-20', specs: { variety: 'GW-322', moisture: 'Max 12%', protein: '11.5%', packaging: '50 kg Jute Bags' } },
  { id: 'l24', farmerId: 'f7', crop: 'wheat', cropName: 'Wheat', qty: 50, unit: 'ton', price: 24, grade: 'Standard', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 2, photos: ['🌾', '📦'], description: 'Standard grade wheat, Lok-1 variety. Bulk truck delivery available. Suitable for flour mills.', posted: '5 days ago', expires: '2026-12-01', specs: { variety: 'Lok-1', moisture: 'Max 12%', protein: '10.5%', packaging: '50 kg HDPE Bags' } },
  { id: 'l25', farmerId: 'f6', crop: 'wheat', cropName: 'Wheat', qty: 10, unit: 'ton', price: 27, grade: 'Sharbati Premium', organic: false, exportReady: false, district: 'Patan', village: 'Patan', state: 'Gujarat', status: 'sold', offers: 5, photos: ['🌾', '📦'], description: 'Sharbati premium wheat. High protein 12.5%. Premium bakeries only.', posted: '2 weeks ago', expires: '2026-10-15', specs: { variety: 'Sharbati', moisture: 'Max 10%', protein: '12.5%', packaging: '50 kg Jute Bags' } },
  // --- BAJRA ---
  { id: 'l26', farmerId: 'f7', crop: 'bajra', cropName: 'Bajra (Pearl Millet)', qty: 40, unit: 'ton', price: 22, grade: 'Bold GHB-719', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 4, photos: ['🟡', '📦'], description: 'GHB-719 bold bajra, 98% purity. Good for poultry feed and domestic flour. 50 kg bags.', posted: '2 days ago', expires: '2026-11-30', specs: { variety: 'GHB-719', moisture: 'Max 12%', purity: '98%', packaging: '50 kg Jute Bags' } },
  { id: 'l27', farmerId: 'f7', crop: 'bajra', cropName: 'Bajra (Pearl Millet)', qty: 20, unit: 'ton', price: 20, grade: 'Animal Feed Grade', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 1, photos: ['🟡', '📦'], description: 'Feed grade bajra. Moisture tested. Suitable for ME animal feed export via traders.', posted: '1 week ago', expires: '2026-12-01', specs: { variety: 'Mixed', moisture: 'Max 14%', purity: '94%', packaging: 'Bulk Truck' } },
  // --- MORE LISTINGS TO HIT 40+ ---
  { id: 'l28', farmerId: 'f1', crop: 'jeera', cropName: 'Jeera (Cumin)', qty: 12, unit: 'ton', price: 310, grade: 'Machine Cleaned (99%)', organic: false, exportReady: true, district: 'Mehsana', village: 'Unjha', state: 'Gujarat', status: 'active', offers: 2, photos: ['🌿', '📦'], description: 'Machine cleaned jeera, 99% purity, Unjha origin. Saudi/UAE shipment ready.', posted: '1 week ago', expires: '2026-11-15', specs: { purity: '99%', moisture: 'Max 8%', volatileOil: '2.5%', packaging: '50 kg PP Bags' } },
  { id: 'l29', farmerId: 'f8', crop: 'castor', cropName: 'Castor Seeds', qty: 8, unit: 'ton', price: 113, grade: 'New Crop (GCH-4)', organic: false, exportReady: false, district: 'Banaskantha', village: 'Deesa', state: 'Gujarat', status: 'active', offers: 4, photos: ['🟤', '📦'], description: 'New crop GCH-4 castor, Deesa. Oil content 48.2%. Available from Oct 10.', posted: '3 days ago', expires: '2026-11-10', specs: { variety: 'GCH-4', oilContent: '48.2%', moisture: 'Max 6.5%', packaging: 'Gunny Bags' } },
  { id: 'l30', farmerId: 'f4', crop: 'sesame', cropName: 'Sesame (Til)', qty: 2, unit: 'ton', price: 168, grade: 'Natural White 99.5', organic: true, exportReady: true, district: 'Rajkot', village: 'Gondal', state: 'Gujarat', status: 'active', offers: 3, photos: ['🌱', '📦'], description: 'Premium 99.5/0.5 natural white sesame, Organic certified (NPOP). Japan export ready.', posted: '2 days ago', expires: '2026-11-12', specs: { purity: '99.5/0.5', moisture: 'Max 5%', oilContent: '50%+', packaging: '25 kg Inner Poly' } },
  { id: 'l31', farmerId: 'f2', crop: 'kesar-mango', cropName: 'Kesar Mango', qty: 2, unit: 'ton', price: 175, grade: 'Export Grade B', organic: false, exportReady: true, district: 'Junagadh', village: 'Talala Gir', state: 'Gujarat', status: 'active', offers: 3, photos: ['🥭', '📦'], description: 'Export B grade Kesar mango, 180–220g, Brix 20°. Good for value-market exports.', posted: '6 days ago', expires: '2026-10-28', specs: { grade: 'Export B (GI)', brix: '20°', weight: '180–220g', treatment: 'HWT' } },
  { id: 'l32', farmerId: 'f3', crop: 'cotton', cropName: 'Cotton (Kapas)', qty: 15, unit: 'ton', price: 60, grade: 'BT Cotton Medium', organic: false, exportReady: false, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌸', '📦'], description: 'BT cotton medium staple 27mm. Suitable for domestic ginning mills.', posted: '5 days ago', expires: '2026-11-25', specs: { variety: 'BT Cotton', stapleLenght: '27mm', ginnigOutturn: '36%', packaging: 'Loose Truck' } },
  { id: 'l33', farmerId: 'f6', crop: 'isabgol', cropName: 'Isabgol', qty: 2, unit: 'ton', price: 145, grade: 'Husk 99% (Non-organic)', organic: false, exportReady: false, district: 'Patan', village: 'Patan', state: 'Gujarat', status: 'active', offers: 2, photos: ['🌾', '📦'], description: 'Standard isabgol husk 99%, swelling factor 42+. Domestic pharma / food grade.', posted: '1 week ago', expires: '2026-11-15', specs: { purity: '99%', swellingFactor: '42+ ml/g', moisture: 'Max 9%', packaging: '25 kg Bags' } },
  { id: 'l34', farmerId: 'f5', crop: 'onion', cropName: 'Onion', qty: 10, unit: 'ton', price: 26, grade: 'Grade B', organic: false, exportReady: false, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'sold', offers: 5, photos: ['🧅', '📦'], description: 'Medium grade onion sold to local trader. For reference only.', posted: '2 weeks ago', expires: '2026-10-01', specs: { size: '40–60mm', moisture: 'Max 88%', dryNeck: 'Semi-dry', packaging: '50 kg Jute Bags' } },
  { id: 'l35', farmerId: 'f5', crop: 'garlic', cropName: 'Garlic', qty: 3, unit: 'ton', price: 130, grade: 'G-3 Export (50mm+)', organic: false, exportReady: true, district: 'Bhavnagar', village: 'Mahuva', state: 'Gujarat', status: 'active', offers: 4, photos: ['🧄', '📦'], description: 'G-3 garlic 50mm+ jumbo sortex. Premium price. ME markets. MRL tested.', posted: '4 days ago', expires: '2026-11-08', specs: { bulbSize: '50mm+', moisture: 'Max 60%', variety: 'Hybrid G-3', packaging: '10 kg Mesh Bags' } },
  { id: 'l36', farmerId: 'f7', crop: 'wheat', cropName: 'Wheat', qty: 25, unit: 'ton', price: 23, grade: 'Feed / Mill Grade', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌾', '📦'], description: 'Feed grade wheat, minor impurities, suitable for large flour mills at lower price.', posted: '1 week ago', expires: '2026-11-25', specs: { variety: 'Mixed', moisture: 'Max 14%', protein: '9.5%', packaging: 'Bulk Truck' } },
  { id: 'l37', farmerId: 'f1', crop: 'isabgol', cropName: 'Isabgol', qty: 4, unit: 'ton', price: 132, grade: 'Whole Seed (Biji)', organic: false, exportReady: false, district: 'Mehsana', village: 'Unjha', state: 'Gujarat', status: 'active', offers: 1, photos: ['🌾', '📦'], description: 'Isabgol whole seed (biji) for husk processing units. Good swelling. Bulk available.', posted: '5 days ago', expires: '2026-11-20', specs: { purity: 'Whole Seed', swellingFactor: '30+ ml/g', moisture: 'Max 12%', packaging: '50 kg Bags' } },
  { id: 'l38', farmerId: 'f4', crop: 'groundnut', cropName: 'Groundnut', qty: 4, unit: 'ton', price: 62, grade: 'Bold 50/60', organic: true, exportReady: false, district: 'Rajkot', village: 'Gondal', state: 'Gujarat', status: 'active', offers: 2, photos: ['🥜', '📦'], description: 'Organic bold 50/60 groundnut. NPOP certified. Suitable for organic processors.', posted: '3 days ago', expires: '2026-11-10', specs: { count: '50/60', moisture: 'Max 8%', oilContent: '46%', packaging: '25 kg Jute Bags' } },
  { id: 'l39', farmerId: 'f3', crop: 'sesame', cropName: 'Sesame (Til)', qty: 5, unit: 'ton', price: 158, grade: 'Natural White 99/1', organic: false, exportReady: true, district: 'Ahmedabad', village: 'Viramgam', state: 'Gujarat', status: 'active', offers: 3, photos: ['🌱', '📦'], description: 'Machine sortex white sesame 99/1. Suitable for China and SE Asia. Available at Rajkot.', posted: '4 days ago', expires: '2026-11-15', specs: { purity: '99/1', moisture: 'Max 6%', oilContent: '48%', packaging: '25 kg Inner Poly' } },
  { id: 'l40', farmerId: 'f2', crop: 'banana', cropName: 'Banana', qty: 3, unit: 'ton', price: 24, grade: 'Dwarf Cavendish', organic: false, exportReady: false, district: 'Junagadh', village: 'Talala Gir', state: 'Gujarat', status: 'active', offers: 1, photos: ['🍌', '📦'], description: 'Dwarf Cavendish banana, domestic market. Good shelf life. Direct from farm.', posted: '6 days ago', expires: '2026-10-25', specs: { variety: 'Dwarf Cavendish', fingerLength: '14–18cm', maturity: 'Full Green', packaging: '15 kg Local Crates' } },
  { id: 'l41', farmerId: 'f8', crop: 'castor', cropName: 'Castor Seeds', qty: 5, unit: 'ton', price: 110, grade: 'FAQ (Aruna)', organic: false, exportReady: false, district: 'Banaskantha', village: 'Deesa', state: 'Gujarat', status: 'active', offers: 2, photos: ['🟤', '📦'], description: 'Aruna variety castor FAQ, clean, moisture tested. Available from Deesa.', posted: '5 days ago', expires: '2026-11-20', specs: { variety: 'Aruna', oilContent: '47%', moisture: 'Max 7%', packaging: 'Gunny Bags' } },
  { id: 'l42', farmerId: 'f7', crop: 'bajra', cropName: 'Bajra', qty: 10, unit: 'ton', price: 23, grade: 'GHB-558 Bold', organic: false, exportReady: false, district: 'Surendranagar', village: 'Surendranagar', state: 'Gujarat', status: 'active', offers: 1, photos: ['🟡', '📦'], description: 'GHB-558 bajra, 97% purity. Rabi 2026 crop. Domestic traders.', posted: '1 week ago', expires: '2026-11-28', specs: { variety: 'GHB-558', moisture: 'Max 12%', purity: '97%', packaging: '50 kg Jute Bags' } },
];

export const OFFERS = [
  { id: 'o1', listingId: 'l1', enterpriseId: 'e1', enterpriseName: 'Ahmed Spice Exports', offeredPrice: 308, expectedPrice: 315, qty: 5, unit: 'ton', deliveryTerms: 'Farm pickup', paymentTerms: '50% advance, 50% on delivery', validity: '2026-10-10', message: 'Interested in Unjha jeera. We export to UAE regularly.', status: 'new', sentAt: '2 hours ago' },
  { id: 'o2', listingId: 'l14', enterpriseId: 'e3', enterpriseName: 'Kesar Mango World Pvt Ltd', offeredPrice: 180, expectedPrice: 185, qty: 2, unit: 'ton', deliveryTerms: 'Pickup from farm', paymentTerms: '100% advance', validity: '2026-10-08', message: 'We have export orders from UAE. Brix 22°+ confirmed?', status: 'accepted', sentAt: '1 day ago' },
  { id: 'o3', listingId: 'l1', enterpriseId: 'e11', enterpriseName: 'BioFresh India Pvt Ltd', offeredPrice: 320, expectedPrice: 315, qty: 8, unit: 'ton', deliveryTerms: 'Delivered to Unjha warehouse', paymentTerms: '100% advance', validity: '2026-10-15', message: 'Need organic certified jeera for Germany. Can you match our EU specs?', status: 'countered', counterPrice: 322, sentAt: '3 days ago' },
  { id: 'o4', listingId: 'l3', enterpriseId: 'e2', enterpriseName: 'Patel Agro Traders', offeredPrice: 63, expectedPrice: 65, qty: 10, unit: 'ton', deliveryTerms: 'Rajkot warehouse', paymentTerms: '48 hrs after lab clearance', validity: '2026-10-20', message: 'Groundnut for Vietnam export. Aflatoxin test report must be attached.', status: 'new', sentAt: '5 hours ago' },
];

export const DEALS = [
  { id: 'd1', offerId: 'o2', farmerId: 'f2', enterpriseId: 'e3', farmerName: 'Bhavna Ben Desai', enterpriseName: 'Kesar Mango World Pvt Ltd', crop: 'Kesar Mango', qty: '2 ton', value: '₹3,60,000', status: 'in-transit', timeline: [{ label: 'Deal Agreed', date: '28 Sep 2026', done: true }, { label: 'Picked Up', date: '30 Sep 2026', done: true }, { label: 'In Transit', date: '01 Oct 2026', done: true, active: true }, { label: 'Delivered', date: 'Expected 4 Oct', done: false }, { label: 'Completed', date: '', done: false }] },
];

// ============================================================
//  MANDI PRICES – 90 days history for all 12 crops
//  Generated: Oct 2026 | ⚠️  INDICATIVE DATA
// ============================================================

// Helper to generate 90-day date labels
function genDates(days) {
  const dates = [];
  const base = new Date('2026-10-04');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function randWalk(start, volatility, days) {
  const prices = [start];
  for (let i = 1; i < days; i++) {
    const delta = (Math.random() - 0.49) * volatility;
    prices.push(Math.round((prices[i - 1] + delta) * 10) / 10);
  }
  return prices;
}

const DAYS = 90;
const DATE_LABELS = genDates(DAYS);

export const MANDI_PRICES_HISTORY = {
  dates: DATE_LABELS,
  crops: [
    { id: 'jeera', name: 'Jeera', mandi: 'Unjha', unit: 'kg', today: 318, weekAgo: 310, highest90: 345, lowest90: 285, change: +8, prices: randWalk(310, 8, DAYS) },
    { id: 'groundnut', name: 'Groundnut', mandi: 'Rajkot', unit: 'kg', today: 65, weekAgo: 63, highest90: 72, lowest90: 58, change: +2, prices: randWalk(62, 2, DAYS) },
    { id: 'sesame', name: 'Sesame', mandi: 'Rajkot', unit: 'kg', today: 162, weekAgo: 158, highest90: 178, lowest90: 148, change: +4, prices: randWalk(158, 4, DAYS) },
    { id: 'castor', name: 'Castor', mandi: 'Deesa', unit: 'kg', today: 116, weekAgo: 113, highest90: 128, lowest90: 108, change: +3, prices: randWalk(112, 3, DAYS) },
    { id: 'isabgol', name: 'Isabgol', mandi: 'Unjha', unit: 'kg', today: 148, weekAgo: 144, highest90: 165, lowest90: 125, change: +4, prices: randWalk(144, 5, DAYS) },
    { id: 'cotton', name: 'Cotton', mandi: 'Rajkot', unit: 'kg', today: 61, weekAgo: 60, highest90: 68, lowest90: 56, change: +1, prices: randWalk(60, 2, DAYS) },
    { id: 'kesar-mango', name: 'Kesar Mango', mandi: 'Junagadh', unit: 'kg', today: 188, weekAgo: 180, highest90: 220, lowest90: 160, change: +8, prices: randWalk(180, 7, DAYS) },
    { id: 'banana', name: 'Banana', mandi: 'Anand', unit: 'kg', today: 26, weekAgo: 24, highest90: 32, lowest90: 18, change: +2, prices: randWalk(24, 2, DAYS) },
    { id: 'onion', name: 'Onion', mandi: 'Mahuva', unit: 'kg', today: 28, weekAgo: 26, highest90: 38, lowest90: 18, change: +2, prices: randWalk(26, 3, DAYS) },
    { id: 'garlic', name: 'Garlic', mandi: 'Gondal', unit: 'kg', today: 112, weekAgo: 108, highest90: 140, lowest90: 80, change: +4, prices: randWalk(108, 5, DAYS) },
    { id: 'wheat', name: 'Wheat', mandi: 'Rajkot', unit: 'kg', today: 24, weekAgo: 23, highest90: 27, lowest90: 22, change: +1, prices: randWalk(23, 0.5, DAYS) },
    { id: 'bajra', name: 'Bajra', mandi: 'Surendranagar', unit: 'kg', today: 22, weekAgo: 21, highest90: 25, lowest90: 20, change: +1, prices: randWalk(21, 0.5, DAYS) },
  ],
};

// Legacy flat MANDI_PRICES (for backward compat)
export const MANDI_PRICES = MANDI_PRICES_HISTORY.crops.map(c => ({
  crop: c.name, mandi: c.mandi, today: c.today, week: c.weekAgo, highest: c.highest90, change: c.change,
}));

// ============================================================
//  EXPORT GUIDE – English & Gujarati, all 12 crops
// ============================================================
const BASE_STEPS_EN = [
  { id: 1, title: 'Get IEC Code (DGFT)', desc: 'Import Export Code from DGFT online at dgft.gov.in. One-time registration, cost ~₹500. Mandatory for all exports.' },
  { id: 2, title: 'APEDA / SPICE BOARD Registration', desc: 'Register as an exporter at apeda.gov.in (horticulture/grain/spice). Required for horticultural and spice products.' },
  { id: 3, title: 'GST LUT Filing', desc: 'File Letter of Undertaking (LUT) for zero-rated export supply. Do this before shipment on the GST portal.' },
  { id: 4, title: 'Phytosanitary Certificate', desc: 'Apply at your State Agriculture Department. Valid 14 days. Required by all importing countries for plant produce.' },
  { id: 5, title: 'Quality / Lab Testing', desc: 'Get EIC (Export Inspection Council) or NABL-accredited lab test for parameters like moisture, purity, aflatoxin, MRL etc.' },
  { id: 6, title: 'Packing & Marking', desc: 'Pack as per importing country norms. Clearly mark country of origin, gross/net weight, exporter details.' },
  { id: 7, title: 'Shipping Bill on ICEGATE', desc: 'File your shipping bill online at icegate.gov.in via a licensed CHA (Customs House Agent). Nearest port: Mundra / JNPT.' },
  { id: 8, title: 'BRC / FIRC', desc: 'After payment received, get Bank Realisation Certificate (BRC) / FIRC from your bank and file with DGFT for export incentives.' },
];

export const EXPORT_GUIDE = [
  { crop: 'Jeera', cropId: 'jeera', country: 'UAE / Saudi Arabia', flag: '🇦🇪', certifications: ['APEDA Spice Registration', 'Phytosanitary', 'EIC Lab Test', 'IEC Code'], tips: 'Unjha APMC is the pricing benchmark. 99.5% MC preferred by Arab markets. Bold size earns premium.', steps: BASE_STEPS_EN },
  { crop: 'Groundnut', cropId: 'groundnut', country: 'Vietnam / Indonesia', flag: '🇻🇳', certifications: ['Aflatoxin Lab Report (<4ppb)', 'Phytosanitary', 'APEDA Registration', 'IEC Code'], tips: 'Aflatoxin <4ppb mandatory for EU/SE Asia. Vacuum packing extends shelf life. 40/50 count fetches best price.', steps: BASE_STEPS_EN },
  { crop: 'Sesame', cropId: 'sesame', country: 'Japan / South Korea', flag: '🇯🇵', certifications: ['Non-GMO Certificate', 'Phytosanitary', 'FFA Lab Test', 'IEC Code'], tips: 'Japan requires stringent pesticide residue checks. Sortex 99.5/0.5 commands premium. Oil content 48%+ critical.', steps: BASE_STEPS_EN },
  { crop: 'Castor', cropId: 'castor', country: 'Domestic Processing', flag: '🇮🇳', certifications: ['Oil Content Lab Report', 'FSSAI (if food-use)'], tips: 'Castor seeds mainly processed domestically. Oil then exported. Higher oil content = better mill price.', steps: BASE_STEPS_EN.slice(0, 5) },
  { crop: 'Isabgol', cropId: 'isabgol', country: 'Germany / USA', flag: '🇩🇪', certifications: ['NPOP Organic Cert (if organic)', 'Phytosanitary', 'Heavy Metals Test', 'IEC Code'], tips: 'India supplies ~80% of global isabgol. EU requires organic + no heavy metals. Swelling factor ≥40 mandatory.', steps: BASE_STEPS_EN },
  { crop: 'Cotton', cropId: 'cotton', country: 'Bangladesh / Vietnam', flag: '🇧🇩', certifications: ['CCI Quality Certificate', 'Ginning Outturn Lab', 'GST Documents'], tips: 'Shankar-6 is India\'s dominant export variety. Lint/yarn exports need separate registration.', steps: BASE_STEPS_EN.slice(0, 6) },
  { crop: 'Kesar Mango', cropId: 'kesar-mango', country: 'UK / UAE / Canada', flag: '🇬🇧', certifications: ['GI Tag Certificate', 'APEDA Packhouse Approval', 'HWT Certificate', 'Phytosanitary', 'IEC Code'], tips: 'Only APEDA-approved packhouses can do HWT. GI tag = premium brand. Air freight window: May–July mainly.', steps: BASE_STEPS_EN },
  { crop: 'Banana', cropId: 'banana', country: 'UAE / Qatar', flag: '🇦🇪', certifications: ['Phytosanitary', 'Pesticide Residue MRL Test', 'IEC Code'], tips: 'Ripening rooms used by importers. Export at 75% maturity. 13 kg CFB box is global export standard.', steps: BASE_STEPS_EN.slice(0, 7) },
  { crop: 'Onion', cropId: 'onion', country: 'UAE / Sri Lanka', flag: '🇦🇪', certifications: ['Phytosanitary', 'MRL Pesticide Test', 'APEDA Registration', 'IEC Code'], tips: 'Export policy can change — check DGFT notifications. 60mm+ export grade essential. Dry neck reduces rot.', steps: BASE_STEPS_EN },
  { crop: 'Garlic', cropId: 'garlic', country: 'UAE / Qatar', flag: '🇦🇪', certifications: ['Phytosanitary', 'MRL Test', 'APEDA Registration', 'IEC Code'], tips: 'ME markets prefer well-sheathed large bulbs. 40mm+ sortex essential. Cold chain helps shelf life.', steps: BASE_STEPS_EN },
  { crop: 'Wheat', cropId: 'wheat', country: 'ME / Africa (limited)', flag: '🇸🇦', certifications: ['Phytosanitary', 'FSSAI', 'IEC Code'], tips: 'Wheat export subject to DGFT policy. Check export/OGL status before contracting. Protein content key for ME.', steps: BASE_STEPS_EN.slice(0, 6) },
  { crop: 'Bajra', cropId: 'bajra', country: 'ME (Animal Feed)', flag: '🇦🇪', certifications: ['Phytosanitary', 'FSSAI', 'IEC Code'], tips: 'Bajra mainly exported for animal feed via traders. Moisture control critical in storage.', steps: BASE_STEPS_EN.slice(0, 6) },
];

export const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Gujarat Jeera Season 2026-27 Begins', body: 'Farmers can list jeera from October 1. Expected bumper crop this year in Unjha region.', audience: 'All', date: '01 Oct 2026', active: true },
  { id: 'a2', title: 'Verification TAT Reduced to 48 Hours', body: 'We have hired 2 additional verification officers for faster approvals.', audience: 'All', date: '28 Sep 2026', active: true },
  { id: 'a3', title: 'New Export Guide for Kesar Mango Published', body: 'Comprehensive step-by-step export guide for UK and UAE markets now live.', audience: 'Farmers', date: '25 Sep 2026', active: true },
  { id: 'a4', title: 'Castor Price Alert – Deesa Mandi Up ₹5', body: 'Castor prices at Deesa APMC rose ₹5/kg this week. Update your listing prices accordingly.', audience: 'Farmers', date: '03 Oct 2026', active: true },
];

export const NOTIFICATIONS = [
  { id: 'n1', type: 'offer', icon: '💼', text: 'Ahmed Spice Exports sent you a new offer for Jeera – ₹308/kg', time: '2h ago', read: false },
  { id: 'n2', type: 'deal', icon: '🤝', text: 'Your deal with Kesar Mango World is now In Transit', time: '5h ago', read: false },
  { id: 'n3', type: 'verify', icon: '✅', text: 'Your account has been verified by Admin', time: '1 day ago', read: true },
  { id: 'n4', type: 'price', icon: '📈', text: 'Jeera price in Unjha mandi is up ₹8/kg today', time: '1 day ago', read: true },
  { id: 'n5', type: 'offer', icon: '💼', text: 'BioFresh India countered your jeera offer – ₹322/kg', time: '3 days ago', read: true },
  { id: 'n6', type: 'price', icon: '📉', text: 'Cotton prices steady at ₹61/kg in Rajkot', time: '4 days ago', read: true },
];

export const ADMIN_STATS = {
  farmers: 1284,
  enterprises: 342,
  listings: 3891,
  offers: 8240,
  deals: 1627,
  pendingVerifications: 23,
  openComplaints: 7,
};

export const CHART_DATA = {
  userGrowth: [
    { month: 'May', farmers: 820, enterprises: 210 },
    { month: 'Jun', farmers: 940, enterprises: 248 },
    { month: 'Jul', farmers: 1050, enterprises: 278 },
    { month: 'Aug', farmers: 1130, enterprises: 298 },
    { month: 'Sep', farmers: 1220, enterprises: 325 },
    { month: 'Oct', farmers: 1284, enterprises: 342 },
  ],
  dealsByStatus: [
    { name: 'Completed', value: 1120, color: '#2F7D32' },
    { name: 'In Transit', value: 280, color: '#F9A825' },
    { name: 'Accepted', value: 160, color: '#1565C0' },
    { name: 'Pending', value: 67, color: '#9CA3AF' },
  ],
  topCrops: [
    { crop: 'Jeera', value: 42 },
    { crop: 'Groundnut', value: 28 },
    { crop: 'Kesar Mango', value: 18 },
    { crop: 'Cotton', value: 14 },
    { crop: 'Castor', value: 12 },
    { crop: 'Sesame', value: 9 },
    { crop: 'Onion', value: 8 },
    { crop: 'Garlic', value: 6 },
  ],
};

export const LIVE_COUNTERS = [
  { label: 'Farmers Registered', value: 1284, suffix: '+' },
  { label: 'Verified Enterprises', value: 342, suffix: '+' },
  { label: 'Active Listings', value: 3891, suffix: '+' },
  { label: 'Deals Completed', value: 1627, suffix: '+' },
];

export const PENDING_VERIFICATIONS = [
  { id: 'pv1', name: 'Jayesh Patel', type: 'Farmer', avatar: '🧑‍🌾', village: 'Patan', district: 'Patan', phone: '9812345678', aadhaar: 'XXXX-XXXX-3412', land: '8 bigha', crops: 'Jeera, Isabgol', status: 'pending', appliedAt: '30 Sep 2026', docs: [{ name: 'Aadhaar Card', icon: '🪪' }, { name: '7/12 Land Record', icon: '📄' }, { name: 'Farm Photo', icon: '📷' }] },
  { id: 'pv2', name: 'Meera Devi Yadav', type: 'Farmer', avatar: '👩‍🌾', village: 'Morbi', district: 'Morbi', phone: '9723456789', aadhaar: 'XXXX-XXXX-5521', land: '14 bigha', crops: 'Cotton, Castor', status: 'pending', appliedAt: '29 Sep 2026', docs: [{ name: 'Aadhaar Card', icon: '🪪' }, { name: '7/12 Land Record', icon: '📄' }] },
  { id: 'pv3', name: 'Nexus Agro Exports Ltd', type: 'Enterprise', avatar: '🏢', village: 'Ahmedabad', district: 'Ahmedabad', phone: '9634567890', aadhaar: 'N/A', gst: '24AABCN1234F1Z5', iec: 'AABCN1234F', status: 'pending', appliedAt: '28 Sep 2026', docs: [{ name: 'GST Certificate', icon: '📋' }, { name: 'IEC Certificate', icon: '✈️' }, { name: 'Company Incorporation', icon: '🏛️' }] },
  { id: 'pv4', name: 'Dhruv Chauhan', type: 'Farmer', avatar: '🧑‍🌾', village: 'Surendranagar', district: 'Surendranagar', phone: '9543678901', aadhaar: 'XXXX-XXXX-8891', land: '22 bigha', crops: 'Cotton, Wheat, Bajra', status: 'approved', appliedAt: '25 Sep 2026', docs: [{ name: 'Aadhaar Card', icon: '🪪' }, { name: '7/12 Land Record', icon: '📄' }] },
  { id: 'pv5', name: 'Shantaben Rabari', type: 'Farmer', avatar: '👩‍🌾', village: 'Deesa', district: 'Banaskantha', phone: '9109876543', aadhaar: 'XXXX-XXXX-2291', land: '16 bigha', crops: 'Castor, Isabgol', status: 'pending', appliedAt: '03 Oct 2026', docs: [{ name: 'Aadhaar Card', icon: '🪪' }, { name: '7/12 Land Record', icon: '📄' }, { name: 'Farm Photo', icon: '📷' }] },
];
