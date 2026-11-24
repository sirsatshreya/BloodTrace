import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  TrendingDown, 
  Filter, 
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BloodGroup, ComponentType } from '../types/bloodTrace';
import { COMPONENT_STORAGE_SPECS } from '../data/mockData';

export const ExpiryPage: React.FC<{
  onOpenExcursionReview: (unitId: string) => void;
}> = ({ onOpenExcursionReview }) => {
  const { units, setActiveTab, setSelectedUnitIdForTracking } = useBloodTrace();

  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [activeTabSection, setActiveTabSection] = useState<'eligible' | 'nearExpiry' | 'expired' | 'quarantined'>('eligible');

  const nowTime = new Date('2026-10-12T22:00:00Z').getTime();

  // Categorize Units
  const { eligibleFEFO, nearExpiryList, expiredList, quarantinedList } = useMemo(() => {
    // 1. Eligible units for transfusion (MUST be Available or In Transit, NOT Expired, NOT Quarantined)
    const eligible = units
      .filter(u => u.unitStatus === 'Available' || u.unitStatus === 'Reserved')
      .filter(u => new Date(u.expiryDate).getTime() > nowTime)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    // 2. Near-expiry units (within 7 days)
    const near = units
      .filter(u => {
        const exp = new Date(u.expiryDate).getTime();
        const diffDays = (exp - nowTime) / (1000 * 60 * 60 * 24);
        return diffDays > 0 && diffDays <= 7 && u.unitStatus !== 'Expired';
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    // 3. Expired units (strictly ineligible for transfusion)
    const expired = units
      .filter(u => u.unitStatus === 'Expired' || new Date(u.expiryDate).getTime() <= nowTime)
      .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());

    // 4. Quarantined units
    const quarantined = units.filter(u => u.unitStatus === 'Quarantined');

    return {
      eligibleFEFO: eligible,
      nearExpiryList: near,
      expiredList: expired,
      quarantinedList: quarantined,
    };
  }, [units, nowTime]);

  // Apply filters to current active section
  const currentDisplayedList = useMemo(() => {
    let source = eligibleFEFO;
    if (activeTabSection === 'nearExpiry') source = nearExpiryList;
    if (activeTabSection === 'expired') source = expiredList;
    if (activeTabSection === 'quarantined') source = quarantinedList;

    return source.filter(u => {
      const matchGroup = groupFilter === 'all' || u.bloodGroup === groupFilter;
      const matchComp = componentFilter === 'all' || u.componentType === componentFilter;
      return matchGroup && matchComp;
    });
  }, [activeTabSection, eligibleFEFO, nearExpiryList, expiredList, quarantinedList, groupFilter, componentFilter]);

  const handleTrack = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
  };

  return (
    <div className="space-y-6">
      {/* Educational FEFO Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-900">
                FEFO (First-Expiry-First-Out) Clinical Prioritization Engine
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              FEFO dynamically ranks blood products by chronological shelf-life expiration. By dispensing units closest to expiry first, Blood Traceability and Availability drastically reduces wastage and prevents discards, while strictly walling off expired and thermally compromised units.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Wastage Reduction</span>
              <span className="text-lg font-mono font-bold text-emerald-700">98.4%</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Avoided Discards</span>
              <span className="text-lg font-mono font-bold text-slate-900">42 Units / Mo</span>
            </div>
          </div>
        </div>

        {/* Warning Callout: Expired Units Rule */}
        <div className="mt-4 p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Strict Safety Rule: </span>
            <span>
              Expired units ({expiredList.length}) and Quarantined units ({quarantinedList.length}) are strictly locked out of the clinical dispensing queue and can never be selected for transfusion or dispatched to hospitals.
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Section Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Functional Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTabSection('eligible')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTabSection === 'eligible'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Eligible FEFO Queue ({eligibleFEFO.length})
          </button>
          <button
            onClick={() => setActiveTabSection('nearExpiry')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTabSection === 'nearExpiry'
                ? 'bg-white text-amber-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Near Expiry ({nearExpiryList.length})
          </button>
          <button
            onClick={() => setActiveTabSection('quarantined')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTabSection === 'quarantined'
                ? 'bg-white text-red-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarantine Bay ({quarantinedList.length})
          </button>
          <button
            onClick={() => setActiveTabSection('expired')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTabSection === 'expired'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expired Ineligible ({expiredList.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Groups</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <select
            value={componentFilter}
            onChange={e => setComponentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Components</option>
            <option value="Packed Red Blood Cells (PRBC)">PRBC</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="Platelet Concentrate">Platelets</option>
            <option value="Fresh Frozen Plasma (FFP)">FFP</option>
            <option value="Cryoprecipitate">Cryo</option>
          </select>
        </div>
      </div>

      {/* Main FEFO Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">FEFO Priority Rank</th>
                <th className="py-3 px-3">Unit ID</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3">Component</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Remaining Time</th>
                <th className="py-3 px-3">Current Location</th>
                <th className="py-3 px-3">Clinical Justification & Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDisplayedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No units in this category match the selected filters.
                  </td>
                </tr>
              ) : (
                currentDisplayedList.map((unit, index) => {
                  const expTime = new Date(unit.expiryDate).getTime();
                  const diffHours = Math.round((expTime - nowTime) / (1000 * 60 * 60));
                  const diffDays = Math.ceil(diffHours / 24);
                  const isExpired = diffHours <= 0;

                  return (
                    <tr
                      key={unit.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        activeTabSection === 'eligible' && index === 0 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Priority Rank */}
                      <td className="py-3 px-4">
                        {activeTabSection === 'eligible' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 font-mono font-bold flex items-center justify-center text-[11px]">
                              {index + 1}
                            </span>
                            {index === 0 && (
                              <span className="text-[10px] font-bold text-red-700 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                                Next Out
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400">#{index + 1}</span>
                        )}
                      </td>

                      {/* Unit ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{unit.id}</td>

                      {/* Blood Group */}
                      <td className="py-3 px-3 font-mono font-bold text-base text-red-700">{unit.bloodGroup}</td>

                      {/* Component */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{unit.componentType.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{unit.volumeMl}mL</span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {unit.expiryDate.split('T')[0]}
                      </td>

                      {/* Remaining Time */}
                      <td className="py-3 px-3 font-mono">
                        {isExpired ? (
                          <span className="text-red-700 font-bold">EXPIRED ({Math.abs(diffDays)}d ago)</span>
                        ) : diffDays <= 2 ? (
                          <span className="text-red-700 font-bold">{diffHours} hours ({diffDays}d)</span>
                        ) : diffDays <= 7 ? (
                          <span className="text-amber-700 font-semibold">{diffDays} days</span>
                        ) : (
                          <span className="text-emerald-700">{diffDays} days</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={unit.currentLocation}>
                        {unit.currentLocation.split(' - ')[0]}
                      </td>

                      {/* Explanation of why unit appears */}
                      <td className="py-3 px-3 text-slate-600">
                        {activeTabSection === 'eligible' && (
                          <span className="text-[11px]">
                            {index === 0 
                              ? `Priority #1: Earliest expiration (${diffDays}d left). Scheduled for immediate dispatch.`
                              : `Priority #${index + 1}: Valid shelf-life, queued after unit #${index}.`}
                          </span>
                        )}
                        {activeTabSection === 'nearExpiry' && (
                          <span className="text-[11px] text-amber-800">
                            Warning: Shelf-life expiration in {diffDays} days. Prioritize matching hospital requisitions.
                          </span>
                        )}
                        {activeTabSection === 'quarantined' && (
                          <span className="text-[11px] text-red-700">
                            {unit.quarantineReason || 'Quarantined: Awaiting clinical review.'}
                          </span>
                        )}
                        {activeTabSection === 'expired' && (
                          <span className="text-[11px] text-slate-500">
                            Ineligible: Shelf-life exceeded. Scheduled for biohazard neutralization.
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleTrack(unit.id)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
                        >
                          Track
                        </button>
                        {unit.unitStatus === 'Quarantined' && (
                          <button
                            onClick={() => onOpenExcursionReview(unit.id)}
                            className="px-2 py-1 text-white bg-red-700 hover:bg-red-800 rounded text-[11px] font-semibold"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
