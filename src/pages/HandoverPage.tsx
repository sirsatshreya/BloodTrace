import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Truck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  ShieldCheck, 
  Thermometer, 
  History, 
  QrCode,
  X,
  FileText
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { HandoverStatus, HandoverTransfer } from '../types/bloodTrace';

export const HandoverPage: React.FC<{
  onOpenQR: (unitId: string) => void;
}> = ({ onOpenQR }) => {
  const { 
    handovers, 
    units, 
    currentUser, 
    updateHandoverStatus, 
    setActiveTab, 
    setSelectedUnitIdForTracking 
  } = useBloodTrace();

  // Active handover modal/dialog states
  const [selectedTransferForHistory, setSelectedTransferForHistory] = useState<HandoverTransfer | null>(null);
  const [actionModal, setActionModal] = useState<{
    transfer: HandoverTransfer;
    targetStatus: HandoverStatus;
  } | null>(null);

  // Modal input state for action confirmation
  const [actionTempInput, setActionTempInput] = useState<number>(4.1);
  const [actionNotesInput, setActionNotesInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New dispatch modal
  const [createDispatchModalOpen, setCreateDispatchModalOpen] = useState(false);
  const [newSelectedUnitId, setNewSelectedUnitId] = useState<string>('');
  const [newDestination, setNewDestination] = useState<string>('St. Jude Memorial Hospital (Transfusion Lab)');
  const [newCourier, setNewCourier] = useState<string>('Sarah Jenkins');
  const [newNotes, setNewNotes] = useState<string>('Standard urgent surgical delivery manifest');

  // Filter available units for dispatch
  const availableUnitsForDispatch = units.filter(u => u.unitStatus === 'Available');

  const handleOpenAction = (transfer: HandoverTransfer, targetStatus: HandoverStatus) => {
    setActionModal({ transfer, targetStatus });
    setActionTempInput(transfer.dispatchTemperature || 4.1);
    setActionNotesInput('');
    setErrorMessage(null);
  };

  const handleExecuteStatusTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    const result = updateHandoverStatus(actionModal.transfer.id, actionModal.targetStatus, {
      temperature: actionTempInput,
      notes: actionNotesInput || `Confirmed transition to ${actionModal.targetStatus}`,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to update transfer status.');
      return;
    }

    setActionModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Inter-Facility Handover & Chain of Custody</h2>
          <p className="text-xs text-slate-500">
            Secure multi-party custodial transfer between Blood Centers, Certified Couriers, and Receiving Hospitals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateDispatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Prepare New Dispatch</span>
          </button>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {handovers.map(transfer => {
          const associatedUnit = units.find(u => transfer.unitIds.includes(u.id));

          return (
            <div
              key={transfer.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-base text-slate-900">{transfer.id}</span>
                      <StatusBadge type="handover" value={transfer.status} />
                      <span className="text-xs text-slate-400 font-mono">
                        Container: {transfer.transportContainerId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {transfer.notes}
                    </p>
                  </div>
                </div>

                {/* Status Action Buttons with Strict Valid Transition Rules */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Step 1: Confirm Dispatch */}
                  {transfer.status === 'Prepared for Dispatch' && (
                    <button
                      onClick={() => handleOpenAction(transfer, 'Dispatched')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                    >
                      Confirm Dispatch
                    </button>
                  )}

                  {/* Step 2: Accept Custody (Courier) */}
                  {transfer.status === 'Dispatched' && (
                    <button
                      onClick={() => handleOpenAction(transfer, 'In Courier Custody')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs"
                    >
                      Courier Accept Custody
                    </button>
                  )}

                  {/* Step 3: Delivered to Hospital */}
                  {transfer.status === 'In Courier Custody' && (
                    <button
                      onClick={() => handleOpenAction(transfer, 'Delivered to Hospital')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs"
                    >
                      Log Hospital Arrival
                    </button>
                  )}

                  {/* Step 4: Confirm Hospital Receipt */}
                  {transfer.status === 'Delivered to Hospital' && (
                    <button
                      onClick={() => handleOpenAction(transfer, 'Receipt Verified')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                    >
                      Verify Hospital Receipt
                    </button>
                  )}

                  {transfer.status === 'Receipt Verified' && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Transfer Fully Completed
                    </span>
                  )}

                  {/* View History Button */}
                  <button
                    onClick={() => setSelectedTransferForHistory(transfer)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Audit History</span>
                  </button>
                </div>
              </div>

              {/* Handover Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                {/* Units In Handover */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                    Blood Units in Container
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {transfer.unitIds.map(uid => {
                      const u = units.find(item => item.id === uid);
                      return (
                        <button
                          key={uid}
                          onClick={() => {
                            setSelectedUnitIdForTracking(uid);
                            setActiveTab('tracking');
                          }}
                          className="px-2 py-0.5 rounded font-mono font-bold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          {uid} {u && `(${u.bloodGroup})`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Origin & Destination */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                    Route Waypoints
                  </span>
                  <p className="text-slate-800 mt-0.5 truncate" title={transfer.originFacility}>
                    <strong className="text-slate-500 font-normal">From:</strong> {transfer.originFacility}
                  </p>
                  <p className="text-slate-900 font-medium truncate mt-0.5" title={transfer.destinationFacility}>
                    <strong className="text-slate-500 font-normal">To:</strong> {transfer.destinationFacility}
                  </p>
                </div>

                {/* Courier & Telemetry */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                    Courier & Thermal Seal
                  </span>
                  <p className="text-slate-800 mt-0.5 font-medium">{transfer.courierName} ({transfer.courierId})</p>
                  <p className="text-slate-500 font-mono text-[11px]">{transfer.courierContact}</p>
                </div>

                {/* Temperature at Handover */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                    Thermal Verification
                  </span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    Departure Temp: <strong className="text-slate-900">{transfer.dispatchTemperature}°C</strong>
                  </p>
                  {transfer.receivingTemperature !== undefined ? (
                    <p className="font-mono text-emerald-700 font-bold">
                      Arrival Temp: {transfer.receivingTemperature}°C
                    </p>
                  ) : (
                    <span className="text-[11px] text-slate-400">Arrival temp pending receipt</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Transition Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Confirm Handover Status Update
                </h3>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStatusTransition} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <p className="text-slate-600">
                  Transitioning transfer <strong className="font-mono text-slate-900">{actionModal.transfer.id}</strong> to:
                </p>
                <p className="text-sm font-bold text-red-800">{actionModal.targetStatus}</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verified Temperature Reading at Handoff (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={actionTempInput}
                  onChange={e => setActionTempInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Verify digital probe or external indicator on cold container.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custody Verification Notes & Digital Signature
                </label>
                <textarea
                  rows={2}
                  value={actionNotesInput}
                  onChange={e => setActionNotesInput(e.target.value)}
                  placeholder="e.g. Tamper-evident seal #SL-8840 confirmed intact. Logger uploaded."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                Signing user: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-red-700 hover:bg-red-800 rounded-lg font-semibold"
                >
                  Sign & Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {selectedTransferForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Transfer Audit Log: {selectedTransferForHistory.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTransferForHistory(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedTransferForHistory.history.map((record, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{record.status}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600">{record.details}</p>
                  <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-200/60">
                    Verified By: {record.actor}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTransferForHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prepare New Dispatch Modal */}
      {createDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Prepare New Inter-Facility Dispatch</h3>
              <button
                onClick={() => setCreateDispatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Blood Unit for Transfer *
                </label>
                <select
                  value={newSelectedUnitId}
                  onChange={e => setNewSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600"
                >
                  <option value="">-- Choose an available unit --</option>
                  {availableUnitsForDispatch.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.id} - {u.bloodGroup} {u.componentType} (Exp: {u.expiryDate.split('T')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Facility *</label>
                <select
                  value={newDestination}
                  onChange={e => setNewDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600"
                >
                  <option value="St. Jude Memorial Hospital (Transfusion Lab)">St. Jude Memorial Hospital (Transfusion Lab)</option>
                  <option value="Metro General Childrens Hospital">Metro General Childrens Hospital</option>
                  <option value="County Trauma Center #1">County Trauma Center #1</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Certified Courier *</label>
                <select
                  value={newCourier}
                  onChange={e => setNewCourier(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (MediTransit Cold-Chain)</option>
                  <option value="David Miller">David Miller (MediTransit Express)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer Manifest Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateDispatchModalOpen(false)}
                  className="px-3 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newSelectedUnitId}
                  onClick={() => {
                    setCreateDispatchModalOpen(false);
                  }}
                  className="px-4 py-2 text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 rounded-lg font-semibold"
                >
                  Initialize Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
