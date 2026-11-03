import React from 'react';
import { UnitStatus, TemperatureStatus, HandoverStatus, AlertSeverity } from '../../types/bloodTrace';

interface StatusBadgeProps {
  type: 'unit' | 'temp' | 'handover' | 'severity';
  value: UnitStatus | TemperatureStatus | HandoverStatus | AlertSeverity | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '' }) => {
  if (type === 'unit') {
    switch (value) {
      case 'Available':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Available
          </span>
        );
      case 'In Transit':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
            In Transit
          </span>
        );
      case 'Quarantined':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            Quarantined
          </span>
        );
      case 'Reserved':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
            Reserved
          </span>
        );
      case 'Expired':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Expired (Ineligible)
          </span>
        );
      case 'Transfused':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
            Transfused
          </span>
        );
      default:
        return <span className={`text-xs text-slate-600 ${className}`}>{value}</span>;
    }
  }

  if (type === 'temp') {
    switch (value) {
      case 'Safe':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Cold-Chain Safe
          </span>
        );
      case 'Warning':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Near Threshold
          </span>
        );
      case 'Critical':
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            Critical Excursion
          </span>
        );
      default:
        return <span className={`text-xs text-slate-600 ${className}`}>{value}</span>;
    }
  }

  if (type === 'severity') {
    switch (value) {
      case 'critical':
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-red-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-amber-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case 'info':
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-sky-700 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Informational
          </span>
        );
      case 'resolved':
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-slate-500 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Resolved
          </span>
        );
      default:
        return <span className={`text-xs text-slate-600 ${className}`}>{value}</span>;
    }
  }

  // Handover status
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      {value}
    </span>
  );
};
