import React from 'react';
import { BloodUnit } from '../../types/bloodTrace';
import { COMPONENT_STORAGE_SPECS } from '../../data/mockData';
import { X, Printer, Download, CheckCircle2, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  unit: BloodUnit | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ unit, onClose }) => {
  if (!unit) return null;

  const specs = COMPONENT_STORAGE_SPECS[unit.componentType];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-semibold text-slate-900">ISBT-128 Unit Barcode & QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blood Bag Label Mockup */}
        <div className="p-6">
          <div className="border-2 border-slate-900 rounded-lg p-5 bg-white text-slate-900 font-sans shadow-xs">
            {/* Top Label Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">Blood Traceability System</p>
                <p className="text-xl font-mono font-bold tracking-tight text-slate-900">{unit.id}</p>
                <p className="text-xs text-slate-600">Central Metropolitan Blood Bank</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-red-700 font-mono tracking-tight">{unit.bloodGroup}</span>
                <p className="text-[10px] uppercase font-bold text-slate-500">ABO / Rh (D)</p>
              </div>
            </div>

            {/* Middle Section: QR Code and Key Attributes */}
            <div className="grid grid-cols-2 gap-4 py-4 items-center">
              {/* QR Code SVG Generation */}
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white border border-slate-300 rounded shadow-2xs">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-28 h-28 text-slate-900 fill-current"
                    shapeRendering="crispEdges"
                  >
                    {/* Position patterns */}
                    <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                    {/* Data simulation matrix */}
                    <rect x="35" y="5" width="5" height="15" fill="currentColor" />
                    <rect x="45" y="10" width="5" height="10" fill="currentColor" />
                    <rect x="55" y="5" width="8" height="8" fill="currentColor" />
                    <rect x="40" y="25" width="20" height="5" fill="currentColor" />

                    <rect x="5" y="40" width="15" height="5" fill="currentColor" />
                    <rect x="25" y="35" width="10" height="15" fill="currentColor" />
                    <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />
                    <rect x="70" y="40" width="15" height="5" fill="currentColor" />
                    <rect x="85" y="35" width="10" height="20" fill="currentColor" />

                    <rect x="35" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="50" y="75" width="15" height="5" fill="currentColor" />
                    <rect x="70" y="70" width="25" height="8" fill="currentColor" />
                    <rect x="75" y="85" width="20" height="10" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">SCAN VIA BLOODTRACE</span>
              </div>

              {/* Component Info */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Component</span>
                  <p className="font-semibold text-slate-900 leading-tight">{unit.componentType}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Volume / Anticoagulant</span>
                  <p className="font-mono text-slate-800">{unit.volumeMl} mL · {unit.anticoagulant}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Temp Req</span>
                  <p className="font-mono font-semibold text-red-700">
                    {specs.minTemp}°C to {specs.maxTemp}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Dates */}
            <div className="border-t border-slate-200 pt-2 grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Collected</span>
                <span className="text-slate-700">{unit.collectionDate.split('T')[0]}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Expires</span>
                <span className="font-bold text-red-800">{unit.expiryDate.split('T')[0]}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              This QR code securely encapsulates the unit ID, cold-chain sensor payload, and ISBT-128 verification hash for instant hospital scanner intake.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Thermal Bag Label
          </button>
        </div>
      </div>
    </div>
  );
};
