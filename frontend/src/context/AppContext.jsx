import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(null); // 'farmer' | 'enterprise' | 'admin' | null
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [buyerRequirements, setBuyerRequirements] = useState([]);
  const [produceListings, setProduceListings] = useState([]);
  const [enterpriseOffers, setEnterpriseOffers] = useState([]);
  const [farmerOffers, setFarmerOffers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [crops, setCrops] = useState([]);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [exportGuides, setExportGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Fetch all live data from MySQL Backend
  const refreshData = useCallback(async () => {
    try {
      // 1. Master crops
      const cropsRes = await api.crops.getAll().catch(() => ({ data: [] }));
      if (cropsRes.data) setCrops(cropsRes.data);

      // 2. Produce Listings
      const listingsRes = await api.listings.getAll().catch(() => ({ data: [] }));
      if (listingsRes.data) setProduceListings(listingsRes.data);

      // 3. Buyer Requirements
      const reqsRes = await api.requirements.getAll().catch(() => ({ data: [] }));
      if (reqsRes.data) setBuyerRequirements(reqsRes.data);

      // 4. Mandi Prices
      const mandiRes = await api.mandi.getAll().catch(() => ({ data: [] }));
      if (mandiRes.data) setMandiPrices(mandiRes.data);

      // 5. Export Guides
      const guidesRes = await api.guides.getAll().catch(() => ({ data: [] }));
      if (guidesRes.data) setExportGuides(guidesRes.data);

      // 6. User-specific data if logged in
      // 6. User-specific data if logged in
      const token = localStorage.getItem('token');
      if (token) {
        const meRes = await api.auth.getMe().catch(() => null);
        if (meRes?.user) {
          const u = meRes.user;
          setUser(prev => ({
            ...prev,
            ...u,
            id: u.role === 'farmer' ? `f${u.id}` : u.role === 'enterprise' ? `e${u.id}` : 'admin1',
            dbId: u.id,
            verified: Boolean(u.is_verified),
            is_verified: Boolean(u.is_verified),
            isVerified: Boolean(u.is_verified),
          }));
        }

        const notifRes = await api.notifications.getAll().catch(() => ({ data: [] }));
        if (notifRes.data) setNotifications(notifRes.data);

        const dealsRes = await api.deals.getAll().catch(() => ({ data: [] }));
        if (dealsRes.data) setDeals(dealsRes.data);

        const fOffersRes = await api.offers.getFarmerOffers().catch(() => ({ data: [] }));
        if (fOffersRes.data) setFarmerOffers(fOffersRes.data);

        const eOffersRes = await api.offers.getEnterpriseOffers().catch(() => ({ data: [] }));
        if (eOffersRes.data) setEnterpriseOffers(eOffersRes.data);
      }
    } catch (err) {
      console.warn('Refresh data notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount & Socket listener setup
  useEffect(() => {
    // Restore session if JWT token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.getMe()
        .then(res => {
          if (res?.user) {
            loginAs(res.user.role, res.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }

    refreshData();

    // Socket listener for real-time messages, verifications, & platform sync
    const socket = getSocket();
    if (socket) {
      socket.on('receive_message', (msg) => {
        addToast(`New message from ${msg.sender_name}: "${msg.content}"`, 'info');
      });
      socket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        addToast(notif.title || notif.message, 'info');
      });
      socket.on('verification_decided', ({ is_verified }) => {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            verified: Boolean(is_verified),
            is_verified: Boolean(is_verified),
            isVerified: Boolean(is_verified),
          };
        });
        addToast(
          is_verified
            ? 'Account Verified! You now have full verified access ✓'
            : 'Your verification submission was reviewed and rejected.',
          is_verified ? 'success' : 'warning'
        );
        refreshData();
      });
      socket.on('user_status_changed', (evt) => {
        const myDbId = Number(user?.dbId || String(user?.id || '').replace(/^[fe]/, ''));
        if (evt?.is_blocked && evt?.userId && evt.userId === myDbId) {
          logout();
          addToast('Your account has been suspended by the platform administrator.', 'error');
          return;
        }
        refreshData();
      });
      socket.on('new_listing_posted', () => refreshData());
      socket.on('listing_updated', () => refreshData());
      socket.on('listings_updated', () => refreshData());
      socket.on('listing_deleted', () => refreshData());
      socket.on('new_requirement_posted', () => refreshData());
      socket.on('requirement_updated', () => refreshData());
      socket.on('requirements_updated', () => refreshData());
      socket.on('offers_updated', () => refreshData());
      socket.on('new_offer_received', (data) => {
        addToast(`New offer received from ${data?.senderName || 'buyer'}! 📦`, 'info');
        refreshData();
      });
      socket.on('offer_countered', (data) => {
        addToast(`Counter offer updated: ₹${data?.counterPrice || ''}! 🔄`, 'info');
        refreshData();
      });
      socket.on('offer_updated', () => refreshData());
      socket.on('offer_rejected', () => {
        addToast('Offer was declined.', 'info');
        refreshData();
      });
      socket.on('offer_withdrawn', () => {
        addToast('Offer was withdrawn.', 'info');
        refreshData();
      });
      socket.on('deal_created', (data) => {
        addToast(`Deal #${data?.dealCode || ''} created! 🤝`, 'success');
        refreshData();
      });
      socket.on('deals_updated', () => refreshData());
      socket.on('stats_updated', () => refreshData());
      socket.on('new_user_registered', () => refreshData());
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('new_notification');
        socket.off('verification_decided');
        socket.off('user_status_changed');
        socket.off('new_listing_posted');
        socket.off('listing_updated');
        socket.off('listings_updated');
        socket.off('listing_deleted');
        socket.off('new_requirement_posted');
        socket.off('requirement_updated');
        socket.off('requirements_updated');
        socket.off('offers_updated');
        socket.off('new_offer_received');
        socket.off('offer_countered');
        socket.off('offer_updated');
        socket.off('offer_rejected');
        socket.off('offer_withdrawn');
        socket.off('deal_created');
        socket.off('deals_updated');
        socket.off('stats_updated');
        socket.off('new_user_registered');
      }
    };
  }, [refreshData, addToast]);

  const loginAs = (roleType, userData = null) => {
    setRole(roleType);
    if (userData) {
      setUser({
        ...userData,
        id: userData.role === 'farmer' ? `f${userData.id}` : userData.role === 'enterprise' ? `e${userData.id}` : 'admin1',
        farmerId: `f${userData.id}`,
        dbId: userData.id,
        farmerDbId: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        village: userData.farmerProfile?.village || userData.enterpriseProfile?.city || userData.village || '',
        district: userData.farmerProfile?.district || userData.enterpriseProfile?.city || userData.district || '',
        verified: Boolean(userData.is_verified),
        is_verified: Boolean(userData.is_verified),
        isVerified: Boolean(userData.is_verified),
        rating: Number(userData.rating || 5.0),
        role: userData.role,
      });
    } else {
      if (roleType === 'farmer') setUser({ id: 'f1', name: 'Farmer User', verified: true, is_verified: true, isVerified: true, role: 'farmer' });
      if (roleType === 'enterprise') setUser({ id: 'e1', name: 'Enterprise User', verified: true, is_verified: true, isVerified: true, role: 'enterprise' });
      if (roleType === 'admin') setUser({ id: 'admin1', name: 'AgriExport Admin', verified: true, is_verified: true, isVerified: true, role: 'admin' });
    }
    try { getSocket(); } catch (e) {}
    refreshData();
  };

  const impersonateUser = async (targetUserId) => {
    try {
      const cleanId = String(targetUserId).replace(/^[a-z]+/i, '');
      const currentToken = localStorage.getItem('token');
      if (role === 'admin' && currentToken) {
        localStorage.setItem('admin_token_backup', currentToken);
      }
      const res = await api.admin.impersonate(cleanId);
      if (res?.token && res?.user) {
        localStorage.setItem('token', res.token);
        loginAs(res.user.role, res.user);
        return res.user;
      }
      throw new Error(res?.message || 'Failed to switch user');
    } catch (err) {
      console.error('impersonateUser error:', err);
      throw err;
    }
  };

  const returnToAdmin = async () => {
    try {
      const backupToken = localStorage.getItem('admin_token_backup');
      if (backupToken) {
        localStorage.setItem('token', backupToken);
        localStorage.removeItem('admin_token_backup');
      }
      const meRes = await api.auth.getMe().catch(() => null);
      if (meRes?.user && meRes.user.role === 'admin') {
        loginAs('admin', meRes.user);
        addToast('Returned to Admin Panel ✓', 'success');
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setRole('guest');
        addToast('Admin session expired. Please log in again.', 'warning');
      }
    } catch (err) {
      console.error('returnToAdmin error:', err);
      addToast('Failed to restore admin session', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token_backup');
    disconnectSocket();
    setRole(null);
    setUser(null);
    setFarmerOffers([]);
    setEnterpriseOffers([]);
    setNotifications([]);
    setDeals([]);
  };

  const isImpersonating = Boolean(localStorage.getItem('admin_token_backup')) && role !== 'admin';

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await api.notifications.markAllRead().catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Produce Listing Mutations
  const addProduceListing = async (newListing) => {
    try {
      const res = await api.listings.create(newListing);
      addToast('Produce listing posted successfully!', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to create listing', 'error');
      throw err;
    }
  };

  const updateProduceListing = async (id, updatedFields) => {
    try {
      const cleanId = String(id).replace('l', '');
      await api.listings.update(cleanId, updatedFields);
      addToast('Listing updated successfully.', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to update listing', 'error');
    }
  };

  const deleteProduceListing = async (id) => {
    try {
      const cleanId = String(id).replace('l', '');
      await api.listings.delete(cleanId);
      setProduceListings(prev => prev.filter(l => l.id !== id && l.dbId !== id));
      addToast('Listing deleted successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  // Buyer Requirement Mutations
  const addBuyerRequirement = async (newReq) => {
    try {
      const res = await api.requirements.create(newReq);
      addToast('Buyer requirement posted successfully!', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to post requirement', 'error');
      throw err;
    }
  };

  const deleteBuyerRequirement = async (id) => {
    setBuyerRequirements(prev => prev.filter(req => req.id !== id && req.dbId !== id));
  };

  const updateBuyerRequirement = async (id, updatedFields) => {
    setBuyerRequirements(prev => prev.map(req => (req.id === id || req.dbId === id) ? { ...req, ...updatedFields } : req));
  };

  // Offers and Quotes Mutations
  const submitQuoteToRequirement = async (reqId, quoteData) => {
    try {
      const cleanReqId = String(reqId).replace('br', '');
      const res = await api.offers.create({ requirementId: cleanReqId, ...quoteData });
      addToast('Quote submitted successfully!', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to submit quote', 'error');
      throw err;
    }
  };

  const acceptQuoteOnRequirement = async (reqId, quoteId) => {
    try {
      const cleanQuoteId = String(quoteId).replace(/^[oq]/, '');
      await api.offers.accept(cleanQuoteId);
      addToast('Offer accepted! Deal agreement created.', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to accept offer', 'error');
    }
  };

  const counterQuoteOnRequirement = async (reqId, quoteId, counterPrice, counterNote) => {
    try {
      const cleanQuoteId = String(quoteId).replace(/^[oq]/, '');
      await api.offers.counter(cleanQuoteId, { counterPrice, counterNote });
      addToast('Counter offer sent successfully.', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to send counter offer', 'error');
    }
  };

  const addEnterpriseOffer = async (newOffer) => {
    try {
      const res = await api.offers.create(newOffer);
      addToast('Offer sent to farmer successfully!', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to send offer', 'error');
      throw err;
    }
  };

  const updateEnterpriseOffer = (id, updatedFields) => {
    setEnterpriseOffers(prev => prev.map(o => o.id === id ? { ...o, ...updatedFields } : o));
  };

  const withdrawEnterpriseOffer = async (id) => {
    try {
      const cleanId = String(id).replace(/^[oq]/, '');
      await api.offers.withdraw(cleanId);
      setEnterpriseOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'withdrawn' } : o));
      addToast('Offer withdrawn.', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to withdraw offer', 'error');
    }
  };

  const withdrawOffer = async (id) => {
    try {
      const cleanId = String(id).replace(/^[oq]/, '');
      await api.offers.withdraw(cleanId);
      addToast('Offer / quote withdrawn.', 'info');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to withdraw offer', 'error');
    }
  };

  const acceptOffer = async (id) => {
    try {
      const cleanId = String(id).replace(/^[oq]/, '');
      const res = await api.offers.accept(cleanId);
      addToast(res.message || 'Offer accepted! Deal agreement created 🎉', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to accept offer', 'error');
      throw err;
    }
  };

  const counterOffer = async (id, counterPrice, counterNote) => {
    try {
      const cleanId = String(id).replace(/^[oq]/, '');
      const res = await api.offers.counter(cleanId, { counterPrice, counterNote });
      addToast('Counter offer sent successfully.', 'success');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to send counter offer', 'error');
      throw err;
    }
  };

  const rejectOffer = async (id) => {
    try {
      const cleanId = String(id).replace(/^[oq]/, '');
      const res = await api.offers.reject(cleanId);
      addToast('Offer declined.', 'info');
      refreshData();
      return res;
    } catch (err) {
      addToast(err.message || 'Failed to decline offer', 'error');
      throw err;
    }
  };

  const updateFarmerOffer = (id, updatedFields) => {
    setFarmerOffers(prev => prev.map(o => o.id === id ? { ...o, ...updatedFields } : o));
  };

  const deleteFarmerOffer = (id) => {
    setFarmerOffers(prev => prev.filter(o => o.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        loginAs,
        logout,
        impersonateUser,
        returnToAdmin,
        isImpersonating,
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
        counterQuoteOnRequirement,
        produceListings,
        addProduceListing,
        updateProduceListing,
        deleteProduceListing,
        enterpriseOffers,
        setEnterpriseOffers,
        addEnterpriseOffer,
        updateEnterpriseOffer,
        withdrawEnterpriseOffer,
        farmerOffers,
        setFarmerOffers,
        updateFarmerOffer,
        deleteFarmerOffer,
        acceptOffer,
        counterOffer,
        rejectOffer,
        withdrawOffer,
        deals,
        crops,
        mandiPrices,
        exportGuides,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
