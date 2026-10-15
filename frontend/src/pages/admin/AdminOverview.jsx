import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Package, ShieldCheck, AlertTriangle, TrendingUp, Briefcase, MessageSquare, RefreshCw } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export default function AdminOverview() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: {
      farmers: 0,
      enterprises: 0,
      listings: 0,
      offers: 0,
      deals: 0,
      pendingVerifications: 0,
      openComplaints: 0,
    },
    charts: {
      userGrowth: [
        { month: 'Oct', farmers: 0, enterprises: 0 },
      ],
      dealsByStatus: [
        { name: 'Completed', value: 0, color: '#2F7D32' },
        { name: 'In Transit', value: 0, color: '#F9A825' },
        { name: 'Accepted', value: 0, color: '#1565C0' },
        { name: 'Pending', value: 0, color: '#9CA3AF' },
      ],
      topCrops: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.admin.getStats();
      if (res?.data) {
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        addToast('Session expired. Please log in as admin.', 'error');
        navigate('/login');
        return;
      }
      console.error('Failed to load admin stats:', err);
      setError(err.message || 'Failed to load live database metrics');
    } finally {
      setLoading(false);
    }
  }, [navigate, addToast]);


  useEffect(() => {
    fetchStats();

    const socket = getSocket();
    if (socket) {
      socket.on('stats_updated', fetchStats);
      socket.on('new_user_registered', fetchStats);
      socket.on('user_status_changed', fetchStats);
      socket.on('new_listing_posted', fetchStats);
      socket.on('deal_created', fetchStats);
      socket.on('deals_updated', fetchStats);
    }

    return () => {
      if (socket) {
        socket.off('stats_updated', fetchStats);
        socket.off('new_user_registered', fetchStats);
        socket.off('user_status_changed', fetchStats);
        socket.off('new_listing_posted', fetchStats);
        socket.off('deal_created', fetchStats);
        socket.off('deals_updated', fetchStats);
      }
    };
  }, [fetchStats]);

  const { stats, charts } = data;

  const statItems = [
    { icon: <Users size={22} color="var(--green-primary)" />, value: stats.farmers, label: 'Farmers', bg: 'var(--green-light)', color: 'var(--green-primary)' },
    { icon: <Briefcase size={22} color="#1565C0" />, value: stats.enterprises, label: 'Enterprises', bg: 'var(--blue-light)', color: '#1565C0' },
    { icon: <Package size={22} color="#7C3AED" />, value: stats.listings, label: 'Listings', bg: '#F3E8FF', color: '#7C3AED' },
    { icon: <MessageSquare size={22} color="#B45309" />, value: stats.offers, label: 'Offers', bg: 'var(--amber-light)', color: '#B45309' },
    { icon: <TrendingUp size={22} color="var(--green-primary)" />, value: stats.deals, label: 'Deals', bg: 'var(--green-light)', color: 'var(--green-primary)' },
    { icon: <ShieldCheck size={22} color="var(--amber)" />, value: stats.pendingVerifications, label: 'Pending Verif.', bg: 'var(--amber-light)', color: '#B45309', alert: stats.pendingVerifications > 0 },
    { icon: <AlertTriangle size={22} color="var(--red)" />, value: stats.openComplaints, label: 'Open Complaints', bg: 'var(--red-light)', color: 'var(--red)', alert: stats.openComplaints > 0 },
  ];

  const totalDeals = (charts.dealsByStatus || []).reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div style={{ padding: '32px 32px 48px' }}>
      <FadeUpItem>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>Admin Overview</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Live platform health and MySQL database metrics</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={fetchStats}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: '0.875rem' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchStats}>Retry</button>
          </div>
        )}
      </FadeUpItem>

      {/* Stat Cards */}
      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statItems.map((s, i) => (
          <FadeUpItem key={i}>
            <motion.div className="stat-card" whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }} style={{ border: s.alert ? `2px solid ${s.color}` : '1px solid var(--border)' }}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.alert ? s.color : 'var(--text-primary)' }}>
                <CountUp target={s.value} duration={1} />
              </div>
              <div className="stat-label">{s.label}</div>
              {s.alert && <div className="stat-trend" style={{ color: s.color }}>⚠️ Needs attention</div>}
            </motion.div>
          </FadeUpItem>
        ))}
      </StaggerGrid>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* User Growth */}
        <FadeUpItem>
          <div className="card card-body">
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>User Growth</h4>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="farmers" stroke="#2F7D32" strokeWidth={3} dot={{ r: 4, fill: '#2F7D32' }} name="Farmers" />
                  <Line type="monotone" dataKey="enterprises" stroke="#F9A825" strokeWidth={3} dot={{ r: 4, fill: '#F9A825' }} name="Enterprises" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeUpItem>

        {/* Deals by Status */}
        <FadeUpItem>
          <div className="card card-body">
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Deals by Status</h4>
            {totalDeals === 0 ? (
              <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '2rem', marginBottom: 8 }}>📊</span>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No deals recorded yet</p>
              </div>
            ) : (
              <>
                <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={charts.dealsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {charts.dealsByStatus.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {charts.dealsByStatus.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </FadeUpItem>
      </div>

      {/* Top Crops */}
      <FadeUpItem>
        <div className="card card-body">
          <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Top Crops by Listing Count</h4>
          <div style={{ height: 240 }}>
            {(!charts.topCrops || charts.topCrops.length === 0 || charts.topCrops.every(c => c.value === 0)) ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '2rem', marginBottom: 8 }}>🌱</span>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No produce listings currently active</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.topCrops} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="crop" type="category" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v} Listings`, 'Count']} />
                  <Bar dataKey="value" fill="#2F7D32" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </FadeUpItem>
    </div>
  );
}
