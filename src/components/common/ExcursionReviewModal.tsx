import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Trash2, FileCheck } from 'lucide-react';
import { useBloodTrace } from '../../context/BloodTraceContext';
import { BloodUnit } from '../../types/bloodTrace';
import { COMPONENT_STORAGE_SPECS } from '../../data/mockData';

interface ExcursionReviewModalProps {
  unit: BloodUnit | null;
  onClose: () => void;
}

export const ExcursionReviewModal: React.FC<ExcursionReviewModalProps> = ({ unit, onClose }) => {
  const { clinicalDispositionReview, currentUser } = useBloodTrace();
  const [reviewDecision, setReviewDecision] = useState<'release' | 'condemn'>('release');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [authorizedOfficer, setAuthorizedOfficer] = useState<string>(currentUser.name);

  if (!unit) return null;

  const specs = COMPONENT_STORAGE_SPECS[unit.componentType];

  const handleSignDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) return;

    clinicalDispositionReview(unit.id, reviewDecision, clinicalNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Clinical Quarantine Disposition</h3>
              <p className="text-xs text-slate-500">Authorized Transfusion Quality Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSignDisposition} className="p-6 space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 text-sm">{unit.id}</span>
              <span className="font-bold text-red-700">{unit.bloodGroup} · {unit.componentType}</span>
            </div>
            <p className="text-amber-900">
              <span className="font-semibold">Quarantine Reason:</span> {unit.quarantineReason || 'Cold-chain thermal deviation detected by IoT sensor.'}
            </p>
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-slate-700">
              <span>Standard Safe Window: {specs.minTemp}°C to {specs.maxTemp}°C</span>
              <span>Current Temp: <strong className="font-mono">{unit.currentTemperature}°C</strong></span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Clinical Disposition Determination *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewDecision('release')}
                className={`p-3 border rounded-lg text-left transition-colors flex items-start gap-2.5 ${
                  reviewDecision === 'release'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold">Clear & Release</span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Transient deviation within permissible MKT (Mean Kinetic Temp). Return to inventory.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecision('condemn')}
                className={`p-3 border rounded-lg text-left transition-colors flex items-start gap-2.5 ${
                  reviewDecision === 'condemn'
                    ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold">Condemn & Discard</span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Thermal integrity irreversibly compromised. Mark for biohazard destruction.
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Medical Officer Review Notes / Quality Justification *
            </label>
            <textarea
              required
              rows={3}
              value={clinicalNotes}
              onChange={e => setClinicalNotes(e.target.value)}
              placeholder="e.g. Evaluated temperature telemetry curve. Cumulative exposure under 15 minutes. Hemolysis test non-reactive. Cleared for immediate FEFO transfusion."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Authorized Reviewer Signature
            </label>
            <input
              type="text"
              value={authorizedOfficer}
              onChange={e => setAuthorizedOfficer(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Signed with electronic credential under Role: {currentUser.role}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                reviewDecision === 'release' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Sign & Execute Disposition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
