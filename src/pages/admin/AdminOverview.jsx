import { motion } from 'framer-motion';
import { Users, Package, ShieldCheck, AlertTriangle, TrendingUp, Briefcase, MessageSquare } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { ADMIN_STATS, CHART_DATA } from '../../data/sampleData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export default function AdminOverview() {
  const stats = [
    { icon: <Users size={22} color="var(--green-primary)" />, value: ADMIN_STATS.farmers, label: 'Farmers', bg: 'var(--green-light)', color: 'var(--green-primary)' },
    { icon: <Briefcase size={22} color="#1565C0" />, value: ADMIN_STATS.enterprises, label: 'Enterprises', bg: 'var(--blue-light)', color: '#1565C0' },
    { icon: <Package size={22} color="#7C3AED" />, value: ADMIN_STATS.listings, label: 'Listings', bg: '#F3E8FF', color: '#7C3AED' },
    { icon: <MessageSquare size={22} color="#B45309" />, value: ADMIN_STATS.offers, label: 'Offers', bg: 'var(--amber-light)', color: '#B45309' },
    { icon: <TrendingUp size={22} color="var(--green-primary)" />, value: ADMIN_STATS.deals, label: 'Deals', bg: 'var(--green-light)', color: 'var(--green-primary)' },
    { icon: <ShieldCheck size={22} color="var(--amber)" />, value: ADMIN_STATS.pendingVerifications, label: 'Pending Verif.', bg: 'var(--amber-light)', color: '#B45309', alert: true },
    { icon: <AlertTriangle size={22} color="var(--red)" />, value: ADMIN_STATS.openComplaints, label: 'Open Complaints', bg: 'var(--red-light)', color: 'var(--red)', alert: true },
  ];

  return (
    <div style={{ padding: '32px 32px 48px' }}>
      <FadeUpItem>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>Admin Overview</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Platform health at a glance</p>
        </div>
      </FadeUpItem>

      {/* Stat Cards */}
      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <FadeUpItem key={i}>
            <motion.div className="stat-card" whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }} style={{ border: s.alert ? `2px solid ${s.color}` : '1px solid var(--border)' }}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.alert ? s.color : 'var(--text-primary)' }}>
                <CountUp target={s.value} duration={1.5} />
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
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>User Growth (6 Months)</h4>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
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
            <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CHART_DATA.dealsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {CHART_DATA.dealsByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CHART_DATA.dealsByStatus.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUpItem>
      </div>

      {/* Top Crops */}
      <FadeUpItem>
        <div className="card card-body">
          <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Top Crops by Listing Count</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA.topCrops} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="crop" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v}%`, 'Share']} />
                <Bar dataKey="value" fill="#2F7D32" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FadeUpItem>
    </div>
  );
}
