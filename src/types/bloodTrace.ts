export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type ComponentType = 
  | 'Whole Blood' 
  | 'Packed Red Blood Cells (PRBC)' 
  | 'Platelet Concentrate' 
  | 'Fresh Frozen Plasma (FFP)' 
  | 'Cryoprecipitate';

export type UnitStatus = 
  | 'Available' 
  | 'In Transit' 
  | 'Quarantined' 
  | 'Reserved' 
  | 'Transfused' 
  | 'Expired';

export type TemperatureStatus = 'Safe' | 'Warning' | 'Critical';

export interface StorageRequirements {
  minTemp: number; // in Celsius
  maxTemp: number;
  shelfLifeDays: number;
  storageCondition: string;
}

export interface TemperatureReading {
  id: string;
  timestamp: string;
  temperature: number;
  location: string;
  sensorId: string;
  status: TemperatureStatus;
  note?: string;
}

export interface CustodyRecord {
  timestamp: string;
  handlerName: string;
  handlerRole: string;
  organization: string;
  action: string;
  location: string;
  temperatureAtHandover?: number;
  signatureVerified: boolean;
}

export interface TrackingStep {
  stepNumber: number;
  title: string;
  description: string;
  timestamp?: string;
  location?: string;
  operator?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'flagged';
  temperature?: number;
  notes?: string;
}

export interface BloodUnit {
  id: string; // e.g. BT-2026-001
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  volumeMl: number;
  anticoagulant: string;
  collectionDate: string;
  expiryDate: string;
  currentLocation: string;
  assignedContainerId: string;
  sensorId: string;
  currentTemperature: number;
  temperatureStatus: TemperatureStatus;
  unitStatus: UnitStatus;
  currentCustodian: string;
  quarantineReason?: string;
  quarantinedAt?: string;
  temperatureHistory: TemperatureReading[];
  custodyHistory: CustodyRecord[];
  trackingSteps: TrackingStep[];
  fefoPriorityScore?: number;
}

export type HandoverStatus = 
  | 'Draft Manifest' 
  | 'Prepared for Dispatch' 
  | 'Dispatched' 
  | 'In Courier Custody' 
  | 'Delivered to Hospital' 
  | 'Receipt Verified' 
  | 'Cancelled';

export interface HandoverTransfer {
  id: string; // e.g. HO-8421
  unitIds: string[];
  originFacility: string;
  destinationFacility: string;
  courierName: string;
  courierId: string;
  courierContact: string;
  transportContainerId: string;
  sensorId: string;
  dispatchTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: HandoverStatus;
  dispatchTemperature: number;
  receivingTemperature?: number;
  integritySealIntact?: boolean;
  notes: string;
  history: {
    timestamp: string;
    status: HandoverStatus;
    actor: string;
    details: string;
  }[];
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved';

export interface AlertNotification {
  id: string;
  severity: AlertSeverity;
  category: 'Temperature Excursion' | 'Near Expiry' | 'Expired Unit' | 'Delayed Handover' | 'Integrity Check';
  title: string;
  description: string;
  unitId?: string;
  transferId?: string;
  timestamp: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNote?: string;
}

export type UserRole = 'Administrator' | 'Blood Bank Staff' | 'Courier';

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  role: UserRole;
  facility: string;
  avatarInitials: string;
}

export interface ColdChainThresholds {
  prbcMin: number;
  prbcMax: number;
  plateletsMin: number;
  plateletsMax: number;
  ffpMax: number;
  excursionToleranceMinutes: number;
}
