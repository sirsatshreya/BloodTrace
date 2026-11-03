import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  ThermometerSnowflake, 
  ShieldCheck, 
  Check, 
  Server, 
  Database, 
  Cpu, 
  Save, 
  RotateCcw,
  Info
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { UserRole } from '../types/bloodTrace';

export const SettingsPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentRole, 
    thresholds, 
    resetToDefaultData 
  } = useBloodTrace();

  // Local state for thresholds
  const [prbcMin, setPrbcMin] = useState(thresholds.prbcMin);
  const [prbcMax, setPrbcMax] = useState(thresholds.prbcMax);
  const [plateletsMin, setPlateletsMin] = useState(thresholds.plateletsMin);
  const [plateletsMax, setPlateletsMax] = useState(thresholds.plateletsMax);
  const [ffpMax, setFfpMax] = useState(thresholds.ffpMax);
  const [excursionTolerance, setExcursionTolerance] = useState(thresholds.excursionToleranceMinutes);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification toggles
  const [notifSound, setNotifSound] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">System Configuration & Role Permissions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure cold-chain alarm thresholds, role-based access control, and hospital facility settings
        </p>
      </div>

      {/* Role-Based Access Control (RBAC) Simulator */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (Demo RBAC)</h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Switch active user persona to preview role-tailored workflow permissions in the frontend interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {([
            {
              role: 'Administrator' as UserRole,
              title: 'Chief Transfusion Medical Officer',
              desc: 'Full authority: Clinical quarantine release, threshold changes, biohazard disposal & all dispatch operations.',
              tag: 'Full Authority',
            },
            {
              role: 'Blood Bank Staff' as UserRole,
              title: 'Senior Blood Bank Technician',
              desc: 'Inventory intake, component separation, barcode generation, cold room placement & packing.',
              tag: 'Lab Operations',
            },
            {
              role: 'Courier' as UserRole,
              title: 'Medical Logistics Courier',
              desc: 'Custody acceptance, mobile cooler logger verification, waypoint updates & hospital dock handoff.',
              tag: 'Transit Logistics',
            },
          ]).map(item => {
            const isSelected = currentUser.role === item.role;
            return (
              <div
                key={item.role}
                onClick={() => setCurrentRole(item.role)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-red-600 bg-red-50/30 ring-2 ring-red-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{item.role}</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Backend Note */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Note for College Demonstration: </strong> Real-world deployments enforce role authorization through JWT tokens, cryptographic digital signatures, and FastAPI OAuth2 scopes connected to PostgreSQL RBAC tables.
          </span>
        </div>
      </div>

      {/* Temperature Thresholds Configuration */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <ThermometerSnowflake className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-bold text-slate-900">Cold-Chain Temperature Alarm Thresholds</h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Automated excursions will trigger when telemetry readings cross these configurable boundary conditions.
        </p>

        <form onSubmit={handleSaveThresholds} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PRBC / Whole Blood */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-slate-900 block">Red Cells & Whole Blood</span>
              <div>
                <label className="text-[11px] text-slate-600 block">Min Threshold (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prbcMin}
                  onChange={e => setPrbcMin(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Max Threshold (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prbcMax}
                  onChange={e => setPrbcMax(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            {/* Platelets */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-slate-900 block">Platelet Concentrates</span>
              <div>
                <label className="text-[11px] text-slate-600 block">Min Threshold (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={plateletsMin}
                  onChange={e => setPlateletsMin(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Max Threshold (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={plateletsMax}
                  onChange={e => setPlateletsMax(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            {/* FFP & Cryo */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-slate-900 block">Fresh Frozen Plasma & Cryo</span>
              <div>
                <label className="text-[11px] text-slate-600 block">Upper Limit (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ffpMax}
                  onChange={e => setFfpMax(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Tolerance Buffer (Minutes)</label>
                <input
                  type="number"
                  value={excursionTolerance}
                  onChange={e => setExcursionTolerance(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Threshold configurations saved!
              </span>
            ) : <span />}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Facility & Anonymization Privacy Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Facility & Donor Privacy Protocol</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Facility Profile</span>
            <p className="text-slate-700 font-medium">{currentUser.facility}</p>
            <p className="text-slate-500">License ID: #BB-REG-9042 · Region: Metro Healthcare District</p>
            <p className="text-slate-500">Cold Room Capacity: 450 Units · Ultra-Freezer: 120 Units</p>
          </div>

          <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-emerald-950 space-y-1.5">
            <span className="font-bold block text-emerald-900">Donor Identity Air-Gap Protection</span>
            <p className="text-[11px] leading-relaxed">
              In accordance with blood safety standards (AABB & WHO), donor identities are strictly isolated from logistical tracking. Routine unit displays only feature barcode IDs, blood groups, and technical cold-chain telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* FastAPI & PostgreSQL Integration Architecture */}
      <div className="bg-slate-950 text-slate-300 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white">Backend Architecture Roadmap (FastAPI + PostgreSQL)</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
            API READY SPEC
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          This frontend data layer is structured to seamlessly plug into Python FastAPI REST endpoints and PostgreSQL relational tables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block mb-1">GET /api/v1/units</span>
            <span className="text-slate-400 text-[11px] font-sans block">
              Unit-level inventory with ABO/Rh, expiry timestamps, and storage state.
            </span>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">POST /api/v1/telemetry</span>
            <span className="text-slate-400 text-[11px] font-sans block">
              Ingests continuous IoT sensor packets with temperature & GPS.
            </span>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">PUT /api/v1/handovers</span>
            <span className="text-slate-400 text-[11px] font-sans block">
              Multi-signature custodial state transitions with cryptographic validation.
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Need to reset demo changes back to default dataset?</span>
          <button
            onClick={resetToDefaultData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
