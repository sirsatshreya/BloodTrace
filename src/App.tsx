import React, { useState } from 'react';
import { BloodTraceProvider, useBloodTrace } from './context/BloodTraceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { AddUnitModal } from './components/common/AddUnitModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { QRCodeModal } from './components/common/QRCodeModal';
import { ExcursionReviewModal } from './components/common/ExcursionReviewModal';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { TrackingPage } from './pages/TrackingPage';
import { TemperaturePage } from './pages/TemperaturePage';
import { HandoverPage } from './pages/HandoverPage';
import { ExpiryPage } from './pages/ExpiryPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BloodUnit } from './types/bloodTrace';

function MainAppLayout() {
  const { 
    activeTab, 
    units, 
    setSelectedUnitIdForTracking, 
    setActiveTab 
  } = useBloodTrace();

  // Layout & Modal UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addUnitModalOpen, setAddUnitModalOpen] = useState(false);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState(false);
  const [selectedQRUnit, setSelectedQRUnit] = useState<BloodUnit | null>(null);
  const [selectedExcursionUnit, setSelectedExcursionUnit] = useState<BloodUnit | null>(null);

  const handleOpenExcursionReview = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setSelectedExcursionUnit(unit);
    }
  };

  const handleOpenQRByUnitId = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setSelectedQRUnit(unit);
    }
  };

  const handleScanSuccess = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen} 
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Navigation Bar */}
        <TopNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddUnitModal={() => setAddUnitModalOpen(true)}
          onOpenQRScannerModal={() => setQrScannerModalOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenExcursionReview={handleOpenExcursionReview}
              onOpenQR={handleOpenQRByUnitId}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              onOpenAddUnitModal={() => setAddUnitModalOpen(true)}
              onOpenQRModal={unit => setSelectedQRUnit(unit)}
              onOpenExcursionReview={handleOpenExcursionReview}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingPage
              onOpenQRScanner={() => setQrScannerModalOpen(true)}
              onOpenQRModal={unit => setSelectedQRUnit(unit)}
              onOpenExcursionReview={handleOpenExcursionReview}
            />
          )}

          {activeTab === 'temperature' && (
            <TemperaturePage
              onOpenExcursionReview={handleOpenExcursionReview}
            />
          )}

          {activeTab === 'handover' && (
            <HandoverPage
              onOpenQR={handleOpenQRByUnitId}
            />
          )}

          {activeTab === 'expiry' && (
            <ExpiryPage
              onOpenExcursionReview={handleOpenExcursionReview}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              onOpenExcursionReview={handleOpenExcursionReview}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <AddUnitModal
        isOpen={addUnitModalOpen}
        onClose={() => setAddUnitModalOpen(false)}
      />

      <QRScannerModal
        isOpen={qrScannerModalOpen}
        onClose={() => setQrScannerModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <QRCodeModal
        unit={selectedQRUnit}
        onClose={() => setSelectedQRUnit(null)}
      />

      <ExcursionReviewModal
        unit={selectedExcursionUnit}
        onClose={() => setSelectedExcursionUnit(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BloodTraceProvider>
      <MainAppLayout />
    </BloodTraceProvider>
  );
}
