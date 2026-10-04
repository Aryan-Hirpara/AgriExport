import { createContext, useContext, useState, useEffect } from 'react';
import { BUYER_REQUIREMENTS, ENTERPRISES, LISTINGS } from '../data/sampleData';

const AppContext = createContext();

const INITIAL_QUOTES = {
  br1: [
    {
      id: 'q1',
      farmerId: 'f1',
      farmerName: 'Ramesh Patel',
      village: 'Unjha',
      district: 'Mehsana',
      phone: '+91 98765 43210',
      rating: 4.8,
      reviews: 34,
      verified: true,
      avatar: '🧑‍🌾',
      land: '12 bigha',
      since: '2023',
      qty: 5,
      price: 320,
      total: 1600000,
      delivery: 'pickup',
      deliveryLabel: 'Ex-Farm Pickup',
      date: 'Immediate (Within 48h)',
      payment: '30% Advance, 70% on weight slip',
      notes: 'Unjha Premium Jeera ready in warehouse. Sun-dried and machine-cleaned.',
      dateSubmitted: '2 hours ago',
      status: 'pending',
      lotSpecs: {
        grade: 'Premium Bold (Export Singapore 99.5%)',
        purity: '99.5% Machine Cleaned',
        moisture: '7.2% (Well below 8% limit)',
        volatileOil: '2.9% (Tested)',
        packaging: '50 kg PP / Jute bags with inner poly',
        labCertificate: 'Agmarknet / NABL Accredited Lab Certificate #AG-9921',
        warehouseLocation: 'APMC Ganj Bazar Warehouse #14, Unjha',
        dispatchReadiness: 'Ready for loading (Within 48h)',
      },
    },
    {
      id: 'q2',
      farmerId: 'f2',
      farmerName: 'Bhavna Ben Desai',
      village: 'Junagadh',
      district: 'Junagadh',
      phone: '+91 97654 32109',
      rating: 4.6,
      reviews: 21,
      verified: true,
      avatar: '👩‍🌾',
      land: '8 bigha',
      since: '2024',
      qty: 3,
      price: 322,
      total: 966000,
      delivery: 'delivery',
      deliveryLabel: 'Mandi Delivery',
      date: 'Within 1 Week',
      payment: 'Payment within 48h of quality approval',
      notes: 'Clean lots with lab report. Premium Gujarat crop.',
      dateSubmitted: '5 hours ago',
      status: 'pending',
      lotSpecs: {
        grade: 'Premium Machine Cleaned 99%',
        purity: '99.0% Double Filtered',
        moisture: '7.6%',
        volatileOil: '2.6%',
        packaging: '50 kg PP bags',
        labCertificate: 'Gujarat State Seed Testing Lab Report #GJ-884',
        warehouseLocation: 'Junagadh Central Yard / Dispatch to Unjha',
        dispatchReadiness: 'Dispatch within 3-5 days',
      },
    },
  ],
  br2: [
    {
      id: 'q3',
      farmerId: 'f3',
      farmerName: 'Karsan Bhai Solanki',
      village: 'Viramgam',
      district: 'Ahmedabad',
      phone: '+91 96543 21098',
      rating: 4.4,
      reviews: 18,
      verified: true,
      avatar: '🧑‍🌾',
      land: '20 bigha',
      since: '2023',
      qty: 15,
      price: 67,
      total: 1005000,
      delivery: 'pickup',
      deliveryLabel: 'Ex-Farm Pickup',
      date: 'Immediate',
      payment: '50% advance, 50% on weight slip',
      notes: '40/50 count groundnuts sorted and bagged.',
      dateSubmitted: '1 day ago',
      status: 'pending',
      lotSpecs: {
        grade: 'Bold 40/50 Export Confectionery',
        count: '40/50 Kernels/ounce',
        moisture: '6.5% (Max 7.0%)',
        aflatoxin: 'Below 2 ppb (Export EU/Vietnam Grade)',
        packaging: '25 kg vacuum bags',
        labCertificate: 'Export Certified Lab Test #VT-5501',
        warehouseLocation: 'Viramgam APMC Yard',
        dispatchReadiness: 'Immediate dispatch',
      },
    },
  ],
  br3: [
    {
      id: 'q4',
      farmerId: 'f2',
      farmerName: 'Bhavna Ben Desai',
      village: 'Talala Gir',
      district: 'Junagadh',
      phone: '+91 97654 32109',
      rating: 4.9,
      reviews: 28,
      verified: true,
      avatar: '👩‍🌾',
      land: '8 bigha',
      since: '2024',
      qty: 2,
      price: 185,
      total: 370000,
      delivery: 'pickup',
      deliveryLabel: 'Farm pickup in Talala Gir',
      date: 'Immediate (Harvest Ready)',
      payment: '100% on crate loading',
      notes: 'GI Registered Talala Gir Kesar mangoes. Tree-ripened, Brix 22°+ guaranteed.',
      dateSubmitted: '1 hour ago',
      status: 'pending',
      lotSpecs: {
        grade: 'Export A (GI Tagged Talala Gir)',
        brix: '22°+ natural sweetness',
        weight: '240–280g per fruit',
        treatment: 'Hot Water Treated (HWT) APEDA approved packhouse',
        packaging: '3 kg export cartons with foam sleeves',
        labCertificate: 'GI Authority Certificate #GI-TAL-2026',
        warehouseLocation: 'Talala Gir Farm Gate Packhouse',
        dispatchReadiness: 'Ready for same-day harvest loading',
      },
    },
  ],
};

// Initial requirements with pre-attached quotes
const PREPARED_REQUIREMENTS = BUYER_REQUIREMENTS.map(req => ({
  ...req,
  quotes: INITIAL_QUOTES[req.id] || [],
  quotesCount: (INITIAL_QUOTES[req.id] || []).length || req.quotesCount || 0,
}));

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(null); // 'farmer' | 'enterprise' | 'admin' | null
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 'n1', type: 'offer', icon: '💼', text: 'Ahmed Spice Exports sent you a new offer for Jeera – ₹308/kg', time: '2h ago', read: false },
    { id: 'n2', type: 'deal', icon: '🤝', text: 'Your deal with Kesar Mango World is now In Transit', time: '5h ago', read: false },
    { id: 'n3', type: 'verify', icon: '✅', text: 'Your account has been verified by Admin', time: '1 day ago', read: true },
    { id: 'n4', type: 'price', icon: '📈', text: 'Jeera price in Unjha mandi is up ₹7/kg today', time: '1 day ago', read: true },
    { id: 'n5', type: 'offer', icon: '💼', text: 'Patel Agro Traders countered your offer – ₹310/kg', time: '3 days ago', read: true },
  ]);

  // Shared Buyer Requirements State
  const [buyerRequirements, setBuyerRequirements] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_buyer_requirements_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with PREPARED_REQUIREMENTS to ensure quotes and rich specs are never lost
          return parsed.map(req => {
            const prep = PREPARED_REQUIREMENTS.find(p => p.id === req.id);
            if (!prep) return req;
            const prepQuotes = prep.quotes || [];
            const mergedQuotes = (req.quotes && req.quotes.length > 0 ? req.quotes : prepQuotes).map(q => {
              const matchedPrepQuote = prepQuotes.find(pq => pq.id === q.id);
              return {
                ...(matchedPrepQuote || {}),
                ...q,
                lotSpecs: {
                  ...(matchedPrepQuote?.lotSpecs || {}),
                  ...(q.lotSpecs || {}),
                },
              };
            });
            return {
              ...prep,
              ...req,
              quotes: mergedQuotes,
              quotesCount: mergedQuotes.length || req.quotesCount || 0,
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return PREPARED_REQUIREMENTS;
  });

  // Shared Produce Listings State
  const [produceListings, setProduceListings] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_produce_listings_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      ...LISTINGS,
      {
        id: 'l5',
        farmerId: 'f1',
        crop: 'cotton',
        cropName: 'Cotton (Kapas)',
        qty: 10,
        unit: 'ton',
        price: 64,
        grade: 'Medium',
        organic: false,
        exportReady: false,
        district: 'Mehsana',
        village: 'Unjha',
        status: 'draft',
        offers: 0,
        photos: ['🌾', '📦'],
        description: 'Clean gin-ready cotton from fresh harvest.',
        posted: 'Draft',
        expires: '2026-11-30',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('agri_produce_listings_v2', JSON.stringify(produceListings));
    } catch (e) {
      console.error(e);
    }
  }, [produceListings]);

  // Shared Enterprise Offers State
  const [enterpriseOffers, setEnterpriseOffers] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_enterprise_offers_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'oe1',
        listingId: 'l1',
        farmerId: 'f1',
        farmerName: 'Ramesh Patel',
        village: 'Unjha',
        district: 'Mehsana',
        crop: 'jeera',
        cropName: 'Jeera (Cumin)',
        emoji: '🌿',
        grade: 'Premium Bold',
        offeredPrice: 308,
        expectedPrice: 315,
        qty: 5,
        unit: 'ton',
        deliveryTerms: 'Pickup from farm',
        paymentTerms: '50% advance, 50% on delivery',
        validity: '2026-10-12',
        validDays: 7,
        status: 'pending',
        sentAt: '2 hours ago',
        message: 'Interested in Unjha jeera lot. We export to UAE regularly. Prompt loading guaranteed.',
        specs: { purity: '99.5%', moisture: 'Max 7%', volatileOil: '2.8%', packaging: '50 kg PP Bags' },
      },
      {
        id: 'oe2',
        listingId: 'l14',
        farmerId: 'f2',
        farmerName: 'Bhavna Ben Desai',
        village: 'Talala Gir',
        district: 'Junagadh',
        crop: 'kesar-mango',
        cropName: 'Kesar Mango',
        emoji: '🥭',
        grade: 'Export Grade A',
        offeredPrice: 180,
        expectedPrice: 185,
        qty: 2,
        unit: 'ton',
        deliveryTerms: 'Pickup from farm',
        paymentTerms: '100% advance on crate loading',
        validity: '2026-10-08',
        validDays: 5,
        status: 'accepted',
        sentAt: '1 day ago',
        message: 'We have confirmed export orders for London airfreight. Brix 22°+ lot needed.',
        specs: { grade: 'Export A (GI)', brix: '22°+', weight: '250–300g', treatment: 'HWT' },
      },
      {
        id: 'oe3',
        listingId: 'l28',
        farmerId: 'f1',
        farmerName: 'Ramesh Patel',
        village: 'Unjha',
        district: 'Mehsana',
        crop: 'jeera',
        cropName: 'Jeera (Cumin)',
        emoji: '🌿',
        grade: 'Machine Cleaned (99%)',
        offeredPrice: 305,
        expectedPrice: 310,
        counterPrice: 310,
        qty: 8,
        unit: 'ton',
        deliveryTerms: 'Delivered to Unjha warehouse',
        paymentTerms: '100% advance',
        validity: '2026-10-15',
        validDays: 7,
        status: 'countered',
        sentAt: '3 days ago',
        message: 'Need 8 tons of machine-cleaned jeera for Saudi Arabia shipment.',
        specs: { purity: '99%', moisture: 'Max 8%', volatileOil: '2.5%', packaging: '50 kg PP Bags' },
      },
      {
        id: 'oe4',
        listingId: 'l3',
        farmerId: 'f3',
        farmerName: 'Karsan Bhai Solanki',
        village: 'Viramgam',
        district: 'Ahmedabad',
        crop: 'groundnut',
        cropName: 'Groundnut',
        emoji: '🥜',
        grade: 'Bold 40/50',
        offeredPrice: 62,
        expectedPrice: 65,
        qty: 8,
        unit: 'ton',
        deliveryTerms: 'Pickup from farm',
        paymentTerms: '50% advance, 50% on weight slip',
        validity: '2026-10-02',
        validDays: 5,
        status: 'rejected',
        sentAt: '5 days ago',
        message: 'Groundnut Bold 40/50 for Vietnam export order.',
        specs: { count: '40/50', moisture: 'Max 7%', aflatoxin: 'Below 4 ppb', packaging: '25 kg Vacuum Bags' },
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('agri_enterprise_offers_v2', JSON.stringify(enterpriseOffers));
    } catch (e) {
      console.error(e);
    }
  }, [enterpriseOffers]);

  const addEnterpriseOffer = (newOffer) => {
    const item = {
      id: `oe_${Date.now()}`,
      sentAt: 'Just now',
      status: 'pending',
      ...newOffer,
    };
    setEnterpriseOffers(prev => [item, ...prev]);
    return item;
  };

  const updateEnterpriseOffer = (id, updatedFields) => {
    setEnterpriseOffers(prev => prev.map(o => o.id === id ? { ...o, ...updatedFields } : o));
  };

  const withdrawEnterpriseOffer = (id) => {
    setEnterpriseOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'withdrawn' } : o));
  };

  const addProduceListing = (newListing) => {
    const item = {
      id: `l_${Date.now()}`,
      farmerId: user?.id || 'f1',
      status: 'active',
      offers: 0,
      photos: ['🌿', '📦'],
      posted: 'Just now',
      expires: '2026-11-30',
      description: 'High quality produce ready for delivery and inspection.',
      ...newListing,
    };
    setProduceListings(prev => [item, ...prev]);
    return item;
  };

  const updateProduceListing = (id, updatedFields) => {
    setProduceListings(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
  };

  const deleteProduceListing = (id) => {
    setProduceListings(prev => prev.filter(l => l.id !== id));
  };

  const addBuyerRequirement = (newReq) => {
    const enterprise = ENTERPRISES.find(e => e.id === (user?.id || 'e1')) || ENTERPRISES[0];
    const item = {
      id: `br_${Date.now()}`,
      enterpriseId: user?.id || 'e1',
      enterpriseName: enterprise.name,
      buyerType: enterprise.type || 'Export House',
      verified: enterprise.verified !== undefined ? enterprise.verified : true,
      logo: enterprise.logo || '🏢',
      quotesCount: 0,
      quotes: [],
      posted: 'Just now',
      city: enterprise.city || 'Ahmedabad',
      phone: '+91 98250 11223',
      status: 'active',
      ...newReq,
    };

    setBuyerRequirements(prev => [item, ...prev]);

    // Add a notification about new buying requirement
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'requirement',
        icon: '📋',
        text: `New Buying Requirement posted: ${item.cropName} (${item.qty} ${item.unit}) at ₹${item.targetPrice}/kg`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return item;
  };

  const deleteBuyerRequirement = (id) => {
    setBuyerRequirements(prev => prev.filter(req => req.id !== id));
  };

  const updateBuyerRequirement = (id, updatedFields) => {
    setBuyerRequirements(prev => prev.map(req => req.id === id ? { ...req, ...updatedFields } : req));
  };

  const submitQuoteToRequirement = (reqId, quoteData) => {
    const newQuote = {
      id: `q_${Date.now()}`,
      farmerId: user?.id || 'f1',
      farmerName: user?.name || 'Ramesh Patel',
      village: user?.village || 'Unjha',
      district: 'Mehsana',
      dateSubmitted: 'Just now',
      status: 'pending',
      ...quoteData,
    };

    setBuyerRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        const existingQuotes = req.quotes || [];
        return {
          ...req,
          quotesCount: (req.quotesCount || 0) + 1,
          quotes: [newQuote, ...existingQuotes],
        };
      }
      return req;
    }));

    // Notification for enterprise
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'quote',
        icon: '💰',
        text: `Farmer ${newQuote.farmerName} submitted a quote of ₹${newQuote.price}/kg for ${newQuote.qty} tons`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return newQuote;
  };

  const acceptQuoteOnRequirement = (reqId, quoteId) => {
    setBuyerRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedQuotes = (req.quotes || []).map(q =>
          q.id === quoteId ? { ...q, status: 'accepted' } : q
        );
        return {
          ...req,
          quotes: updatedQuotes,
        };
      }
      return req;
    }));

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'deal',
        icon: '🤝',
        text: `Deal confirmed! Quote accepted for requirement.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const loginAs = (roleType) => {
    setRole(roleType);
    if (roleType === 'farmer') setUser({ id: 'f1', name: 'Ramesh Patel', village: 'Unjha', verified: true });
    if (roleType === 'enterprise') setUser({ id: 'e1', name: 'Ahmed Spice Exports', verified: true });
    if (roleType === 'admin') setUser({ id: 'admin1', name: 'Admin User', verified: true });
  };

  const logout = () => { setRole(null); setUser(null); };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        loginAs,
        logout,
        toasts,
        addToast,
        notifications,
        markAllRead,
        unreadCount,
        buyerRequirements,
        addBuyerRequirement,
        deleteBuyerRequirement,
        updateBuyerRequirement,
        submitQuoteToRequirement,
        acceptQuoteOnRequirement,
        produceListings,
        addProduceListing,
        updateProduceListing,
        deleteProduceListing,
        enterpriseOffers,
        setEnterpriseOffers,
        addEnterpriseOffer,
        updateEnterpriseOffer,
        withdrawEnterpriseOffer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
