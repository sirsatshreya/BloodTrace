import React from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  ThermometerSnowflake, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BloodGroup } from '../types/bloodTrace';
import { COLD_STORAGE_CHART_SERIES } from '../data/mockData';

export const DashboardPage: React.FC<{
  onOpenExcursionReview: (unitId: string) => void;
  onOpenQR: (unitId: string) => void;
}> = ({ onOpenExcursionReview, onOpenQR }) => {
  const { 
    units, 
    handovers, 
    notifications, 
    setActiveTab, 
    setSelectedUnitIdForTracking,
    acknowledgeAlert
  } = useBloodTrace();

  // Metrics calculation
  const totalUnits = units.length;
  const availableUnits = units.filter(u => u.unitStatus === 'Available').length;
  const inTransitUnits = units.filter(u => u.unitStatus === 'In Transit').length;
  
  // Nearing expiry: within 7 days
  const nowTime = new Date('2026-10-12T22:00:00Z').getTime();
  const nearExpiryUnits = units.filter(u => {
    const expTime = new Date(u.expiryDate).getTime();
    const diffDays = (expTime - nowTime) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7 && u.unitStatus !== 'Expired';
  });

  const activeTempAlerts = units.filter(u => u.temperatureStatus === 'Critical' || u.temperatureStatus === 'Warning').length;
  const quarantinedUnits = units.filter(u => u.unitStatus === 'Quarantined').length;

  // Blood group distribution chart data
  const bloodGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const groupData = bloodGroups.map(bg => {
    const count = units.filter(u => u.bloodGroup === bg && u.unitStatus !== 'Expired').length;
    return { group: bg, count };
  });

  // Critical alerts list
  const criticalAlerts = notifications.filter(
    n => n.severity === 'critical' || (!n.isAcknowledged && n.severity === 'warning')
  );

  const handleTrackUnit = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
  };

  return (
    <div className="space-y-6">
      {/* Critical Banner if any units are quarantined or under temperature violation */}
      {quarantinedUnits > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-900">
                Action Required: {quarantinedUnits} Unit{quarantinedUnits > 1 ? 's' : ''} Under Quarantine
              </h2>
              <p className="text-xs text-red-700">
                Cold-chain excursion or shelf-life limit detected. Biological disposition protocol active.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('temperature')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            Review Excursions
          </button>
        </div>
      )}

      {/* 6 Key Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Units</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {totalUnits}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">units</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across 3 facilities</div>
        </div>

        {/* Available Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Available Units</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-700 tabular-nums">
              {availableUnits}
            </span>
            <span className="text-[10px] text-emerald-600 font-sans font-medium">Ready</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Passed all clearance tests</div>
        </div>

        {/* Units in Transit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">In Transit</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-sky-700 tabular-nums">
              {inTransitUnits}
            </span>
            <span className="text-[10px] text-sky-600 font-sans">active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Couriers on monitored route</div>
        </div>

        {/* Units Nearing Expiry */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Near Expiry</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-700 tabular-nums">
              {nearExpiryUnits.length}
            </span>
            <span className="text-[10px] text-amber-600 font-sans">≤ 7 days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">FEFO priority dispatch queue</div>
        </div>

        {/* Active Temp Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Temp Alerts</span>
            <ThermometerSnowflake className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-red-700 tabular-nums">
              {activeTempAlerts}
            </span>
            <span className="text-[10px] text-red-600 font-sans">excursions</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Outside safe tolerances</div>
        </div>

        {/* Quarantined Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Quarantined</span>
            <ShieldAlert className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {quarantinedUnits}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">held</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Awaiting medical clearance</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section A: Blood Inventory Distribution by Group (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Blood Inventory Distribution</h2>
              <p className="text-xs text-slate-500">Active non-expired units by ABO/Rh group</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
            >
              Full Registry <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
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
                <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Universal RBC</span>
              <span className="font-mono font-bold text-slate-800">
                {units.filter(u => u.bloodGroup === 'O-').length} units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Universal Plasma</span>
              <span className="font-mono font-bold text-slate-800">
                {units.filter(u => u.bloodGroup === 'AB+').length} units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Platelet Stock</span>
              <span className="font-mono font-bold text-slate-800">
                {units.filter(u => u.componentType.includes('Platelet')).length} bags
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Plasma Stock</span>
              <span className="font-mono font-bold text-slate-800">
                {units.filter(u => u.componentType.includes('Plasma')).length} bags
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Temperature Monitoring Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Cold-Chain Temperature Telemetry</h2>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  2°C – 6°C Range
                </span>
              </div>
              <p className="text-xs text-slate-500">Live multi-sensor stream from Cold Room A & Transit Cooler 09</p>
            </div>
            <button
              onClick={() => setActiveTab('temperature')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
            >
              Telemetry Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COLD_STORAGE_CHART_SERIES} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 8]} tick={{ fill: '#64748b', fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val}°C`, name === 'coldRoomA' ? 'Cold Storage A' : 'Transit Van #04']}
                />
                {/* Safe zone highlight (2°C - 6°C) */}
                <ReferenceArea y1={2.0} y2={6.0} fill="#10b981" fillOpacity={0.08} />
                <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min 2°C', fill: '#059669', fontSize: 10 }} />
                <ReferenceLine y={6.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Max 6°C', fill: '#dc2626', fontSize: 10 }} />

                <Line type="monotone" dataKey="coldRoomA" name="Cold Storage A" stroke="#b91c1c" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="transitVan04" name="Transit Cooler 09" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                Cold Room A (Sensor RF-104): 4.1°C
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                Transit Van #04: 4.8°C
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">DEMO TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Near-Expiry FEFO Table & Recent Activity & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section D: Near-Expiry Units (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Near-Expiry Units (FEFO Priority)</h2>
              <p className="text-xs text-slate-500">Eligible units sorted by First-Expiry-First-Out for dispatch</p>
            </div>
            <button
              onClick={() => setActiveTab('expiry')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
            >
              FEFO Optimizer <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 pr-2">Unit ID</th>
                  <th className="py-2.5 px-2">Group</th>
                  <th className="py-2.5 px-2">Component</th>
                  <th className="py-2.5 px-2">Expiry Date</th>
                  <th className="py-2.5 px-2">Location</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nearExpiryUnits.slice(0, 4).map(unit => {
                  const expDate = new Date(unit.expiryDate);
                  const daysLeft = Math.ceil((expDate.getTime() - nowTime) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-2 font-mono font-bold text-slate-900">
                        {unit.id}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-red-700">
                        {unit.bloodGroup}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 truncate max-w-[120px]">
                        {unit.componentType.split(' ')[0]}
                      </td>
                      <td className="py-2.5 px-2 font-mono">
                        <span className="font-semibold text-amber-700">{unit.expiryDate.split('T')[0]}</span>
                        <span className="text-[10px] text-slate-400 block">({daysLeft}d remaining)</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 truncate max-w-[130px]">
                        {unit.currentLocation.split('-')[0]}
                      </td>
                      <td className="py-2.5 px-2">
                        <StatusBadge type="unit" value={unit.unitStatus} />
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <button
                          onClick={() => handleTrackUnit(unit.id)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-red-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section C & E: Critical Alerts & Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section E: Critical Alerts Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Critical Cold-Chain Alerts</h2>
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                {criticalAlerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border border-red-200/80 bg-red-50/40 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span className="font-bold text-red-950 leading-tight">{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-red-800 leading-snug line-clamp-2">{alert.description}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    {alert.unitId && (
                      <button
                        onClick={() => onOpenExcursionReview(alert.unitId!)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-red-700 hover:bg-red-800 rounded transition-colors whitespace-nowrap"
                      >
                        Review
                      </button>
                    )}
                    {!alert.isAcknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Recent Activity Feed */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Recent Supply Chain Activity</h2>
              <span className="text-[11px] text-slate-400">Live audit events</span>
            </div>

            <div className="space-y-3">
              {handovers[0]?.history.slice(0, 3).map((hist, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{hist.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{hist.details}</p>
                    <span className="text-[10px] text-slate-400">Actor: {hist.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
