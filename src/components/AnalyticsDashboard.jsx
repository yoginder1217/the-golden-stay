import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, BarChart2,
  Users, Calendar, CreditCard, Star, MapPin,
  CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight,
  Inbox, Phone, Home, Building2,
} from 'lucide-react';
import { getHostApplications, updateApplicationStatus } from '../lib/hostApplications';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtShort = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${Math.round(n / 1000)}k` : `₹${n}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const PERIODS = [
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
  { label: 'All Time', days: null },
];

const STATUS_META = {
  confirmed: { label: 'Confirmed', color: '#16a34a', bg: 'bg-green-50', text: 'text-green-700' },
  pending:   { label: 'Pending',   color: '#d97706', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: 'bg-red-50',    text: 'text-red-700' },
  completed: { label: 'Completed', color: '#6b7280', bg: 'bg-gray-50',   text: 'text-gray-700' },
};

const APP_STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  reviewing: { label: 'Reviewing', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved:  { label: 'Approved',  cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200' },
};

// ── SVG Revenue Line Chart ────────────────────────────────────────────────────
const RevenueLineChart = ({ data }) => {
  if (!data.length) return null;
  const W = 560, H = 160, PAD = { top: 16, right: 12, bottom: 28, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const xStep = plotW / Math.max(data.length - 1, 1);
  const xAt = (i) => PAD.left + i * xStep;
  const yAt = (v) => PAD.top + plotH - (v / maxRev) * plotH;

  const pts = data.map((d, i) => `${xAt(i).toFixed(1)},${yAt(d.revenue).toFixed(1)}`).join(' ');
  const areaPath = [
    `M${xAt(0).toFixed(1)},${(PAD.top + plotH).toFixed(1)}`,
    ...data.map((d, i) => `L${xAt(i).toFixed(1)},${yAt(d.revenue).toFixed(1)}`),
    `L${xAt(data.length - 1).toFixed(1)},${(PAD.top + plotH).toFixed(1)}`,
    'Z',
  ].join(' ');

  // Y axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: f * maxRev, y: yAt(f * maxRev) }));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Grid lines */}
        {ticks.map(({ y }, i) => (
          <line key={i} x1={PAD.left} x2={W - PAD.right} y1={y.toFixed(1)} y2={y.toFixed(1)}
            stroke="#f0f0f0" strokeWidth="1" />
        ))}
        {/* Y axis labels */}
        {ticks.map(({ v, y }, i) => (
          <text key={i} x={PAD.left - 6} y={y + 4} textAnchor="end"
            fontSize="10" fill="#9ca3af">{fmtShort(Math.round(v))}</text>
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="#D4AF37" fillOpacity="0.08" />
        {/* Line */}
        <polyline points={pts} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xAt(i).toFixed(1)} cy={yAt(d.revenue).toFixed(1)} r="3.5"
              fill="#fff" stroke="#D4AF37" strokeWidth="2" />
          </g>
        ))}
        {/* X axis labels */}
        {data.map((d, i) => {
          // Only show every Nth label to avoid crowding
          const show = data.length <= 7 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
          if (!show) return null;
          return (
            <text key={i} x={xAt(i).toFixed(1)} y={H - 6} textAnchor="middle"
              fontSize="10" fill="#9ca3af">{d.label}</text>
          );
        })}
      </svg>
    </div>
  );
};

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
const DonutChart = ({ segments }) => {
  const r = 40, cx = 60, cy = 60, stroke = 22;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.value / total) * circumference;
    const gap = circumference - dash;
    const arc = { dash, gap, offset, color: seg.color };
    offset += dash;
    return arc;
  });

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0 -rotate-90">
      {arcs.map((arc, i) => (
        <circle key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset}
        />
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" />
    </svg>
  );
};

// ── Trend Badge ───────────────────────────────────────────────────────────────
const TrendBadge = ({ curr, prev }) => {
  if (!prev) return null;
  const pct = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);
  const up = pct >= 0;
  const Icon = pct === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
      up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
    }`}>
      <Icon size={11} /> {Math.abs(pct)}%
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AnalyticsDashboard = ({ bookings, propertiesData, loading }) => {
  const [period, setPeriod] = useState(PERIODS[2]);   // default: 6 months
  const [activeSection, setActiveSection] = useState('overview'); // overview | applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  useEffect(() => {
    if (activeSection !== 'applications') return;
    setAppsLoading(true);
    getHostApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  }, [activeSection]);

  // ── Date helpers ──────────────────────────────────────────────────────────
  const now = useMemo(() => new Date(), []);
  const cutoff = useMemo(() => {
    if (!period.days) return null;
    const d = new Date(now);
    d.setDate(d.getDate() - period.days);
    return d;
  }, [period, now]);
  const prevCutoff = useMemo(() => {
    if (!cutoff) return null;
    const d = new Date(cutoff);
    d.setDate(d.getDate() - period.days);
    return d;
  }, [cutoff, period]);

  const inPeriod = (b, from, to) => {
    const d = new Date(b.created_at);
    return (!from || d >= from) && (!to || d <= to);
  };

  // ── Derived datasets ──────────────────────────────────────────────────────
  const periodBookings = useMemo(
    () => bookings.filter(b => !cutoff || new Date(b.created_at) >= cutoff),
    [bookings, cutoff]
  );
  const prevBookings = useMemo(
    () => prevCutoff
      ? bookings.filter(b => inPeriod(b, prevCutoff, cutoff))
      : [],
    [bookings, prevCutoff, cutoff] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const confirmed = useMemo(() => periodBookings.filter(b => b.status === 'confirmed' || b.status === 'completed'), [periodBookings]);
  const cancelled = useMemo(() => periodBookings.filter(b => b.status === 'cancelled'), [periodBookings]);

  // KPI values
  const kpis = useMemo(() => {
    const revenue = periodBookings.reduce((s, b) => s + (b.total || 0), 0);
    const prevRevenue = prevBookings.reduce((s, b) => s + (b.total || 0), 0);
    const avgValue = periodBookings.length ? Math.round(revenue / periodBookings.length) : 0;
    const prevAvgValue = prevBookings.length ? Math.round(prevBookings.reduce((s, b) => s + (b.total || 0), 0) / prevBookings.length) : 0;
    const totalNights = periodBookings.reduce((s, b) => s + (b.nights || 0), 0);
    const avgNights = periodBookings.length ? (totalNights / periodBookings.length).toFixed(1) : 0;
    const prevNights = prevBookings.reduce((s, b) => s + (b.nights || 0), 0);
    const prevAvgNights = prevBookings.length ? (prevNights / prevBookings.length).toFixed(1) : 0;
    const cancellationRate = periodBookings.length ? Math.round((cancelled.length / periodBookings.length) * 100) : 0;
    const prevCancelled = prevBookings.filter(b => b.status === 'cancelled').length;
    const prevCancellationRate = prevBookings.length ? Math.round((prevCancelled / prevBookings.length) * 100) : 0;
    const bookedNights = confirmed.reduce((s, b) => s + (b.nights || 0), 0);
    const possibleNights = propertiesData.length * (period.days || 365);
    const occupancy = possibleNights ? Math.min(100, Math.round((bookedNights / possibleNights) * 100)) : 0;

    return [
      { label: 'Period Revenue', value: fmt(revenue), raw: revenue, prev: prevRevenue, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
      { label: 'Total Bookings', value: periodBookings.length, raw: periodBookings.length, prev: prevBookings.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
      { label: 'Avg Booking Value', value: fmt(avgValue), raw: avgValue, prev: prevAvgValue, icon: CreditCard, color: 'text-golden bg-golden/10' },
      { label: 'Avg Stay', value: `${avgNights} nights`, raw: parseFloat(avgNights), prev: parseFloat(prevAvgNights), icon: Star, color: 'text-purple-600 bg-purple-50' },
      { label: 'Occupancy Rate', value: `${occupancy}%`, raw: occupancy, prev: null, icon: Home, color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Cancellation Rate', value: `${cancellationRate}%`, raw: -cancellationRate, prev: -prevCancellationRate, icon: XCircle, color: 'text-red-500 bg-red-50' },
    ];
  }, [periodBookings, prevBookings, confirmed, cancelled, propertiesData, period]);

  // Revenue trend: group by week (≤90d) or month (>90d)
  const revenueTrend = useMemo(() => {
    const byMonth = {};
    const useWeeks = period.days !== null && period.days <= 90;

    periodBookings.forEach(b => {
      if (!b.created_at) return;
      const d = new Date(b.created_at);
      let key, label;
      if (useWeeks) {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
        label = weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }
      byMonth[key] = byMonth[key] || { label, revenue: 0, count: 0 };
      byMonth[key].revenue += b.total || 0;
      byMonth[key].count += 1;
    });

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [periodBookings, period]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts = {};
    periodBookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      status, value, label: STATUS_META[status]?.label || status, color: STATUS_META[status]?.color || '#ccc',
    })).sort((a, b) => b.value - a.value);
  }, [periodBookings]);

  // Top properties
  const topProperties = useMemo(() => {
    const map = {};
    periodBookings.forEach(b => {
      const key = b.property_id || b.property_title;
      map[key] = map[key] || { title: b.property_title, location: b.property_location, revenue: 0, count: 0, nights: 0 };
      map[key].revenue += b.total || 0;
      map[key].count += 1;
      map[key].nights += b.nights || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [periodBookings]);
  const maxPropRev = topProperties[0]?.revenue || 1;

  // Revenue by city
  const byCity = useMemo(() => {
    const map = {};
    periodBookings.forEach(b => {
      const city = b.property_location?.split(',').pop()?.trim() || 'Unknown';
      map[city] = (map[city] || 0) + (b.total || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [periodBookings]);
  const maxCityRev = byCity[0]?.[1] || 1;

  const handleAppStatus = async (id, status) => {
    setUpdatingAppId(id);
    try {
      await updateApplicationStatus(id, status);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {}
    finally { setUpdatingAppId(null); }
  };

  return (
    <div className="space-y-6">

      {/* Sub-nav */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview', label: 'Revenue Overview', icon: BarChart2 },
          { id: 'applications', label: `Host Applications${applications.length ? ` (${applications.length})` : ''}`, icon: Inbox },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              activeSection === id
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-gray-500 border-gray-200 hover:border-golden hover:text-golden'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW SECTION ── */}
      {activeSection === 'overview' && (
        <>
          {/* Period selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Period:</span>
            {PERIODS.map(p => (
              <button key={p.label} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  period.label === p.label
                    ? 'bg-golden text-white border-golden'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-golden hover:text-golden'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map(({ label, value, raw, prev, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={17} />
                  </div>
                  {prev !== null && <TrendBadge curr={raw} prev={prev} />}
                </div>
                <p className="text-2xl font-bold text-charcoal leading-none mb-1">{loading ? '—' : value}</p>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Revenue trend chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-charcoal text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-golden" /> Revenue Trend
              </h3>
              {revenueTrend.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                  {period.days && period.days <= 90 ? 'Weekly' : 'Monthly'}
                </span>
              )}
            </div>
            {loading ? (
              <div className="h-40 animate-pulse bg-gray-50 rounded-xl" />
            ) : revenueTrend.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No bookings in this period.</div>
            ) : (
              <RevenueLineChart data={revenueTrend} />
            )}
          </div>

          {/* Status breakdown + Top cities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal text-base mb-5 flex items-center gap-2">
                <Users size={16} className="text-golden" /> Booking Status
              </h3>
              {loading || statusBreakdown.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data.</div>
              ) : (
                <div className="flex items-center gap-6">
                  <DonutChart segments={statusBreakdown} />
                  <div className="flex-1 space-y-2.5">
                    {statusBreakdown.map(({ status, value, label, color }) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-sm text-gray-600">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-charcoal">{value}</span>
                          <span className="text-xs text-gray-400">
                            {periodBookings.length ? `${Math.round((value / periodBookings.length) * 100)}%` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Revenue by city */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal text-base mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-golden" /> Revenue by City
              </h3>
              {loading || byCity.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data.</div>
              ) : (
                <div className="space-y-3">
                  {byCity.map(([city, rev]) => (
                    <div key={city}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 font-medium">{city}</span>
                        <span className="text-sm font-bold text-golden">{fmtShort(rev)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-golden rounded-full transition-all duration-700"
                          style={{ width: `${(rev / maxCityRev) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Properties table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-charcoal text-base flex items-center gap-2">
                <Building2 size={16} className="text-golden" /> Top Properties
              </h3>
            </div>
            {loading || topProperties.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">No bookings in this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide font-bold">
                      <th className="px-6 py-3 text-left">Property</th>
                      <th className="px-4 py-3 text-right">Bookings</th>
                      <th className="px-4 py-3 text-right">Nights</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-6 py-3 text-right">Avg/Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProperties.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full bg-golden/30 shrink-0"
                              style={{ opacity: 0.3 + 0.7 * (1 - i / topProperties.length) }} />
                            <div>
                              <p className="font-semibold text-charcoal leading-snug">{p.title}</p>
                              {p.location && <p className="text-xs text-gray-400 mt-0.5">{p.location}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-charcoal">{p.count}</td>
                        <td className="px-4 py-4 text-right text-gray-600">{p.nights}</td>
                        <td className="px-4 py-4 text-right">
                          <div>
                            <span className="font-bold text-golden">{fmtShort(p.revenue)}</span>
                            <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-20 ml-auto">
                              <div className="h-full bg-golden rounded-full"
                                style={{ width: `${(p.revenue / maxPropRev) * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {fmt(Math.round(p.revenue / p.count))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HOST APPLICATIONS SECTION ── */}
      {activeSection === 'applications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-charcoal text-base flex items-center gap-2">
              <Inbox size={16} className="text-golden" /> Host Applications
              {!appsLoading && applications.length > 0 && (
                <span className="bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">{applications.length}</span>
              )}
            </h3>
            <div className="flex gap-2 text-xs">
              {Object.entries(APP_STATUS).map(([k, v]) => {
                const n = applications.filter(a => a.status === k).length;
                return n > 0 ? (
                  <span key={k} className={`px-2 py-1 rounded-full border font-bold ${v.cls}`}>{n} {v.label}</span>
                ) : null;
              })}
            </div>
          </div>

          {appsLoading ? (
            <div className="p-14 flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-14 text-center">
              <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No applications yet.</p>
              <p className="text-gray-400 text-xs mt-1">Applications submitted via the "Become a Host" page appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {applications.map(app => {
                const statusMeta = APP_STATUS[app.status] || APP_STATUS.pending;
                return (
                  <div key={app.id} className="p-5 hover:bg-gray-50/30 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-bold text-charcoal text-sm">{app.property_name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{app.property_type}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {app.city}{app.state ? `, ${app.state}` : ''}</span>
                          {app.expected_price && <span className="flex items-center gap-1"><CreditCard size={10} /> ₹{Number(app.expected_price).toLocaleString('en-IN')}/night</span>}
                          {(app.bedrooms || app.bathrooms || app.max_guests) && (
                            <span>
                              {app.bedrooms && `${app.bedrooms} BR`}
                              {app.bathrooms && ` · ${app.bathrooms} Bath`}
                              {app.max_guests && ` · ${app.max_guests} guests`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="font-semibold text-charcoal">{app.full_name}</span>
                          <a href={`mailto:${app.email}`} className="text-golden hover:underline">{app.email}</a>
                          {app.phone && (
                            <a href={`tel:${app.phone}`} className="flex items-center gap-1 hover:text-golden transition">
                              <Phone size={10} /> {app.phone}
                            </a>
                          )}
                        </div>
                        {app.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{app.description}</p>
                        )}
                        {app.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.amenities.slice(0, 5).map(a => (
                              <span key={a} className="text-xs bg-golden/10 text-golden px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                            {app.amenities.length > 5 && <span className="text-xs text-gray-400">+{app.amenities.length - 5} more</span>}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{fmtDate(app.created_at)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {app.status !== 'approved' && (
                          <button
                            onClick={() => handleAppStatus(app.id, 'approved')}
                            disabled={updatingAppId === app.id}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {app.status !== 'reviewing' && (
                          <button
                            onClick={() => handleAppStatus(app.id, 'reviewing')}
                            disabled={updatingAppId === app.id}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                          >
                            <Clock size={13} /> Reviewing
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleAppStatus(app.id, 'rejected')}
                            disabled={updatingAppId === app.id}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
