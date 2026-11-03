import React, { useState } from 'react';
import { 
  Thermometer, 
  ThermometerSnowflake, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Snowflake, 
  Radio, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
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
import { COMPONENT_STORAGE_SPECS, COLD_STORAGE_CHART_SERIES } from '../data/mockData';

export const TemperaturePage: React.FC<{
  onOpenExcursionReview: (unitId: string) => void;
}> = ({ onOpenExcursionReview }) => {
  const { 
    units, 
    notifications, 
    simulateTemperatureExcursion, 
    restoreNormalTemperature, 
    acknowledgeAlert,
    setActiveTab,
    setSelectedUnitIdForTracking
  } = useBloodTrace();

  const [selectedSensorChannel, setSelectedSensorChannel] = useState<'coldRoomA' | 'transitVan04' | 'freezerFFP'>('coldRoomA');
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);

  // Active excursions across units
  const excursionUnits = units.filter(u => u.temperatureStatus === 'Critical' || u.unitStatus === 'Quarantined');
  const warningUnits = units.filter(u => u.temperatureStatus === 'Warning');

  // Interactive demo trigger for selected unit
  const [targetUnitForSim, setTargetUnitForSim] = useState<string>('BT-2026-001');

  const handleSimulateExcursionHigh = () => {
    simulateTemperatureExcursion(targetUnitForSim, 7.8);
  };

  const handleSimulateExcursionLow = () => {
    simulateTemperatureExcursion(targetUnitForSim, 0.8);
  };

  const handleRestoreNormal = () => {
    restoreNormalTemperature(targetUnitForSim);
  };

  const selectedTargetUnit = units.find(u => u.id === targetUnitForSim) || units[0];
  const targetSpecs = COMPONENT_STORAGE_SPECS[selectedTargetUnit.componentType];

  return (
    <div className="space-y-6">
      {/* Simulation Control Bar (Prominently marked DEMO DATA) */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                DEMO SIMULATION CONTROLLER
              </span>
              <span className="text-xs text-slate-400 font-mono">IoT Telemetry Node Simulator</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Cold-Chain Temperature Sensor Test Harness
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Simulate IoT thermal breaches and test compliance protocols. Excursions automatically enforce clinical quarantine until approved by the Medical Officer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={targetUnitForSim}
              onChange={e => setTargetUnitForSim(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.id} ({u.bloodGroup} {u.componentType.split(' ')[0]}) - {u.currentTemperature}°C
                </option>
              ))}
            </select>

            <button
              onClick={handleSimulateExcursionHigh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              title="Simulate heat breach above 6°C"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trigger High Spike (7.8°C)</span>
            </button>

            <button
              onClick={handleSimulateExcursionLow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              title="Simulate freezing event below 2°C"
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Trigger Cold Drop (0.8°C)</span>
            </button>

            <button
              onClick={handleRestoreNormal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
              title="Return sensor to nominal 4.1°C (Note: Unit remains Quarantined per clinical rules)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Normalize Temp (4.1°C)</span>
            </button>
          </div>
        </div>

        {/* Clinical Note Warning */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Safety Principle: Returning sensor to normal does NOT clear clinical quarantine without authorized medical officer review.
          </span>
          <span className="font-mono text-slate-400">STATUS: READY</span>
        </div>
      </div>

      {/* 3 Physical Chamber Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sensor 1: Cold Storage Room A */}
        <div
          onClick={() => setSelectedSensorChannel('coldRoomA')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            selectedSensorChannel === 'coldRoomA'
              ? 'border-red-600 ring-2 ring-red-600/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-900">Cold Room A (PRBC)</span>
            <span className="font-mono text-[10px] text-slate-400">SENSOR-RF-104</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">4.1</span>
              <span className="text-sm font-mono text-slate-500">°C</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Optimal
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Range: 2.0°C to 6.0°C</span>
            <span className="font-mono">Last tick: 1m ago</span>
          </div>
        </div>

        {/* Sensor 2: Transit Cooler 09 */}
        <div
          onClick={() => setSelectedSensorChannel('transitVan04')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            selectedSensorChannel === 'transitVan04'
              ? 'border-sky-600 ring-2 ring-sky-600/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-900">Mobile Transit Cooler 09</span>
            <span className="font-mono text-[10px] text-slate-400">SENSOR-IOT-209</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-mono font-bold text-sky-700 tabular-nums">4.8</span>
              <span className="text-sm font-mono text-sky-600">°C</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              In Transit
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Van #04 (En route St. Jude)</span>
            <span className="font-mono">GPS Sync Active</span>
          </div>
        </div>

        {/* Sensor 3: Ultra-Low Freezer Unit 01 */}
        <div
          onClick={() => setSelectedSensorChannel('freezerFFP')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            selectedSensorChannel === 'freezerFFP'
              ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-900">Deep Freeze 01 (FFP)</span>
            <span className="font-mono text-[10px] text-slate-400">SENSOR-FRZ-01</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-mono font-bold text-indigo-700 tabular-nums">-24.5</span>
              <span className="text-sm font-mono text-indigo-500">°C</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Frozen Deep
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Limit: ≤ -18.0°C</span>
            <span className="font-mono">14 Units Stored</span>
          </div>
        </div>
      </div>

      {/* Main Telemetry Chart Container */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Continuous Telemetry Curve: Cold Storage & Transport
              </h3>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Hourly Historical Resolution
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Shaded green band represents the mandatory clinical tolerance window (2.0°C – 6.0°C)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-700" /> Cold Storage Room A
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Transit Van #04
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={COLD_STORAGE_CHART_SERIES} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 9]} tick={{ fill: '#64748b', fontSize: 11 }} unit="°C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              {/* Tolerance Area */}
              <ReferenceArea y1={2.0} y2={6.0} fill="#10b981" fillOpacity={0.08} />
              <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Lower Bound 2°C', fill: '#059669', fontSize: 10 }} />
              <ReferenceLine y={6.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Upper Bound 6°C', fill: '#dc2626', fontSize: 10 }} />

              <Line type="monotone" dataKey="coldRoomA" name="Cold Storage A" stroke="#b91c1c" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="transitVan04" name="Transit Cooler 09" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Units Under Thermal Violation or Review Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Units Under Thermal Incident or Quarantine</h3>
            <p className="text-xs text-slate-500">
              Units flagged by automated sensor breaches requiring medical director disposition
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded">
            {excursionUnits.length} Units Affected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Unit ID</th>
                <th className="py-3 px-3">Blood Group</th>
                <th className="py-3 px-3">Current Temp</th>
                <th className="py-3 px-3">Location & Sensor</th>
                <th className="py-3 px-3">Thermal Status</th>
                <th className="py-3 px-3">Quarantine Justification</th>
                <th className="py-3 px-4 text-right">Clinical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {excursionUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No units currently under thermal violation. All units within safe cold-chain tolerances.
                  </td>
                </tr>
              ) : (
                excursionUnits.map(unit => (
                  <tr key={unit.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{unit.id}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-700">{unit.bloodGroup}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-700">{unit.currentTemperature}°C</td>
                    <td className="py-3 px-3 text-slate-600">
                      <span>{unit.currentLocation}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{unit.sensorId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="temp" value={unit.temperatureStatus} />
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={unit.quarantineReason}>
                      {unit.quarantineReason || 'Temperature outside configured threshold.'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUnitIdForTracking(unit.id);
                          setActiveTab('tracking');
                        }}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                      >
                        Track
                      </button>
                      <button
                        onClick={() => onOpenExcursionReview(unit.id)}
                        className="px-2.5 py-1 text-white bg-red-700 hover:bg-red-800 rounded font-semibold"
                      >
                        Review Disposition
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
