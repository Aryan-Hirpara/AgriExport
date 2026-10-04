import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { MANDI_PRICES_HISTORY, EXPORT_GUIDE } from '../../data/sampleData';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import { translateTerm } from '../../utils/translationUtils';

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function MandiPrices() {
  const { t, lang } = useApp();
  const [tab, setTab] = useState(0);
  const [activeCropId, setActiveCropId] = useState('jeera');
  const [timeRange, setTimeRange] = useState(30);
  const [selectedGuide, setSelectedGuide] = useState(EXPORT_GUIDE[0]);
  const [checklist, setChecklist] = useState({});
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => { setTimeout(() => setChartVisible(true), 300); }, []);

  const activeCropData = MANDI_PRICES_HISTORY.crops.find(c => c.id === activeCropId) || MANDI_PRICES_HISTORY.crops[0];

  // Slice the last N days for the selected time range
  const chartData = useMemo(() => {
    const dates = MANDI_PRICES_HISTORY.dates.slice(-timeRange);
    const prices = activeCropData.prices.slice(-timeRange);
    return dates.map((date, i) => ({
      date: date.slice(5), // MM-DD format
      price: Math.round(prices[i] * 10) / 10,
    }));
  }, [activeCropId, timeRange, activeCropData]);

  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));

  const guideSteps = lang === 'gu' ? selectedGuide.gujSteps : selectedGuide.steps;
  const guideTips = lang === 'gu' ? selectedGuide.gujTips : selectedGuide.tips;
  const doneCount = guideSteps.filter(s => checklist[s.id]).length;
  const progress = guideSteps.length > 0 ? (doneCount / guideSteps.length) * 100 : 0;

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));

  return (
    <div className="page-wrapper">
      <div style={{ background: 'var(--green-primary)', padding: '48px 0 60px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>📊 {t('Market Intelligence', 'બજાર માહિતી')}</div>
            <h2 style={{ color: '#fff' }}>{t('Mandi Prices & Export Guide', 'મંડી ભાવ & નિકાસ માર્ગદર્શક')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 8, fontSize: '0.9375rem' }}>
              ⚠️ {t('All prices are indicative only. Source: AGMARKNET (unverified). Price date: Oct 2026.', 'બધા ભાવ સૂચક છે. AGMARKNET. ઓ. 2026.')}
            </p>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24, paddingBottom: 60 }}>
        {/* Tab Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 32, display: 'flex', gap: 8 }}>
          {[t('📈 Mandi Prices (90-Day)', '📈 મંડી ભાવ (90 દિ.)'), t('✈️ Export Guide', '✈️ નિકાસ માર્ગ')].map((label, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                flex: 1, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: tab === i ? 'var(--green-primary)' : 'transparent',
                color: tab === i ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
              }}
            >{label}</button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="prices" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              {/* Crop Chips – all 12 */}
              <div className="chip-group" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
                {MANDI_PRICES_HISTORY.crops.map(c => (
                  <button key={c.id} className={`chip ${activeCropId === c.id ? 'active' : ''}`} onClick={() => setActiveCropId(c.id)}>
                    {lang === 'gu' ? c.guj : c.name}
                  </button>
                ))}
              </div>

              {/* Price Summary Cards */}
              <div className="grid-3" style={{ marginBottom: 28 }}>
                {[
                  { label: t("Today's Price", 'આજનો ભાવ'), value: activeCropData.today, highlight: true, change: activeCropData.change },
                  { label: t('7-Day Ago', '7 દ. પહ.'), value: activeCropData.weekAgo },
                  { label: t('90-Day High', '90 દ. ઊ.'), value: activeCropData.highest90, sub: t('90-Day Low', '90 દ. નીચ.'), subVal: activeCropData.lowest90 },
                ].map((card, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="stat-card" style={{ border: card.highlight ? '2px solid var(--green-primary)' : '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.25rem', color: card.highlight ? 'var(--green-primary)' : 'var(--text-primary)' }}>
                      ₹{card.value}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('per kg', 'પ્રતિ kg')} • {lang === 'gu' ? activeCropData.guj : activeCropData.name}
                      {card.change !== undefined && (
                        <span style={{ marginLeft: 4, fontWeight: 700, color: card.change >= 0 ? 'var(--green-primary)' : 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          {card.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {card.change >= 0 ? '+' : ''}{card.change}
                        </span>
                      )}
                    </p>
                    {card.sub && <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{card.sub}: <strong>₹{card.subVal}</strong></p>}
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <div className="card card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {lang === 'gu' ? activeCropData.guj : activeCropData.name} {t('Price Trend', 'ભાવ ટ્રેન્ડ')} — {activeCropData.mandi} {t('Mandi', 'મંડી')}
                  </h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {TIME_RANGES.map(r => (
                      <button key={r.label} onClick={() => setTimeRange(r.days)}
                        className={`chip ${timeRange === r.days ? 'active' : ''}`} style={{ minWidth: 48, padding: '6px 14px' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                {chartVisible && (
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Inter' }}
                          tickFormatter={(d, i) => timeRange > 7 ? (i % Math.floor(timeRange / 7) === 0 ? d : '') : d} />
                        <YAxis tick={{ fontSize: 11, fontFamily: 'Inter' }} domain={['auto', 'auto']}
                          tickFormatter={v => `₹${v}`} width={60} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontFamily: 'Inter' }}
                          formatter={(val) => [`₹${val}/kg`, lang === 'gu' ? activeCropData.guj : activeCropData.name]}
                        />
                        <ReferenceLine y={minPrice} stroke="#E57373" strokeDasharray="4 2" label={{ value: `Low ₹${Math.round(minPrice)}`, fill: '#E57373', fontSize: 11 }} />
                        <ReferenceLine y={maxPrice} stroke="#2F7D32" strokeDasharray="4 2" label={{ value: `High ₹${Math.round(maxPrice)}`, fill: '#2F7D32', fontSize: 11 }} />
                        <Line type="monotone" dataKey="price" stroke="#2F7D32" strokeWidth={2.5}
                          dot={false} activeDot={{ r: 6, fill: '#2F7D32', stroke: '#fff', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={13} /> {t('Indicative data only. Generated for demo purposes. Prices simulated from research baseline.', 'સૂચક ડેટા. ડે. ઉ. ભ. ત.')}
                </p>
              </div>

              {/* All Crops Table */}
              <div className="card card-body" style={{ marginTop: 28 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{t('All Crops – Today\'s Rates', 'આ. ભ. – બ. ઉ.')}</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {[t('Crop', 'ઉ.'), t('Mandi', 'મ.'), t("Today ₹/kg", 'આ. ₹'), t('7D Ago ₹', '7D'), t('90D High', 'ઊ.'), t('90D Low', 'ન.'), t('Change', 'ફ.')].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MANDI_PRICES_HISTORY.crops.map(c => (
                        <tr key={c.id} onClick={() => setActiveCropId(c.id)}
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: c.id === activeCropId ? 'var(--green-light)' : 'transparent', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{lang === 'gu' ? c.guj : c.name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{c.mandi}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green-primary)' }}>₹{c.today}</td>
                          <td style={{ padding: '12px' }}>₹{c.weekAgo}</td>
                          <td style={{ padding: '12px', color: '#2F7D32' }}>₹{c.highest90}</td>
                          <td style={{ padding: '12px', color: 'var(--red)' }}>₹{c.lowest90}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: c.change >= 0 ? 'var(--green-primary)' : 'var(--red)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              {c.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              {c.change >= 0 ? '+' : ''}{c.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="guide" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              {/* Crop Selector – all 12 with guides */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
                {EXPORT_GUIDE.map(g => (
                  <button key={g.cropId} onClick={() => { setSelectedGuide(g); setChecklist({}); }}
                    style={{
                      padding: '12px 16px', borderRadius: 14, border: `2px solid ${selectedGuide.cropId === g.cropId ? 'var(--green-primary)' : 'var(--border)'}`,
                      background: selectedGuide.cropId === g.cropId ? 'var(--green-light)' : '#fff',
                      fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                      color: selectedGuide.cropId === g.cropId ? 'var(--green-primary)' : 'var(--text-primary)',
                      textAlign: 'left',
                    }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', marginBottom: 4 }}>{g.flag}</span>
                    {lang === 'gu' ? g.gujCrop : g.crop}
                  </button>
                ))}
              </div>

              {/* Tips banner */}
              {guideTips && (
                <div style={{ background: '#EFF6E0', border: '1.5px solid #8BC34A', borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: '0.875rem', color: '#33691E', lineHeight: 1.6 }}>
                  💡 <strong>{t('Expert Tip:', 'ટીપ:')}</strong> {guideTips}
                </div>
              )}

              {/* Certifications needed */}
              {selectedGuide.certifications && (
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12 }}>{t('Required Certifications', 'જ. સ.')}</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedGuide.certifications.map(cert => (
                      <span key={cert} className="badge badge-green">{cert}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Ring */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32, background: 'var(--green-light)', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                  <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#C8E6C9" strokeWidth="8" />
                    <motion.circle cx="40" cy="40" r="34" fill="none" stroke="var(--green-primary)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progress / 100) }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--green-primary)' }}>
                    {doneCount}/{guideSteps.length}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{t('Export Checklist', 'નિ. ચ.')}</h4>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    {lang === 'gu' ? selectedGuide.gujCrop : selectedGuide.crop} → {selectedGuide.country} {selectedGuide.flag}
                    {' • '}{doneCount} {t('of', 'ની')} {guideSteps.length} {t('steps done', 'પૂ.')}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {guideSteps.map((step) => (
                  <motion.div key={step.id} layout onClick={() => toggleCheck(step.id)}
                    style={{
                      display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 20px',
                      background: checklist[step.id] ? 'var(--green-light)' : '#fff',
                      border: `1.5px solid ${checklist[step.id] ? 'var(--green-primary)' : 'var(--border)'}`,
                      borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    whileHover={{ scale: 1.005 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: checklist[step.id] ? 'var(--green-primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: checklist[step.id] ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.875rem' }}>
                      {checklist[step.id] ? '✓' : step.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', textDecoration: checklist[step.id] ? 'line-through' : 'none', opacity: checklist[step.id] ? 0.6 : 1 }}>{step.title}</p>
                      <p style={{ fontSize: '0.8125rem', margin: 0 }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ background: 'var(--amber-light)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                  ⚠️ {t('Export rules change frequently. Always verify requirements at DGFT (dgft.gov.in) and APEDA (apeda.gov.in) before contracting.', 'નિ. ન. બ. ∙ DGFT/APEDA ∙ ચ.કા.')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
