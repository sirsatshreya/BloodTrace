import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  MapPin, 
  ThermometerSnowflake, 
  ArrowLeftRight, 
  CalendarClock, 
  BellRing, 
  BarChart3, 
  Settings, 
  Droplet,
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useBloodTrace, NavigationPage } from '../../context/BloodTraceContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, notifications, units, currentUser, logout } = useBloodTrace();

  const unreadAlertsCount = notifications.filter(n => !n.isAcknowledged && (n.severity === 'critical' || n.severity === 'warning')).length;
  const criticalExcursionsCount = units.filter(u => u.temperatureStatus === 'Critical' || u.unitStatus === 'Quarantined').length;

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inventory', label: 'Blood Inventory', icon: <Boxes className="w-4 h-4" /> },
    { id: 'tracking', label: 'Track Blood Unit', icon: <MapPin className="w-4 h-4" /> },
    { 
      id: 'temperature', 
      label: 'Temperature Monitoring', 
      icon: <ThermometerSnowflake className="w-4 h-4" />,
      badge: criticalExcursionsCount > 0 ? criticalExcursionsCount : undefined,
      badgeColor: 'bg-red-600 text-white'
    },
    { id: 'handover', label: 'Handover Management', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'expiry', label: 'Expiry & FEFO', icon: <CalendarClock className="w-4 h-4" /> },
    { 
      id: 'alerts', 
      label: 'Alerts & Notifications', 
      icon: <BellRing className="w-4 h-4" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-amber-600 text-white'
    },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: NavigationPage) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-950 shrink-0">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs tracking-tight text-white block leading-snug">
                Blood Traceability and Availability
              </span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 truncate">Cold-Chain Management</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Logistics & Operations
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-red-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Signed-in Role Summary & Sign Out */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2.5">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-white truncate">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{currentUser.role}</span>
              <span className="font-mono text-emerald-400">Active</span>
            </div>
          </div>

          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
