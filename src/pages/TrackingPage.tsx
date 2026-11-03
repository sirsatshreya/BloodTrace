import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Thermometer, 
  Truck, 
  Building2, 
  UserCheck, 
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { COMPONENT_STORAGE_SPECS } from '../data/mockData';

export const TrackingPage: React.FC<{
  onOpenQRScanner: () => void;
  onOpenQRModal: (unit: any) => void;
  onOpenExcursionReview: (unitId: string) => void;
}> = ({ onOpenQRScanner, onOpenQRModal, onOpenExcursionReview }) => {
  const { units, selectedUnitIdForTracking, setSelectedUnitIdForTracking } = useBloodTrace();

  const [inputSearchId, setInputSearchId] = useState(selectedUnitIdForTracking);

  const selectedUnit = units.find(u => u.id.toLowerCase() === selectedUnitIdForTracking.toLowerCase()) || units[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSearchId.trim()) {
      const match = units.find(u => u.id.toLowerCase() === inputSearchId.trim().toLowerCase());
      if (match) {
        setSelectedUnitIdForTracking(match.id);
      }
    }
  };

  const specs = COMPONENT_STORAGE_SPECS[selectedUnit.componentType];

  return (
    <div className="space-y-6">
      {/* Search & Scan Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputSearchId}
              onChange={e => setInputSearchId(e.target.value)}
              placeholder="Enter Unit ID (e.g. BT-2026-001, BT-2026-002, BT-2026-003)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Search Unit
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenQRScanner}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>

      {/* Blood Unit Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex flex-col items-center justify-center font-mono shrink-0">
              <span className="text-sm font-black leading-none">{selectedUnit.bloodGroup}</span>
              <span className="text-[9px] font-bold tracking-tight text-red-600">RH</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-mono font-bold text-slate-900 tracking-tight">
                  {selectedUnit.id}
                </h2>
                <StatusBadge type="unit" value={selectedUnit.unitStatus} />
                <StatusBadge type="temp" value={selectedUnit.temperatureStatus} />
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {selectedUnit.componentType} · {selectedUnit.volumeMl} mL · Anticoagulant: {selectedUnit.anticoagulant}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQRModal(selectedUnit)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-red-700" />
              <span>ISBT-128 Label</span>
            </button>
            {selectedUnit.unitStatus === 'Quarantined' && (
              <button
                onClick={() => onOpenExcursionReview(selectedUnit.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Clinical Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Attribute Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Current Location
            </span>
            <p className="font-semibold text-slate-900 mt-0.5">{selectedUnit.currentLocation}</p>
            <span className="text-[11px] font-mono text-slate-500">
              Container: {selectedUnit.assignedContainerId}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Custody Holder
            </span>
            <p className="font-semibold text-slate-900 mt-0.5">{selectedUnit.currentCustodian}</p>
            <span className="text-[11px] text-slate-500">Chain of custody signed</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Collection & Expiry
            </span>
            <p className="font-mono text-slate-800 mt-0.5">
              Coll: {selectedUnit.collectionDate.split('T')[0]}
            </p>
            <p className="font-mono font-bold text-red-800">
              Exp: {selectedUnit.expiryDate.split('T')[0]}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Cold-Chain Spec
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono font-bold">
              <span className={selectedUnit.temperatureStatus === 'Critical' ? 'text-red-700' : 'text-slate-900'}>
                {selectedUnit.currentTemperature}°C
              </span>
              <span className="text-slate-400 font-normal">
                (Spec: {specs.minTemp}°C to {specs.maxTemp}°C)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Sensor: {selectedUnit.sensorId}</span>
          </div>
        </div>
      </div>

      {/* 7-Step Tracking Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900">Unit Traceability Lifecycle & Chain of Custody</h3>
          <p className="text-xs text-slate-500">
            Real-time audit ledger tracking physical milestones, IoT temperature checkpoints, and verified operators
          </p>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {selectedUnit.trackingSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isFlagged = step.status === 'flagged';
            const isInProgress = step.status === 'in_progress';
            const isPending = step.status === 'pending';

            return (
              <div key={step.stepNumber} className="relative flex items-start gap-4">
                {/* Node icon on line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ring-4 ring-white ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isFlagged
                      ? 'bg-red-600 text-white animate-pulse'
                      : isInProgress
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isFlagged ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    step.stepNumber
                  )}
                </div>

                {/* Step Card Content */}
                <div
                  className={`flex-1 p-4 rounded-xl border transition-colors ${
                    isFlagged
                      ? 'bg-red-50/70 border-red-200'
                      : isInProgress
                      ? 'bg-sky-50/40 border-sky-200'
                      : isCompleted
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-dashed border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      {isCompleted && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                      {isFlagged && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          Excursion Flagged
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                    {step.timestamp && (
                      <span className="text-[11px] font-mono text-slate-500">{step.timestamp}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">{step.description}</p>

                  {(step.location || step.operator || step.temperature !== undefined || step.notes) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      {step.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {step.location}
                        </span>
                      )}
                      {step.operator && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          Operator: {step.operator}
                        </span>
                      )}
                      {step.temperature !== undefined && (
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                          <Thermometer className="w-3 h-3 text-red-600" />
                          Logged: {step.temperature}°C
                        </span>
                      )}
                      {step.notes && (
                        <span className="text-red-700 font-semibold">{step.notes}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
