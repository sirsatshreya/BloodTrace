import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  QrCode, 
  Eye, 
  MapPin, 
  Thermometer, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BloodGroup, ComponentType, UnitStatus, BloodUnit } from '../types/bloodTrace';
import { COMPONENT_STORAGE_SPECS } from '../data/mockData';

export const InventoryPage: React.FC<{
  onOpenAddUnitModal: () => void;
  onOpenQRModal: (unit: BloodUnit) => void;
  onOpenExcursionReview: (unitId: string) => void;
}> = ({ onOpenAddUnitModal, onOpenQRModal, onOpenExcursionReview }) => {
  const { units, setActiveTab, setSelectedUnitIdForTracking, updateUnitStatus } = useBloodTrace();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'collection' | 'id'>('expiry');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Selected unit for detail slide-over
  const [drawerUnit, setDrawerUnit] = useState<BloodUnit | null>(null);

  // Available unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(units.map(u => u.currentLocation.split(' - ')[0])));
    return locs;
  }, [units]);

  // Filtered & Sorted units
  const filteredUnits = useMemo(() => {
    return units
      .filter(unit => {
        // Search term
        const matchesSearch = 
          unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.assignedContainerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.sensorId.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Group filter
        const matchesGroup = groupFilter === 'all' || unit.bloodGroup === groupFilter;

        // Component filter
        const matchesComponent = componentFilter === 'all' || unit.componentType === componentFilter;

        // Status filter
        const matchesStatus = statusFilter === 'all' || unit.unitStatus === statusFilter;

        // Location filter
        const matchesLocation = locationFilter === 'all' || unit.currentLocation.includes(locationFilter);

        return matchesSearch && matchesGroup && matchesComponent && matchesStatus && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          const dateA = new Date(a.expiryDate).getTime();
          const dateB = new Date(b.expiryDate).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortBy === 'collection') {
          const dateA = new Date(a.collectionDate).getTime();
          const dateB = new Date(b.collectionDate).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortBy === 'id') {
          return sortDirection === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        }
        return 0;
      });
  }, [units, searchTerm, groupFilter, componentFilter, statusFilter, locationFilter, sortBy, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (type: 'expiry' | 'collection' | 'id') => {
    if (sortBy === type) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(type);
      setSortDirection('asc');
    }
  };

  const handleTrackUnit = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Unit ID (e.g. BT-2026-001), sensor ID, container..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Blood Group */}
            <select
              value={groupFilter}
              onChange={e => {
                setGroupFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
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

            {/* Component */}
            <select
              value={componentFilter}
              onChange={e => {
                setComponentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">All Components</option>
              <option value="Packed Red Blood Cells (PRBC)">PRBC</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Platelet Concentrate">Platelets</option>
              <option value="Fresh Frozen Plasma (FFP)">FFP</option>
              <option value="Cryoprecipitate">Cryo</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Transit">In Transit</option>
              <option value="Quarantined">Quarantined</option>
              <option value="Reserved">Reserved</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Add Unit Button */}
        <button
          onClick={onOpenAddUnitModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Blood Unit</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">
                  <button
                    onClick={() => toggleSort('id')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Unit ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">QR Barcode</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3">Component Type</th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('collection')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Collected</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('expiry')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Expiry (FEFO)</span>
                    <ArrowUpDown className="w-3 h-3 text-red-600" />
                  </button>
                </th>
                <th className="py-3 px-3">Location & Sensor</th>
                <th className="py-3 px-3">Current Temp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUnits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No blood units match the current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or registering a new unit</p>
                  </td>
                </tr>
              ) : (
                paginatedUnits.map(unit => {
                  const specs = COMPONENT_STORAGE_SPECS[unit.componentType];
                  const isExpiringSoon = new Date(unit.expiryDate).getTime() - new Date('2026-10-12T22:00:00Z').getTime() < 1000 * 60 * 60 * 24 * 3;

                  return (
                    <tr
                      key={unit.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        unit.unitStatus === 'Quarantined' ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Unit ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {unit.id}
                      </td>

                      {/* QR Button */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onOpenQRModal(unit)}
                          className="p-1 rounded text-slate-500 hover:text-red-700 hover:bg-slate-100 transition-colors"
                          title="View / Print Barcode QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Blood Group */}
                      <td className="py-3 px-3 font-mono font-bold text-base text-red-700">
                        {unit.bloodGroup}
                      </td>

                      {/* Component */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900 block">{unit.componentType}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {unit.volumeMl}mL · {specs.minTemp}°C to {specs.maxTemp}°C
                        </span>
                      </td>

                      {/* Collection Date */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {unit.collectionDate.split('T')[0]}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-mono">
                        <span className={`font-semibold ${isExpiringSoon ? 'text-amber-700' : 'text-slate-800'}`}>
                          {unit.expiryDate.split('T')[0]}
                        </span>
                        {isExpiringSoon && unit.unitStatus !== 'Expired' && (
                          <span className="text-[10px] text-amber-600 block font-sans font-medium">
                            FEFO Priority
                          </span>
                        )}
                      </td>

                      {/* Location & Sensor */}
                      <td className="py-3 px-3">
                        <span className="text-slate-700 truncate max-w-[150px] block" title={unit.currentLocation}>
                          {unit.currentLocation}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {unit.assignedContainerId} · {unit.sensorId}
                        </span>
                      </td>

                      {/* Temperature */}
                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`font-bold ${
                            unit.temperatureStatus === 'Critical'
                              ? 'text-red-700'
                              : unit.temperatureStatus === 'Warning'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {unit.currentTemperature}°C
                        </span>
                        <div className="text-[10px]">
                          <StatusBadge type="temp" value={unit.temperatureStatus} />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge type="unit" value={unit.unitStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setDrawerUnit(unit)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleTrackUnit(unit.id)}
                          className="px-2.5 py-1 text-red-700 hover:text-red-800 hover:bg-red-50 rounded text-xs font-semibold transition-colors"
                        >
                          Track
                        </button>
                        {unit.unitStatus === 'Quarantined' && (
                          <button
                            onClick={() => onOpenExcursionReview(unit.id)}
                            className="px-2 py-1 text-white bg-red-700 hover:bg-red-800 rounded text-[11px] font-semibold transition-colors"
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

        {/* Pagination & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-mono font-bold text-slate-900">
              {filteredUnits.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>
            <span>to</span>
            <span className="font-mono font-bold text-slate-900">
              {Math.min(currentPage * pageSize, filteredUnits.length)}
            </span>
            <span>of</span>
            <span className="font-mono font-bold text-slate-900">{filteredUnits.length}</span>
            <span>units</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              >
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Details Slide-over Drawer */}
      {drawerUnit && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-slate-900">{drawerUnit.id}</span>
                <span className="text-lg font-bold text-red-700 font-mono">({drawerUnit.bloodGroup})</span>
              </div>
              <button
                onClick={() => setDrawerUnit(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-5 flex-1">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Component Type</span>
                  <span className="font-semibold text-slate-900">{drawerUnit.componentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Volume</span>
                  <span className="font-mono text-slate-900">{drawerUnit.volumeMl} mL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preservative Solution</span>
                  <span className="font-mono text-slate-900">{drawerUnit.anticoagulant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Custodian</span>
                  <span className="font-medium text-slate-900">{drawerUnit.currentCustodian}</span>
                </div>
              </div>

              {/* Thermal Specs */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Storage & Cold-Chain Parameters
                </h4>
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-red-900">Allowed Temperature</span>
                    <span className="font-mono font-bold text-red-900">
                      {COMPONENT_STORAGE_SPECS[drawerUnit.componentType].minTemp}°C to {COMPONENT_STORAGE_SPECS[drawerUnit.componentType].maxTemp}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-900">Current Reading</span>
                    <span className="font-mono font-bold text-red-900">{drawerUnit.currentTemperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-900">Sensor & Container</span>
                    <span className="font-mono text-red-800">{drawerUnit.sensorId} · {drawerUnit.assignedContainerId}</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Inventory Disposition
                </h4>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Status</span>
                    <StatusBadge type="unit" value={drawerUnit.unitStatus} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onOpenQRModal(drawerUnit);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      View QR
                    </button>
                    <button
                      onClick={() => {
                        handleTrackUnit(drawerUnit.id);
                        setDrawerUnit(null);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg"
                    >
                      Track Ledger
                    </button>
                  </div>
                </div>
              </div>

              {/* Quarantine Notice if applicable */}
              {drawerUnit.unitStatus === 'Quarantined' && (
                <div className="p-3.5 bg-red-100/60 border border-red-200 rounded-lg text-xs text-red-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                    <span>Unit Under Strict Quarantine</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{drawerUnit.quarantineReason}</p>
                  <button
                    onClick={() => {
                      onOpenExcursionReview(drawerUnit.id);
                      setDrawerUnit(null);
                    }}
                    className="mt-3 w-full py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded"
                  >
                    Conduct Clinical Clearance Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
