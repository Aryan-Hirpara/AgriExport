import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Download,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const POPULAR_CROPS = [
  'Wheat',
  'Basmati Rice',
  'Cotton (Kapas)',
  'Jeera (Cumin)',
  'Onion',
  'Soyabean',
  'Groundnut',
  'Mustard Seed',
  'Red Chilli',
  'Garlic',
  'Potato',
  'Turmeric',
];

export default function MandiPrices() {
  const [activeTab, setActiveTab] = useState('prices'); // 'prices' | 'guide'
  const [unit, setUnit] = useState('quintal'); // 'quintal' (₹/100kg) | 'kg' (₹/kg)

  // Filter metadata
  const [filterMeta, setFilterMeta] = useState({
    states: [],
    commodities: [],
    marketsByState: {},
    stats: { totalRecords: 0, totalMarkets: 0, totalCommodities: 0, latestDate: null },
  });

  // Filter state
  const [selectedState, setSelectedState] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('commodity');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Crops traded specifically in the selected market
  const [marketCrops, setMarketCrops] = useState([]);

  // Table state
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  // Active item for chart & stat cards
  const [activeItem, setActiveItem] = useState({
    crop: 'Wheat',
    mandi: 'APMC',
    state: 'India',
    district: '',
    modalQuintal: 2500,
    today: 25,
    minQuintal: 2300,
    maxQuintal: 2700,
    change: 0,
    trend: 'stable',
    arrivals: 150,
    date: 'Today',
    noData: false,
  });

  // Chart time series
  const [timeRange, setTimeRange] = useState(30);
  const [historySeries, setHistorySeries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);

  // Export Guide state
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [checklist, setChecklist] = useState({});

  // 1. Initial metadata loading
  useEffect(() => {
    api.mandi
      .getFilters()
      .then((res) => {
        if (res.data) setFilterMeta(res.data);
      })
      .catch((err) => console.error('Error loading filters:', err));

    api.guides
      .getAll()
      .then((res) => {
        if (res.data?.length > 0) {
          setGuides(res.data);
          setSelectedGuide(res.data[0]);
        }
      })
      .catch(() => { });
  }, []);

  // 2. Fetch crops specifically in selected market
  useEffect(() => {
    if (selectedMarket && selectedMarket !== 'All') {
      api.mandi
        .getMarketCrops({ market: selectedMarket, state: selectedState })
        .then((res) => {
          if (res.crops) setMarketCrops(res.crops);
        })
        .catch(() => setMarketCrops([]));
    } else {
      setMarketCrops([]);
    }
  }, [selectedMarket, selectedState]);

  // 3. Fetch table prices
  const fetchTablePrices = useCallback(() => {
    setTableLoading(true);
    const params = {
      page,
      limit: pageSize,
      sortBy,
      sortOrder,
    };
    if (selectedState !== 'All') params.state = selectedState;
    if (selectedMarket !== 'All') params.market = selectedMarket;
    if (selectedCommodity !== 'All') params.commodity = selectedCommodity;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    api.mandi
      .getAll(params)
      .then((res) => {
        const rows = res.data || [];
        setTableData(rows);
        setTotalCount(res.total || 0);
        setSuggestions(res.suggestions || []);

        // Synchronize active card
        if (rows.length > 0) {
          setActiveItem({ ...rows[0], noData: false });
        } else {
          // Explicitly show no data for requested crop/market instead of leaving stale data
          setActiveItem({
            crop: selectedCommodity !== 'All' ? selectedCommodity : (searchQuery || 'No Crop Matched'),
            mandi: selectedMarket !== 'All' ? selectedMarket : 'APMC Mandi',
            state: selectedState !== 'All' ? selectedState : 'India',
            district: '',
            modalQuintal: 0,
            today: 0,
            minQuintal: 0,
            maxQuintal: 0,
            change: 0,
            trend: 'stable',
            arrivals: 0,
            date: 'Not traded today',
            noData: true,
          });
        }
      })
      .catch((err) => {
        console.error('Error loading mandi prices:', err);
        setTableData([]);
        setSuggestions([]);
      })
      .finally(() => setTableLoading(false));
  }, [selectedState, selectedMarket, selectedCommodity, searchQuery, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchTablePrices();
  }, [fetchTablePrices]);

  // 4. Fetch chart history when activeItem changes or timeRange changes
  useEffect(() => {
    if (!activeItem.crop || activeItem.noData) {
      setHistorySeries([]);
      return;
    }
    setHistoryLoading(true);

    api.mandi
      .getHistory({
        commodity: activeItem.crop,
        market: activeItem.mandi !== 'APMC' ? activeItem.mandi : undefined,
        state: activeItem.state !== 'India' ? activeItem.state : undefined,
        days: timeRange,
      })
      .then((res) => {
        if (res.data?.series) {
          setHistorySeries(res.data.series);
        }
      })
      .catch((err) => console.error('Error fetching history:', err))
      .finally(() => setHistoryLoading(false));
  }, [activeItem.crop, activeItem.mandi, activeItem.state, activeItem.noData, timeRange]);

  // Cascading markets for state - when 'All' states selected, shows all mandis imported from API
  const availableMarkets = useMemo(() => {
    if (selectedState === 'All') {
      const allMarkets = new Set();
      Object.values(filterMeta.marketsByState || {}).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((m) => allMarkets.add(m));
      });
      return Array.from(allMarkets).sort();
    }
    return filterMeta.marketsByState[selectedState] || [];
  }, [selectedState, filterMeta.marketsByState]);

  // Handle market selection - auto-links to its state if 'All' was chosen
  const handleMarketChange = (mkt) => {
    setSelectedMarket(mkt);
    setPage(1);
    if (mkt !== 'All' && selectedState === 'All') {
      for (const [st, markets] of Object.entries(filterMeta.marketsByState || {})) {
        if (Array.isArray(markets) && markets.includes(mkt)) {
          setSelectedState(st);
          break;
        }
      }
    }
  };

  // Reset market when state changes
  const handleStateChange = (st) => {
    setSelectedState(st);
    setSelectedMarket('All');
    setPage(1);
  };

  // Sync handler
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await api.mandi.sync({ limit: 3000 });
      setSyncNotice({
        type: 'success',
        msg: `Synced ${res.syncedCount || 0} live Agmarknet records.`,
      });
      const meta = await api.mandi.getFilters();
      if (meta.data) setFilterMeta(meta.data);
      fetchTablePrices();
    } catch (err) {
      setSyncNotice({
        type: 'error',
        msg: err.message || 'Sync failed. Please check network.',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // CSV export
  const exportCSV = () => {
    if (!tableData.length) return;
    const headers = [
      'Commodity',
      'Variety',
      'Grade',
      'Mandi',
      'District',
      'State',
      'Modal Rate (₹/Quintal)',
      'Rate (₹/kg)',
      'Min Rate (₹/Quintal)',
      'Max Rate (₹/Quintal)',
      'Change (%)',
      'Arrivals (MT)',
      'Date',
    ];
    const rows = tableData.map((r) => [
      `"${r.crop}"`,
      `"${r.variety || ''}"`,
      `"${r.grade || ''}"`,
      `"${r.mandi}"`,
      `"${r.district}"`,
      `"${r.state}"`,
      r.modalQuintal,
      r.today,
      r.minQuintal,
      r.maxQuintal,
      r.change,
      r.arrivals,
      r.date || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `mandi_prices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data
  const chartPoints = useMemo(() => {
    if (!historySeries || historySeries.length === 0) return [];
    return historySeries.map((pt) => ({
      date: pt.displayDate || pt.date.slice(5),
      fullDate: pt.date,
      rate: unit === 'quintal' ? pt.modalQuintal : pt.modalKg,
    }));
  }, [historySeries, unit]);

  // Export guide toggles
  const toggleCheck = (id) => setChecklist((p) => ({ ...p, [id]: !p[id] }));
  const guideSteps = selectedGuide?.steps || [];
  const completedSteps = guideSteps.filter((s) => checklist[s.id]).length;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '24px 0 20px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ECFDF5', color: '#047857', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Agmarknet Live Connected • Govt. of India
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Mandi Prices & Intelligence
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>
                Real-time APMC wholesale market rates across {filterMeta.states.length || 28} states and {filterMeta.stats.totalMarkets.toLocaleString()} mandis
              </p>
            </div>

            {/* Sync Button & Unit Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Unit Toggle */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <button
                  onClick={() => setUnit('quintal')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: unit === 'quintal' ? '#fff' : 'transparent',
                    color: unit === 'quintal' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    boxShadow: unit === 'quintal' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  ₹ / Quintal
                </button>
                <button
                  onClick={() => setUnit('kg')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: unit === 'kg' ? '#fff' : 'transparent',
                    color: unit === 'kg' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    boxShadow: unit === 'kg' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  ₹ / kg
                </button>
              </div>

              {/* Sync Live Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#0F172A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  opacity: isSyncing ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Live'}
              </button>
            </div>
          </div>

          {/* Sync notification */}
          <AnimatePresence>
            {syncNotice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginTop: 14,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: syncNotice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  color: syncNotice.type === 'success' ? '#15803D' : '#B91C1C',
                  border: `1px solid ${syncNotice.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                }}
              >
                {syncNotice.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button
              onClick={() => setActiveTab('prices')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'prices' ? '#2E7D32' : 'transparent',
                color: activeTab === 'prices' ? '#fff' : '#64748B',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              Mandi Rates & Trends
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'guide' ? '#2E7D32' : 'transparent',
                color: activeTab === 'guide' ? '#fff' : '#64748B',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              Export Compliance Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: 20 }}>
        {activeTab === 'prices' ? (
          <div>
            {/* Simple Search & Filter Card */}
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                {/* Search input */}
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search crop or mandi..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0F172A',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* State selector */}
                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                      background: '#fff',
                      outline: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <option value="All">All States (India)</option>
                    {filterMeta.states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mandi selector */}
                <div>
                  <select
                    value={selectedMarket}
                    onChange={(e) => handleMarketChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                      background: '#fff',
                      outline: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <option value="All">
                      {selectedState === 'All'
                        ? `All Mandis (${availableMarkets.length})`
                        : `All Mandis in ${selectedState} (${availableMarkets.length})`}
                    </option>
                    {availableMarkets.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop selector (shows crops in selected mandi first if market selected) */}
                <div>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => {
                      setSelectedCommodity(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                      background: '#fff',
                      outline: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <option value="All">All Crops ({filterMeta.commodities.length || '200+'})</option>
                    {marketCrops.length > 0 && (
                      <optgroup label={`Traded in ${selectedMarket} (${marketCrops.length} crops)`}>
                        {marketCrops.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Crops Across India">
                      {filterMeta.commodities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Popular Crop Quick Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginRight: 4 }}>
                  Quick Filter:
                </span>
                {POPULAR_CROPS.map((cropName) => (
                  <button
                    key={cropName}
                    onClick={() => {
                      setSelectedCommodity(cropName);
                      setPage(1);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: selectedCommodity === cropName ? '#2E7D32' : '#E2E8F0',
                      background: selectedCommodity === cropName ? '#ECFDF5' : '#F8FAFC',
                      color: selectedCommodity === cropName ? '#047857' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cropName}
                  </button>
                ))}
                {(selectedCommodity !== 'All' || selectedState !== 'All' || selectedMarket !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCommodity('All');
                      setSelectedState('All');
                      setSelectedMarket('All');
                      setSearchQuery('');
                      setPage(1);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #E2E8F0',
                      background: '#fff',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Active Item Stats Overview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Stat 1: Today's Modal Rate */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Today's Modal Rate
                  </span>
                  {!activeItem.noData && (
                    <span
                      style={{
                        background: activeItem.change >= 0 ? '#ECFDF5' : '#FEF2F2',
                        color: activeItem.change >= 0 ? '#047857' : '#DC2626',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {activeItem.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {activeItem.change >= 0 ? '+' : ''}
                      {activeItem.change}%
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: '2.1rem', fontWeight: 800, color: activeItem.noData ? '#94A3B8' : '#2E7D32', fontFamily: 'var(--font-heading)' }}>
                  {activeItem.noData ? (
                    '—'
                  ) : (
                    <>
                      ₹
                      {unit === 'quintal'
                        ? activeItem.modalQuintal?.toLocaleString()
                        : activeItem.today}
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', marginLeft: 6 }}>
                        / {unit === 'quintal' ? 'Quintal' : 'kg'}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ marginTop: 6, fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
                  {activeItem.noData ? `No active rate for ${activeItem.crop}` : `${activeItem.crop} in ${activeItem.mandi}`}
                </div>
              </div>

              {/* Stat 2: Min - Max Price Range */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Daily Min – Max Range
                </span>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Minimum</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>
                      {activeItem.noData ? '—' : `₹${unit === 'quintal' ? activeItem.minQuintal?.toLocaleString() : (activeItem.minQuintal / 100).toFixed(1)}`}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Maximum</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                      {activeItem.noData ? '—' : `₹${unit === 'quintal' ? activeItem.maxQuintal?.toLocaleString() : (activeItem.maxQuintal / 100).toFixed(1)}`}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#64748B' }}>
                  Arrivals: <strong>{activeItem.arrivals ? `${activeItem.arrivals} MT` : 'Not reported'}</strong>
                </div>
              </div>

              {/* Stat 3: Market Details */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Market Location
                </span>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                  <Building2 size={18} color="#2E7D32" />
                  {activeItem.mandi}
                </div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: '#475569' }}>
                  <MapPin size={14} color="#94A3B8" />
                  {activeItem.district ? `${activeItem.district}, ` : ''}
                  <strong>{activeItem.state}</strong>
                </div>
                <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  Date: {activeItem.date || 'Today'}
                </div>
              </div>
            </div>

            {/* Price Trend Chart Card */}
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '20px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                    {activeItem.crop} Price Trend ({unit === 'quintal' ? '₹/Quintal' : '₹/kg'})
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                    {activeItem.mandi} Mandi, {activeItem.state}
                  </div>
                </div>

                {/* 7D, 30D, 90D chips */}
                <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setTimeRange(r.days)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: timeRange === r.days ? '#2E7D32' : 'transparent',
                        color: timeRange === r.days ? '#fff' : '#64748B',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {historyLoading ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  Loading trend...
                </div>
              ) : chartPoints.length > 0 ? (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartPoints} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => `₹${v}`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          fontSize: '0.8125rem',
                        }}
                        formatter={(val) => [`₹${val} / ${unit === 'quintal' ? 'Quintal' : 'kg'}`, 'Modal Rate']}
                        labelFormatter={(d, items) => `Date: ${items?.[0]?.payload?.fullDate || d}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#2E7D32"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 5, fill: '#2E7D32', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  <div>No price history recorded for {activeItem.crop} in {activeItem.mandi}.</div>
                  {suggestions.length > 0 && (
                    <button
                      onClick={() => setSelectedMarket('All')}
                      style={{
                        marginTop: 10,
                        background: '#ECFDF5',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                        borderRadius: 6,
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      View all markets trading {activeItem.crop}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mandi Rates Table Card */}
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                    All-India Market Prices
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                    Showing {tableData.length} of {totalCount.toLocaleString()} records • Click any row to focus its details
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSortOrder((p) => (p === 'ASC' ? 'DESC' : 'ASC'))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowUpDown size={13} />
                    Sort ({sortOrder})
                  </button>

                  <button
                    onClick={exportCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#2E7D32',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Table or Smart Empty State */}
              {tableLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '0.85rem' }}>
                  Loading market prices...
                </div>
              ) : tableData.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>🌾</div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', marginBottom: 4 }}>
                    No quotes found for {selectedCommodity !== 'All' ? selectedCommodity : 'this search'} in {selectedMarket !== 'All' ? selectedMarket : 'selected filters'} today.
                  </div>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 16px' }}>
                    This commodity was not traded in {selectedMarket} during today's APMC session.
                  </p>

                  {suggestions.length > 0 && (
                    <div style={{ maxWidth: 580, margin: '0 auto', background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                        💡 Available today in other {selectedState !== 'All' ? selectedState : 'Indian'} mandis:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedMarket(s.market);
                              if (s.state && selectedState === 'All') setSelectedState(s.state);
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              background: '#fff',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#0F172A',
                              cursor: 'pointer',
                            }}
                          >
                            {s.market} ({s.district || s.state}) — ₹{s.modalPrice ? s.modalPrice.toLocaleString() : 'Rate'}/Qtl
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedMarket('All')}
                        style={{
                          marginTop: 10,
                          background: 'none',
                          border: 'none',
                          color: '#2E7D32',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        View all {selectedState !== 'All' ? selectedState : 'India'} markets for {selectedCommodity}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Commodity</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Mandi</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>State</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Modal Rate</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Range (Min - Max)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>Change</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row) => {
                        const isSelected = activeItem.crop === row.crop && activeItem.mandi === row.mandi;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => {
                              setActiveItem({ ...row, noData: false });
                            }}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              cursor: 'pointer',
                              background: isSelected ? '#F0FDF4' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                          >
                            <td style={{ padding: '11px 12px', fontWeight: 600, color: '#0F172A' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{row.emoji || '🌾'}</span>
                                <div>
                                  <div>{row.crop}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 400 }}>
                                    {row.variety || 'Standard'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '11px 12px', color: '#334155', fontWeight: 500 }}>
                              {row.mandi}
                            </td>
                            <td style={{ padding: '11px 12px', color: '#64748B' }}>
                              <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500 }}>
                                {row.state}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: '#2E7D32' }}>
                              ₹
                              {unit === 'quintal'
                                ? row.modalQuintal?.toLocaleString()
                                : row.today}
                              <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#94A3B8', marginLeft: 3 }}>
                                /{unit === 'quintal' ? 'Qtl' : 'kg'}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'right', color: '#64748B', fontSize: '0.78rem' }}>
                              ₹
                              {unit === 'quintal'
                                ? `${row.minQuintal?.toLocaleString()} - ${row.maxQuintal?.toLocaleString()}`
                                : `${row.minKg || (row.minQuintal / 100).toFixed(1)} - ${row.maxKg || (row.maxQuintal / 100).toFixed(1)}`}
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: row.change >= 0 ? '#15803D' : '#DC2626',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                {row.change >= 0 ? '+' : ''}
                                {row.change}%
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'right', color: '#94A3B8', fontSize: '0.75rem' }}>
                              {row.date || 'Today'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {tableData.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Page {page} of {Math.ceil(totalCount / pageSize) || 1} ({totalCount.toLocaleString()} items)
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: page <= 1 ? '#F8FAFC' : '#fff',
                        color: page <= 1 ? '#94A3B8' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span style={{ padding: '5px 8px', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      {page}
                    </span>
                    <button
                      disabled={page * pageSize >= totalCount}
                      onClick={() => setPage((p) => p + 1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: page * pageSize >= totalCount ? '#F8FAFC' : '#fff',
                        color: page * pageSize >= totalCount ? '#94A3B8' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: page * pageSize >= totalCount ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab: Export Compliance Guide */
          <div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                {guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGuide(g);
                      setChecklist({});
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: 10,
                      border: `1.5px solid ${selectedGuide?.id === g.id ? '#2E7D32' : '#E2E8F0'}`,
                      background: selectedGuide?.id === g.id ? '#ECFDF5' : '#fff',
                      color: selectedGuide?.id === g.id ? '#047857' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: 4 }}>✈️</span>
                    {g.crop || g.title}
                  </button>
                ))}
              </div>

              {selectedGuide && (
                <div>
                  <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '16px', marginBottom: 20, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                      Export Compliance Overview: {selectedGuide.crop}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      {selectedGuide.tips || 'Ensure all required export inspection documents are submitted before shipping.'}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Compliance Checklist ({completedSteps}/{guideSteps.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {guideSteps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => toggleCheck(step.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: `1px solid ${checklist[step.id] ? '#BBF7D0' : '#E2E8F0'}`,
                            background: checklist[step.id] ? '#F0FDF4' : '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: checklist[step.id] ? '#2E7D32' : '#F1F5F9',
                              color: checklist[step.id] ? '#fff' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {checklist[step.id] ? <Check size={14} /> : step.id}
                          </div>
                          <div style={{ flex: 1, fontSize: '0.8125rem', color: '#334155', textDecoration: checklist[step.id] ? 'line-through' : 'none' }}>
                            <strong style={{ color: '#0F172A' }}>{step.title}</strong> — {step.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
