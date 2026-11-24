import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Plus, 
  QrCode, 
  ChevronDown, 
  Shield, 
  Truck, 
  FlaskConical, 
  Check, 
  AlertTriangle,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useBloodTrace, NavigationPage } from '../../context/BloodTraceContext';
import { UserRole } from '../../types/bloodTrace';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenAddUnitModal: () => void;
  onOpenQRScannerModal: () => void;
}

const PAGE_TITLES: Record<NavigationPage, { title: string; subtitle: string }> = {
  dashboard: { title: 'Cold-Chain Command Center', subtitle: 'Live supply chain telemetry, inventory health & thermal integrity' },
  inventory: { title: 'Blood Inventory Registry', subtitle: 'Unit-level catalog, ISBT-128 barcoding & storage specifications' },
  tracking: { title: 'Blood Unit Tracking & Audit Ledger', subtitle: 'End-to-end custody timeline & real-time sensor verification' },
  temperature: { title: 'Cold-Chain Temperature Telemetry', subtitle: 'Real-time thermal sensors, 2°C–6°C safe windows & excursion response' },
  handover: { title: 'Custody Handover Management', subtitle: 'Inter-facility transfer manifests, courier verification & receiving desk logs' },
  expiry: { title: 'FEFO Inventory & Shelf-Life Prioritization', subtitle: 'First-Expiry-First-Out clinical allocation & waste reduction engine' },
  alerts: { title: 'Alerts & Critical Event Center', subtitle: 'Thermal excursions, custody delays & near-expiry warnings' },
  reports: { title: 'Reports & Cold-Chain Analytics', subtitle: 'Integrity compliance rates, wastage reduction & audit exports' },
  settings: { title: 'System Configuration & Access Control', subtitle: 'Storage temperature limits, facility profile & RBAC permissions' },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileSidebar,
  onOpenAddUnitModal,
  onOpenQRScannerModal,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setCurrentRole, 
    notifications, 
    units, 
    searchQuery, 
    setSearchQuery, 
    setSelectedUnitIdForTracking,
    acknowledgeAlert,
    logout
  } = useBloodTrace();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = notifications.filter(n => !n.isAcknowledged);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotificationMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : units.filter(u => 
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.componentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.currentLocation.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const handleSelectSearchResult = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
    setSearchResultsOpen(false);
    setSearchQuery('');
  };

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setRoleMenuOpen(false);
  };

  const pageInfo = PAGE_TITLES[activeTab] || { title: 'Blood Traceability and Availability', subtitle: 'Unit-Level Traceability' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                {pageInfo.title}
              </h1>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchResultsOpen(true);
              }}
              onFocus={() => setSearchResultsOpen(true)}
              placeholder="Search Unit ID (e.g. BT-2026), group, location..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResultsOpen && searchQuery.trim() !== '' && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Matching Units ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">No matching units found</div>
              ) : (
                searchResults.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => handleSelectSearchResult(unit.id)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{unit.id}</span>
                      <span className="font-semibold text-red-700">{unit.bloodGroup}</span>
                      <span className="text-slate-500 ml-1">· {unit.componentType.split(' ')[0]}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{unit.currentLocation.split('-')[0]}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Scanner Action */}
          <button
            onClick={onOpenQRScannerModal}
            title="Scan QR Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Quick Add Unit Button */}
          <button
            onClick={onOpenAddUnitModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register Unit</span>
          </button>

          {/* Notification Menu */}
          <div ref={notifMenuRef} className="relative">
            <button
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </button>

            {notificationMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Alert Center</span>
                  <span className="text-[10px] font-mono font-semibold text-red-700">
                    {unreadAlerts.length} Unresolved
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.slice(0, 4).map(alert => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 leading-tight">{alert.title}</span>
                        {!alert.isAcknowledged && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{alert.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!alert.isAcknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-[10px] font-semibold text-red-700 hover:text-red-900 underline"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('alerts');
                      setNotificationMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    View All Notifications <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div ref={roleMenuRef} className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden lg:block">
                <span className="block text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="block text-[10px] font-medium text-slate-500 leading-tight">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.title}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{currentUser.email}</p>
                </div>

                <div className="p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider block mb-1">
                    Simulate Role (Demo RBAC)
                  </span>
                  {(['Administrator', 'Blood Bank Staff', 'Courier'] as UserRole[]).map(role => {
                    const isSelected = currentUser.role === role;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          isSelected ? 'bg-red-50 text-red-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {role === 'Administrator' && <Shield className="w-3.5 h-3.5 text-red-600" />}
                          {role === 'Blood Bank Staff' && <FlaskConical className="w-3.5 h-3.5 text-sky-600" />}
                          {role === 'Courier' && <Truck className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{role}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Login Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
