import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, AlertCircle, RefreshCw, QrCode } from 'lucide-react';
import { useBloodTrace } from '../../context/BloodTraceContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (unitId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { units } = useBloodTrace();
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'prompt' | 'granted' | 'denied' | 'simulated'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedUnitId, setScannedUnitId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCameraPermission('idle');
      setScannedUnitId(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const requestCameraAccess = async () => {
    setCameraPermission('prompt');
    setErrorMessage(null);

    // Try real camera first if environment permits
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraPermission('granted');
        return;
      } catch (err) {
        // Sandboxed iframe or permission denied: switch gracefully to simulated camera scanner
        console.warn('Camera stream unavailable, switching to simulated optical scanner mode:', err);
        setCameraPermission('simulated');
      }
    } else {
      setCameraPermission('simulated');
    }
  };

  const handleSimulatedScan = (unitId: string) => {
    setScannedUnitId(unitId);
    setTimeout(() => {
      onScanSuccess(unitId);
      onClose();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-semibold text-slate-900">Scan Blood Unit QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-6">
          {cameraPermission === 'idle' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-700 mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1">Optical Camera Scanner</h4>
              <p className="text-xs text-slate-600 max-w-xs mb-6">
                Point your device camera at the unit label's QR barcode to verify identity and temperature history.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={requestCameraAccess}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Enable Camera Scanner
                </button>
                <button
                  onClick={() => setCameraPermission('simulated')}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Run Demo Optical Simulator
                </button>
              </div>
            </div>
          )}

          {(cameraPermission === 'granted' || cameraPermission === 'simulated') && (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center shadow-inner">
              {/* If real video stream */}
              {cameraPermission === 'granted' ? (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              ) : (
                /* Simulated Scanner Viewport */
                <div className="w-full h-full bg-linear-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center text-slate-400">
                  <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                    DEMO SCANNER · 60 FPS · AUTOFOCUS
                  </div>
                  <QrCode className="w-24 h-24 text-slate-700 animate-pulse" />
                  <p className="text-xs text-slate-400 mt-2">Align blood bag QR code within reticle</p>
                </div>
              )}

              {/* Scanning Reticle Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-red-500/80 rounded-lg relative">
                  {/* Corner brackets */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-red-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-red-500" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-red-500" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-red-500" />

                  {/* Red laser scanning line */}
                  <div className="w-full h-0.5 bg-red-500/90 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-bounce" />
                </div>
              </div>

              {/* Scan successful indicator */}
              {scannedUnitId && (
                <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                  <Check className="w-12 h-12 text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold">Decoded Unit ID: {scannedUnitId}</p>
                  <span className="text-xs text-emerald-300">Loading traceability ledger...</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Pickers */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Quick Scan Blood Unit Presets (Demo)
              </span>
              <span className="text-[11px] text-slate-500">Tap to simulate barcode capture</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {units.slice(0, 6).map(unit => (
                <button
                  key={unit.id}
                  onClick={() => handleSimulatedScan(unit.id)}
                  className="p-2 border border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/50 rounded-lg text-left transition-colors flex flex-col"
                >
                  <span className="text-xs font-mono font-bold text-slate-900">{unit.id}</span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {unit.bloodGroup} · {unit.componentType.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{unit.unitStatus}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Compatible with GS1 & ISBT-128 standard barcodes
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
