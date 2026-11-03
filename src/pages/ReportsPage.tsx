import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingDown, 
  ShieldCheck, 
  Thermometer, 
  Truck, 
  CheckCircle2, 
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useBloodTrace } from '../context/BloodTraceContext';

const COMPONENT_BREAKDOWN_DATA = [
  { name: 'PRBC', count: 7, color: '#b91c1c' },
  { name: 'Platelets', count: 3, color: '#f59e0b' },
  { name: 'Whole Blood', count: 2, color: '#dc2626' },
  { name: 'FFP Plasma', count: 2, color: '#0284c7' },
  { name: 'Cryoprecipitate', count: 1, color: '#6366f1' },
];

const STATUS_DISTRIBUTION_DATA = [
  { name: 'Available', value: 8, color: '#16a34a' },
  { name: 'In Transit', value: 2, color: '#0284c7' },
  { name: 'Reserved', value: 1, color: '#f59e0b' },
  { name: 'Quarantined', value: 1, color: '#ef4444' },
  { name: 'Expired', value: 1, color: '#64748b' },
];

const MONTHLY_WASTAGE_TREND_DATA = [
  { month: 'Jun', beforeFEFO: 14, withBloodTrace: 4 },
  { month: 'Jul', beforeFEFO: 18, withBloodTrace: 3 },
  { month: 'Aug', beforeFEFO: 15, withBloodTrace: 2 },
  { month: 'Sep', beforeFEFO: 16, withBloodTrace: 1 },
  { month: 'Oct', beforeFEFO: 12, withBloodTrace: 1 },
];

export const ReportsPage: React.FC = () => {
  const { exportInventoryCSV, units } = useBloodTrace();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-6">
      {/* Top Banner and CSV Export Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Cold-Chain Analytics & Regulatory Audits</h2>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              DEMO DATA ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Key performance indicators, cold-chain compliance ratios, and FEFO inventory salvage statistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 rounded transition-colors ${dateRange === '7d' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded transition-colors ${dateRange === '30d' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-2.5 py-1 rounded transition-colors ${dateRange === '90d' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'}`}
            >
              Quarter (Q3)
            </button>
          </div>

          {/* Download CSV Button */}
          <button
            onClick={exportInventoryCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Audit Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Cold-Chain Compliance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-emerald-700">99.1%</span>
            <span className="text-xs text-emerald-600">▲ +1.4%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Within 2°C–6°C target window</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Avg Handover Transit Time</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-slate-900">42 min</span>
            <span className="text-xs text-slate-500">dock-to-dock</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Well within 120-min SLA</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Wastage Reduction (FEFO)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-red-700">-83.3%</span>
            <span className="text-xs text-slate-500">discards</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">42 units salvaged this quarter</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Verified Handovers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-slate-900">128</span>
            <span className="text-xs text-emerald-600">100% sealed</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Digital signatures intact</span>
        </div>
      </div>

      {/* Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Blood Wastage Trends (Before vs With BloodTrace FEFO) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Blood Product Wastage Reduction Trend</h3>
            <p className="text-xs text-slate-500">
              Monthly expired units before vs after implementing BloodTrace FEFO tracking
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_WASTAGE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit=" u" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="beforeFEFO" name="Pre-BloodTrace (FIFO/Manual)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withBloodTrace" name="With BloodTrace (FEFO + Telemetry)" fill="#b91c1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Status Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Current Inventory Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution across active lifecycle states</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {STATUS_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Units`, 'Quantity']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Component Type Table Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Component Type Storage Compliance Audit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold">
                <th className="py-2.5 px-3">Component Name</th>
                <th className="py-2.5 px-3">Target Safe Range</th>
                <th className="py-2.5 px-3">Shelf Life Window</th>
                <th className="py-2.5 px-3">Storage Modality</th>
                <th className="py-2.5 px-3 text-right">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPONENT_BREAKDOWN_DATA.map(comp => (
                <tr key={comp.name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{comp.name}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                    {comp.name.includes('PRBC') || comp.name.includes('Whole')
                      ? '2.0°C to 6.0°C'
                      : comp.name.includes('Platelet')
                      ? '20.0°C to 24.0°C'
                      : '≤ -18.0°C'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {comp.name.includes('PRBC')
                      ? '42 days'
                      : comp.name.includes('Whole')
                      ? '35 days'
                      : comp.name.includes('Platelet')
                      ? '5 days'
                      : '365 days'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {comp.name.includes('Platelet') ? 'Agitator Rack' : comp.name.includes('Plasma') ? 'Deep Freeze' : 'Cold Room'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {comp.count} bags
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
