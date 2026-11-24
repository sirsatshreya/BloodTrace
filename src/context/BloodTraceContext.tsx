import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BloodUnit, 
  HandoverTransfer, 
  AlertNotification, 
  UserRole, 
  UserProfile, 
  ColdChainThresholds,
  HandoverStatus,
  UnitStatus
} from '../types/bloodTrace';
import { 
  INITIAL_BLOOD_UNITS, 
  INITIAL_HANDOVERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_THRESHOLDS,
  MOCK_USERS,
  COMPONENT_STORAGE_SPECS
} from '../data/mockData';

export type NavigationPage = 
  | 'dashboard' 
  | 'inventory' 
  | 'tracking' 
  | 'temperature' 
  | 'handover' 
  | 'expiry' 
  | 'alerts' 
  | 'reports' 
  | 'settings';

interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
  remember?: boolean;
}

interface BloodTraceContextType {
  units: BloodUnit[];
  handovers: HandoverTransfer[];
  notifications: AlertNotification[];
  currentUser: UserProfile;
  isAuthenticated: boolean;
  activeTab: NavigationPage;
  searchQuery: string;
  thresholds: ColdChainThresholds;
  selectedUnitIdForTracking: string;
  liveSimulationActive: boolean;
  setActiveTab: (tab: NavigationPage) => void;
  setSearchQuery: (query: string) => void;
  setSelectedUnitIdForTracking: (unitId: string) => void;
  setCurrentRole: (role: UserRole) => void;
  login: (payload: LoginPayload) => { success: boolean; error?: string };
  logout: () => void;
  addBloodUnit: (newUnit: Omit<BloodUnit, 'id' | 'temperatureHistory' | 'custodyHistory' | 'trackingSteps'>) => BloodUnit;
  updateUnitStatus: (unitId: string, status: UnitStatus, reason?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, resolutionNote: string) => void;
  updateHandoverStatus: (transferId: string, nextStatus: HandoverStatus, details?: { temperature?: number; notes?: string }) => { success: boolean; error?: string };
  simulateTemperatureExcursion: (unitId: string, targetTemp: number) => void;
  restoreNormalTemperature: (unitId: string) => void;
  clinicalDispositionReview: (unitId: string, action: 'release' | 'condemn', notes: string) => void;
  toggleLiveSimulation: () => void;
  resetToDefaultData: () => void;
  exportInventoryCSV: () => void;
}

const BloodTraceContext = createContext<BloodTraceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_UNITS = 'bloodtrace_units_v1';
const LOCAL_STORAGE_KEY_HANDOVERS = 'bloodtrace_handovers_v1';
const LOCAL_STORAGE_KEY_ALERTS = 'bloodtrace_alerts_v1';
const LOCAL_STORAGE_KEY_ROLE = 'bloodtrace_user_role_v1';
const LOCAL_STORAGE_KEY_AUTH = 'bloodtrace_auth_session_v1';

export const BloodTraceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnitIdForTracking, setSelectedUnitIdForTracking] = useState<string>('BT-2026-001');
  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(true);
  const [thresholds, setThresholds] = useState<ColdChainThresholds>(INITIAL_THRESHOLDS);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed?.isAuthenticated);
      }
    } catch {
      // Fallback
    }
    return false;
  });

  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.email || null;
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROLE);
    if (saved === 'Blood Bank Staff' || saved === 'Courier' || saved === 'Administrator') {
      return saved as UserRole;
    }
    return 'Administrator';
  });

  const baseUser = currentRole === 'Administrator' 
    ? MOCK_USERS.admin 
    : currentRole === 'Blood Bank Staff' 
    ? MOCK_USERS.staff 
    : MOCK_USERS.courier;

  const currentUser: UserProfile = loggedInEmail && loggedInEmail.toLowerCase() !== baseUser.email.toLowerCase()
    ? {
        ...baseUser,
        email: loggedInEmail,
      }
    : baseUser;

  // Initialize Units from localStorage or defaults
  const [units, setUnits] = useState<BloodUnit[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_UNITS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_BLOOD_UNITS;
  });

  // Initialize Handovers
  const [handovers, setHandovers] = useState<HandoverTransfer[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HANDOVERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_HANDOVERS;
  });

  // Initialize Notifications
  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_UNITS, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_HANDOVERS, JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ALERTS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ROLE, currentRole);
  }, [currentRole]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setLoggedInEmail(null);
  };

  const login = ({ email, password, role, remember = true }: LoginPayload): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    setCurrentRoleState(role);
    setLoggedInEmail(normalizedEmail);
    setIsAuthenticated(true);
    setActiveTab('dashboard');

    if (remember) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_AUTH,
        JSON.stringify({ isAuthenticated: true, email: normalizedEmail, role })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
    }

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLoggedInEmail(null);
    setActiveTab('dashboard');
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
  };

  const toggleLiveSimulation = () => {
    setLiveSimulationActive(prev => !prev);
  };

  const resetToDefaultData = () => {
    setUnits(INITIAL_BLOOD_UNITS);
    setHandovers(INITIAL_HANDOVERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedUnitIdForTracking('BT-2026-001');
    localStorage.removeItem(LOCAL_STORAGE_KEY_UNITS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_HANDOVERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ALERTS);
  };

  // Add new Blood Unit
  const addBloodUnit = (newUnitData: Omit<BloodUnit, 'id' | 'temperatureHistory' | 'custodyHistory' | 'trackingSteps'>): BloodUnit => {
    const nextNum = units.length + 1;
    const formattedId = `BT-2026-${String(nextNum).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const specs = COMPONENT_STORAGE_SPECS[newUnitData.componentType];
    const initialTemp = newUnitData.currentTemperature || (specs.minTemp + specs.maxTemp) / 2;

    const newUnit: BloodUnit = {
      ...newUnitData,
      id: formattedId,
      currentTemperature: initialTemp,
      temperatureHistory: [
        {
          id: `t-${Date.now()}`,
          timestamp: nowIso,
          temperature: initialTemp,
          location: newUnitData.currentLocation,
          sensorId: newUnitData.sensorId,
          status: 'Safe',
          note: 'Initial intake temperature recorded',
        },
      ],
      custodyHistory: [
        {
          timestamp: nowIso,
          handlerName: currentUser.name,
          handlerRole: currentUser.role,
          organization: currentUser.facility,
          action: 'Blood unit intake logged and barcoded',
          location: newUnitData.currentLocation,
          temperatureAtHandover: initialTemp,
          signatureVerified: true,
        },
      ],
      trackingSteps: [
        {
          stepNumber: 1,
          title: 'Blood Unit Registered',
          description: `Intake cataloged by ${currentUser.name}. Barcode ${formattedId} assigned.`,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          location: newUnitData.currentLocation,
          operator: currentUser.name,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Testing & Verification',
          description: 'ABO/Rh blood typing and serological screening confirmed.',
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          location: 'Diagnostic Laboratory',
          operator: currentUser.name,
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Cold-Chain Storage',
          description: `Assigned to container ${newUnitData.assignedContainerId} under ${specs.storageCondition}.`,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          location: newUnitData.currentLocation,
          operator: currentUser.name,
          status: 'completed',
          temperature: initialTemp,
        },
        {
          stepNumber: 4,
          title: 'Dispatch Preparation',
          description: 'Awaiting clinical order allocation and FEFO matching.',
          location: newUnitData.currentLocation,
          status: 'pending',
        },
        {
          stepNumber: 5,
          title: 'Courier Custody Acceptance',
          description: 'Insulated medical transport cooler handoff.',
          status: 'pending',
        },
        {
          stepNumber: 6,
          title: 'Hospital Receiving Verification',
          description: 'Hospital reception and electronic thermal verification.',
          status: 'pending',
        },
        {
          stepNumber: 7,
          title: 'Clinical Transfusion Outcome',
          description: 'Bedside identity scan and transfusion record.',
          status: 'pending',
        },
      ],
    };

    setUnits(prev => [newUnit, ...prev]);

    // Add info notification
    const newNotice: AlertNotification = {
      id: `ALT-${Date.now()}`,
      severity: 'info',
      category: 'Integrity Check',
      title: `Blood Unit Registered: ${newUnit.id}`,
      description: `New unit (${newUnit.bloodGroup} ${newUnit.componentType}) stored in ${newUnit.currentLocation}.`,
      unitId: newUnit.id,
      timestamp: nowIso,
      isAcknowledged: true,
      acknowledgedBy: currentUser.name,
      acknowledgedAt: nowIso,
    };
    setNotifications(prev => [newNotice, ...prev]);

    return newUnit;
  };

  // Update Unit Status
  const updateUnitStatus = (unitId: string, status: UnitStatus, reason?: string) => {
    setUnits(prev =>
      prev.map(u => {
        if (u.id === unitId) {
          return {
            ...u,
            unitStatus: status,
            quarantineReason: reason || u.quarantineReason,
            quarantinedAt: status === 'Quarantined' ? new Date().toISOString() : u.quarantinedAt,
          };
        }
        return u;
      })
    );
  };

  // Acknowledge Alert
  const acknowledgeAlert = (alertId: string) => {
    const nowIso = new Date().toISOString();
    setNotifications(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            isAcknowledged: true,
            acknowledgedBy: currentUser.name,
            acknowledgedAt: nowIso,
          };
        }
        return a;
      })
    );
  };

  // Resolve Alert with clinical note
  const resolveAlert = (alertId: string, resolutionNote: string) => {
    setNotifications(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            severity: 'resolved',
            isAcknowledged: true,
            resolutionNote,
          };
        }
        return a;
      })
    );
  };

  // Handover state transitions with strict healthcare custody rules
  const updateHandoverStatus = (
    transferId: string, 
    nextStatus: HandoverStatus, 
    details?: { temperature?: number; notes?: string }
  ): { success: boolean; error?: string } => {
    const target = handovers.find(h => h.id === transferId);
    if (!target) {
      return { success: false, error: 'Transfer manifest not found.' };
    }

    // Guardrail against invalid transitions
    const validTransitions: Record<HandoverStatus, HandoverStatus[]> = {
      'Draft Manifest': ['Prepared for Dispatch', 'Cancelled'],
      'Prepared for Dispatch': ['Dispatched', 'Cancelled'],
      'Dispatched': ['In Courier Custody', 'Cancelled'],
      'In Courier Custody': ['Delivered to Hospital'],
      'Delivered to Hospital': ['Receipt Verified'],
      'Receipt Verified': [],
      'Cancelled': [],
    };

    if (!validTransitions[target.status]?.includes(nextStatus)) {
      return { 
        success: false, 
        error: `Invalid handover workflow transition: Cannot move from "${target.status}" directly to "${nextStatus}".` 
      };
    }

    const nowIso = new Date().toISOString();
    const formattedTime = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    setHandovers(prev =>
      prev.map(h => {
        if (h.id === transferId) {
          const updatedHistory = [
            ...h.history,
            {
              timestamp: nowIso,
              status: nextStatus,
              actor: `${currentUser.name} (${currentUser.role})`,
              details: details?.notes || `Handover status updated to ${nextStatus}`,
            },
          ];

          return {
            ...h,
            status: nextStatus,
            receivingTemperature: details?.temperature !== undefined ? details.temperature : h.receivingTemperature,
            actualArrival: nextStatus === 'Delivered to Hospital' || nextStatus === 'Receipt Verified' ? nowIso : h.actualArrival,
            history: updatedHistory,
          };
        }
        return h;
      })
    );

    // Also sync the associated blood units' status and tracking timeline
    setUnits(prevUnits =>
      prevUnits.map(unit => {
        if (target.unitIds.includes(unit.id)) {
          let newUnitStatus = unit.unitStatus;
          let newCustodian = unit.currentCustodian;
          let newLocation = unit.currentLocation;

          const updatedTrackingSteps = [...unit.trackingSteps];

          if (nextStatus === 'Dispatched') {
            newUnitStatus = 'In Transit';
            newCustodian = target.courierName;
            newLocation = `Transit Cooler (${target.courierName})`;
            const step4 = updatedTrackingSteps.find(s => s.stepNumber === 4);
            if (step4) {
              step4.status = 'completed';
              step4.timestamp = formattedTime;
              step4.operator = currentUser.name;
            }
            const step5 = updatedTrackingSteps.find(s => s.stepNumber === 5);
            if (step5) step5.status = 'in_progress';
          } else if (nextStatus === 'In Courier Custody') {
            newUnitStatus = 'In Transit';
            newCustodian = `${target.courierName} (MediTransit)`;
            newLocation = `En route to ${target.destinationFacility}`;
            const step5 = updatedTrackingSteps.find(s => s.stepNumber === 5);
            if (step5) {
              step5.status = 'completed';
              step5.timestamp = formattedTime;
              step5.operator = target.courierName;
              step5.temperature = details?.temperature || unit.currentTemperature;
            }
            const step6 = updatedTrackingSteps.find(s => s.stepNumber === 6);
            if (step6) step6.status = 'in_progress';
          } else if (nextStatus === 'Receipt Verified') {
            newUnitStatus = 'Available';
            newCustodian = target.destinationFacility;
            newLocation = `${target.destinationFacility} - Transfusion Lab`;
            const step6 = updatedTrackingSteps.find(s => s.stepNumber === 6);
            if (step6) {
              step6.status = 'completed';
              step6.timestamp = formattedTime;
              step6.operator = currentUser.name;
              step6.temperature = details?.temperature || unit.currentTemperature;
            }
            const step7 = updatedTrackingSteps.find(s => s.stepNumber === 7);
            if (step7) step7.status = 'in_progress';
          }

          return {
            ...unit,
            unitStatus: newUnitStatus,
            currentCustodian: newCustodian,
            currentLocation: newLocation,
            currentTemperature: details?.temperature !== undefined ? details.temperature : unit.currentTemperature,
            trackingSteps: updatedTrackingSteps,
          };
        }
        return unit;
      })
    );

    return { success: true };
  };

  // Temperature Excursion Simulation
  const simulateTemperatureExcursion = (unitId: string, targetTemp: number) => {
    const targetUnit = units.find(u => u.id === unitId);
    if (!targetUnit) return;

    const specs = COMPONENT_STORAGE_SPECS[targetUnit.componentType];
    const isExcursion = targetTemp < specs.minTemp || targetTemp > specs.maxTemp;
    const nowIso = new Date().toISOString();

    const newReading = {
      id: `t-${Date.now()}`,
      timestamp: nowIso,
      temperature: targetTemp,
      location: targetUnit.currentLocation,
      sensorId: targetUnit.sensorId,
      status: isExcursion ? ('Critical' as const) : ('Safe' as const),
      note: isExcursion ? `TEMPERATURE EXCURSION DETECTED: ${targetTemp}°C (Safe range: ${specs.minTemp}°C–${specs.maxTemp}°C)` : 'Normal telemetry reading',
    };

    setUnits(prev =>
      prev.map(u => {
        if (u.id === unitId) {
          const updatedSteps = u.trackingSteps.map(step => {
            if (step.stepNumber === 3) {
              return {
                ...step,
                status: isExcursion ? ('flagged' as const) : step.status,
                temperature: targetTemp,
                notes: isExcursion ? `Excursion at ${targetTemp}°C. Moved to Quarantine.` : step.notes,
              };
            }
            return step;
          });

          return {
            ...u,
            currentTemperature: targetTemp,
            temperatureStatus: isExcursion ? 'Critical' : 'Safe',
            unitStatus: isExcursion ? 'Quarantined' : u.unitStatus,
            quarantineReason: isExcursion 
              ? `Thermal Excursion: Measured ${targetTemp}°C outside safe window [${specs.minTemp}°C to ${specs.maxTemp}°C]. Automatic quarantine triggered.`
              : u.quarantineReason,
            quarantinedAt: isExcursion ? nowIso : u.quarantinedAt,
            temperatureHistory: [...u.temperatureHistory, newReading],
            trackingSteps: updatedSteps,
          };
        }
        return u;
      })
    );

    if (isExcursion) {
      // Create high-priority critical alert
      const excursionAlert: AlertNotification = {
        id: `ALT-EXC-${Date.now()}`,
        severity: 'critical',
        category: 'Temperature Excursion',
        title: `Critical Temperature Violation: Unit ${unitId}`,
        description: `Reading of ${targetTemp}°C exceeds safe bounds [${specs.minTemp}°C to ${specs.maxTemp}°C] for ${targetUnit.componentType}. Unit automatically quarantined. Authorized clinical review required.`,
        unitId,
        timestamp: nowIso,
        isAcknowledged: false,
      };

      setNotifications(prev => [excursionAlert, ...prev]);
    }
  };

  // Restore temperature back to nominal without automatically clearing clinical quarantine
  const restoreNormalTemperature = (unitId: string) => {
    const targetUnit = units.find(u => u.id === unitId);
    if (!targetUnit) return;

    const specs = COMPONENT_STORAGE_SPECS[targetUnit.componentType];
    const normalTemp = Number(((specs.minTemp + specs.maxTemp) / 2).toFixed(1));
    const nowIso = new Date().toISOString();

    const newReading = {
      id: `t-${Date.now()}`,
      timestamp: nowIso,
      temperature: normalTemp,
      location: targetUnit.currentLocation,
      sensorId: targetUnit.sensorId,
      status: 'Safe' as const,
      note: `Sensor temperature returned to nominal ${normalTemp}°C. Clinical disposition review still required.`,
    };

    setUnits(prev =>
      prev.map(u => {
        if (u.id === unitId) {
          return {
            ...u,
            currentTemperature: normalTemp,
            temperatureStatus: 'Safe',
            // DO NOT automatically declare unit safe or change unitStatus back to Available!
            // Must adhere to prompt rule: "Do not automatically declare a unit safe after the temperature returns to normal. Its disposition must follow the configured safety protocol and authorized review."
            temperatureHistory: [...u.temperatureHistory, newReading],
          };
        }
        return u;
      })
    );

    // Informational alert
    const infoAlert: AlertNotification = {
      id: `ALT-RESTORE-${Date.now()}`,
      severity: 'warning',
      category: 'Temperature Excursion',
      title: `Sensor Normalized for Unit ${unitId} (${normalTemp}°C)`,
      description: `Temperature is back within range, but Unit ${unitId} remains Quarantined until Chief Medical Officer performs clinical review.`,
      unitId,
      timestamp: nowIso,
      isAcknowledged: false,
    };

    setNotifications(prev => [infoAlert, ...prev]);
  };

  // Clinical Disposition Review (Medical Director action)
  const clinicalDispositionReview = (unitId: string, action: 'release' | 'condemn', notes: string) => {
    const nowIso = new Date().toISOString();
    setUnits(prev =>
      prev.map(u => {
        if (u.id === unitId) {
          const newStatus: UnitStatus = action === 'release' ? 'Available' : 'Expired';
          return {
            ...u,
            unitStatus: newStatus,
            quarantineReason: action === 'release' 
              ? `Released by ${currentUser.name} after clinical review: "${notes}"` 
              : `Condemned & barcoded for biohazard disposal: "${notes}"`,
            custodyHistory: [
              ...u.custodyHistory,
              {
                timestamp: nowIso,
                handlerName: currentUser.name,
                handlerRole: currentUser.role,
                organization: currentUser.facility,
                action: action === 'release' ? 'Clinical Quarantine Clearance' : 'Biological Condemnation',
                location: u.currentLocation,
                temperatureAtHandover: u.currentTemperature,
                signatureVerified: true,
              },
            ],
          };
        }
        return u;
      })
    );

    // Resolve any critical alerts associated with this unit
    setNotifications(prev =>
      prev.map(a => {
        if (a.unitId === unitId && (a.severity === 'critical' || a.severity === 'warning')) {
          return {
            ...a,
            severity: 'resolved',
            isAcknowledged: true,
            resolutionNote: `Disposition signed by ${currentUser.name}: ${action.toUpperCase()} - ${notes}`,
          };
        }
        return a;
      })
    );
  };

  // CSV Export for Reports
  const exportInventoryCSV = () => {
    const headers = [
      'Unit ID',
      'Blood Group',
      'Component Type',
      'Volume (mL)',
      'Collection Date',
      'Expiry Date',
      'Current Location',
      'Temperature (°C)',
      'Temperature Status',
      'Unit Status',
      'Current Custodian'
    ];

    const rows = units.map(u => [
      u.id,
      u.bloodGroup,
      `"${u.componentType}"`,
      u.volumeMl,
      u.collectionDate.split('T')[0],
      u.expiryDate.split('T')[0],
      `"${u.currentLocation}"`,
      u.currentTemperature,
      u.temperatureStatus,
      u.unitStatus,
      `"${u.currentCustodian}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Blood_Traceability_and_Availability_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BloodTraceContext.Provider
      value={{
        units,
        handovers,
        notifications,
        currentUser,
        isAuthenticated,
        activeTab,
        searchQuery,
        thresholds,
        selectedUnitIdForTracking,
        liveSimulationActive,
        setActiveTab,
        setSearchQuery,
        setSelectedUnitIdForTracking,
        setCurrentRole,
        login,
        logout,
        addBloodUnit,
        updateUnitStatus,
        acknowledgeAlert,
        resolveAlert,
        updateHandoverStatus,
        simulateTemperatureExcursion,
        restoreNormalTemperature,
        clinicalDispositionReview,
        toggleLiveSimulation,
        resetToDefaultData,
        exportInventoryCSV,
      }}
    >
      {children}
    </BloodTraceContext.Provider>
  );
};

export const useBloodTrace = () => {
  const context = useContext(BloodTraceContext);
  if (!context) {
    throw new Error('useBloodTrace must be used within a BloodTraceProvider');
  }
  return context;
};
