import React, { useState } from 'react';
import { X, Plus, AlertCircle, Info, Check } from 'lucide-react';
import { useBloodTrace } from '../../context/BloodTraceContext';
import { BloodGroup, ComponentType } from '../../types/bloodTrace';
import { COMPONENT_STORAGE_SPECS } from '../../data/mockData';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose }) => {
  const { addBloodUnit, units, currentUser } = useBloodTrace();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [componentType, setComponentType] = useState<ComponentType>('Packed Red Blood Cells (PRBC)');
  const [volumeMl, setVolumeMl] = useState<number>(350);
  const [anticoagulant, setAnticoagulant] = useState<string>('CPDA-1');
  const [currentLocation, setCurrentLocation] = useState<string>('Central Blood Bank - Cold Storage Unit A');
  const [assignedContainerId, setAssignedContainerId] = useState<string>('BOX-PRBC-09');
  const [sensorId, setSensorId] = useState<string>('SENSOR-RF-104');
  const [currentTemperature, setCurrentTemperature] = useState<number>(4.0);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currentSpecs = COMPONENT_STORAGE_SPECS[componentType];

  const handleComponentChange = (newType: ComponentType) => {
    setComponentType(newType);
    const specs = COMPONENT_STORAGE_SPECS[newType];
    // Adjust default temperature to safe midpoint
    setCurrentTemperature(Number(((specs.minTemp + specs.maxTemp) / 2).toFixed(1)));

    // Adjust container prefix
    if (newType.includes('Platelet')) {
      setAssignedContainerId('AGITATOR-BAY-03');
      setSensorId('SENSOR-PLT-03');
      setCurrentLocation('Central Blood Center - Agitator Unit 01');
      setVolumeMl(250);
      setAnticoagulant('ACD-A');
    } else if (newType.includes('Plasma') || newType.includes('Cryo')) {
      setAssignedContainerId('FREEZER-FFP-03');
      setSensorId('SENSOR-FRZ-03');
      setCurrentLocation('Central Blood Bank - Ultra-Low Freezer Unit 01');
      setVolumeMl(250);
    } else {
      setAssignedContainerId('BOX-PRBC-15');
      setSensorId('SENSOR-RF-104');
      setCurrentLocation('Central Blood Bank - Cold Storage Unit A');
      setVolumeMl(350);
      setAnticoagulant('CPDA-1');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (volumeMl <= 0 || volumeMl > 600) {
      newErrors.volume = 'Volume must be between 10 and 600 mL';
    }

    if (!assignedContainerId.trim()) {
      newErrors.container = 'Container ID is required';
    }

    if (!sensorId.trim()) {
      newErrors.sensor = 'Sensor ID is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Auto-calculate expiry date from collection date based on component shelf-life
    const collectionDateObj = new Date();
    const expiryDateObj = new Date(collectionDateObj);
    expiryDateObj.setDate(expiryDateObj.getDate() + currentSpecs.shelfLifeDays);

    const created = addBloodUnit({
      bloodGroup,
      componentType,
      volumeMl,
      anticoagulant,
      collectionDate: collectionDateObj.toISOString(),
      expiryDate: expiryDateObj.toISOString(),
      currentLocation,
      assignedContainerId,
      sensorId,
      currentTemperature,
      temperatureStatus: 'Safe',
      unitStatus: 'Available',
      currentCustodian: currentUser.facility,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Register New Blood Unit</h3>
              <p className="text-xs text-slate-500">ISBT-128 Compliant Intake & Cold-Chain Provisioning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Component Storage Rule Notice */}
          <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-red-900 mb-1">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>Component Specific Requirements: {componentType}</span>
            </div>
            <p className="text-red-800 leading-relaxed">
              Safe Temperature Window:{' '}
              <span className="font-mono font-bold text-red-950">
                {currentSpecs.minTemp}°C to {currentSpecs.maxTemp}°C
              </span>{' '}
              · Standard Shelf Life: <span className="font-bold">{currentSpecs.shelfLifeDays} days</span>
            </p>
            <p className="text-red-700 text-[11px] mt-1">{currentSpecs.storageCondition}</p>
          </div>

          {/* Grid row 1: Blood Group and Component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ABO / Rh Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              >
                <option value="O+">O+ (Universal RBC Recipient O+)</option>
                <option value="O-">O- (Universal Red Cell Donor)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+ (Universal Plasma Donor)</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Blood Component Type *
              </label>
              <select
                value={componentType}
                onChange={e => handleComponentChange(e.target.value as ComponentType)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              >
                <option value="Packed Red Blood Cells (PRBC)">Packed Red Blood Cells (PRBC)</option>
                <option value="Whole Blood">Whole Blood</option>
                <option value="Platelet Concentrate">Platelet Concentrate</option>
                <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
                <option value="Cryoprecipitate">Cryoprecipitate</option>
              </select>
            </div>
          </div>

          {/* Grid row 2: Volume & Anticoagulant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Net Volume (mL) *
              </label>
              <input
                type="number"
                value={volumeMl}
                onChange={e => setVolumeMl(Number(e.target.value))}
                min={10}
                max={600}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              {errors.volume && <p className="text-[11px] text-red-600 mt-1">{errors.volume}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Anticoagulant / Preservative
              </label>
              <select
                value={anticoagulant}
                onChange={e => setAnticoagulant(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              >
                <option value="CPDA-1">CPDA-1 (Citrate Phosphate Dextrose Adenine)</option>
                <option value="SAGM">SAGM (Saline-Adenine-Glucose-Mannitol)</option>
                <option value="ACD-A">ACD-A (Acid Citrate Dextrose - Platelets)</option>
                <option value="CPD">CPD (Citrate Phosphate Dextrose)</option>
              </select>
            </div>
          </div>

          {/* Grid row 3: Location and Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Storage Facility / Location *
              </label>
              <input
                type="text"
                value={currentLocation}
                onChange={e => setCurrentLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Storage Container / Bay ID *
              </label>
              <input
                type="text"
                value={assignedContainerId}
                onChange={e => setAssignedContainerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              {errors.container && <p className="text-[11px] text-red-600 mt-1">{errors.container}</p>}
            </div>
          </div>

          {/* Grid row 4: Sensor ID and Initial Temp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                IoT Cold-Chain Sensor ID *
              </label>
              <input
                type="text"
                value={sensorId}
                onChange={e => setSensorId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              {errors.sensor && <p className="text-[11px] text-red-600 mt-1">{errors.sensor}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Intake Temp (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={currentTemperature}
                onChange={e => setCurrentTemperature(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>
          </div>

          {/* Verification Check */}
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600">
            <span>Next Unit Barcode ID to be generated:</span>
            <span className="font-mono font-bold text-slate-900">
              BT-2026-{String(units.length + 1).padStart(3, '0')}
            </span>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
