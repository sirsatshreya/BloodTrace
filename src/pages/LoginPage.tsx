import React, { useState } from 'react';
import {
  Droplet,
  Shield,
  FlaskConical,
  Truck,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Check,
  Info,
  ThermometerSnowflake,
  Boxes,
  CalendarClock,
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { UserRole } from '../types/bloodTrace';
import { MOCK_USERS } from '../data/mockData';

type AccountPortal = 'administrator' | 'user';

interface DemoAccount {
  id: string;
  portal: AccountPortal;
  role: UserRole;
  label: string;
  name: string;
  title: string;
  email: string;
  password: string;
  facility: string;
  scope: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'admin',
    portal: 'administrator',
    role: 'Administrator',
    label: 'Administrator',
    name: MOCK_USERS.admin.name,
    title: MOCK_USERS.admin.title,
    email: 'elena.vance@bloodtrace.health',
    password: 'admin123',
    facility: MOCK_USERS.admin.facility,
    scope: 'Full clinical governance, quarantine disposition, thresholds & audit exports',
  },
  {
    id: 'staff',
    portal: 'user',
    role: 'Blood Bank Staff',
    label: 'Blood Bank User',
    name: MOCK_USERS.staff.name,
    title: MOCK_USERS.staff.title,
    email: 'm.chen@bloodtrace.health',
    password: 'user123',
    facility: MOCK_USERS.staff.facility,
    scope: 'Unit intake registration, ISBT-128 labels, FEFO queue & dispatch packing',
  },
  {
    id: 'courier',
    portal: 'user',
    role: 'Courier',
    label: 'Logistics User',
    name: MOCK_USERS.courier.name,
    title: MOCK_USERS.courier.title,
    email: 's.jenkins@meditransit.com',
    password: 'courier123',
    facility: MOCK_USERS.courier.facility,
    scope: 'QR scan verification, custody handovers & hospital dock delivery logs',
  },
];

export const LoginPage: React.FC = () => {
  const { login, units } = useBloodTrace();

  const [portal, setPortal] = useState<AccountPortal>('administrator');
  const [selectedUserRole, setSelectedUserRole] = useState<'Blood Bank Staff' | 'Courier'>('Blood Bank Staff');
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState<string>(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeRole: UserRole = portal === 'administrator' ? 'Administrator' : selectedUserRole;

  const availableUnitsCount = units.filter(u => u.unitStatus === 'Available').length;
  const inTransitCount = units.filter(u => u.unitStatus === 'In Transit').length;

  const handlePortalSwitch = (nextPortal: AccountPortal) => {
    setPortal(nextPortal);
    setError(null);
    if (nextPortal === 'administrator') {
      setEmail(DEMO_ACCOUNTS[0].email);
      setPassword(DEMO_ACCOUNTS[0].password);
    } else {
      const target = selectedUserRole === 'Blood Bank Staff' ? DEMO_ACCOUNTS[1] : DEMO_ACCOUNTS[2];
      setEmail(target.email);
      setPassword(target.password);
    }
  };

  const handleUserSubRoleChange = (role: 'Blood Bank Staff' | 'Courier') => {
    setSelectedUserRole(role);
    setError(null);
    const target = role === 'Blood Bank Staff' ? DEMO_ACCOUNTS[1] : DEMO_ACCOUNTS[2];
    setEmail(target.email);
    setPassword(target.password);
  };

  const handleApplyDemoAccount = (account: DemoAccount, immediateSignIn = false) => {
    setPortal(account.portal);
    if (account.role === 'Blood Bank Staff' || account.role === 'Courier') {
      setSelectedUserRole(account.role);
    }
    setEmail(account.email);
    setPassword(account.password);
    setError(null);

    if (immediateSignIn) {
      setIsSubmitting(true);
      setTimeout(() => {
        login({
          email: account.email,
          password: account.password,
          role: account.role,
          remember: rememberSession,
        });
        setIsSubmitting(false);
      }, 220);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Enter a valid institutional email address.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters for prototype access.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = login({
        email: trimmedEmail,
        password,
        role: activeRole,
        remember: rememberSession,
      });
      if (!result.success) {
        setError(result.error || 'Unable to sign in. Please verify your credentials.');
      }
      setIsSubmitting(false);
    }, 240);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col lg:flex-row">
      {/* Left Column: Clinical Platform Identity & Summary */}
      <div className="lg:w-[46%] xl:w-[44%] bg-slate-900 text-slate-200 p-8 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-950 shrink-0">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-snug">
                Blood Traceability and Availability
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Unit-Level Traceability & Cold-Chain Integrity
              </span>
            </div>
          </div>

          {/* Primary Heading */}
          <div className="mt-10 lg:mt-14 max-w-md">
            <p className="text-xs font-medium text-red-400 mb-3">
              Hospital Blood Supply Chain Portal
            </p>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug"
              style={{ textWrap: 'balance' }}
            >
              Verified custody and thermal compliance for every blood unit.
            </h1>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Sign in as an Administrator or operational User to monitor cold-room telemetry, verify inter-facility handovers, and dispatch units using First-Expiry-First-Out prioritization.
            </p>
          </div>

          {/* Key Operational Capabilities */}
          <div className="mt-10 divide-y divide-slate-800 border-t border-b border-slate-800 max-w-md">
            <div className="py-4 flex items-start gap-3.5">
              <ThermometerSnowflake className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-semibold text-white">Continuous Cold-Chain Guardrails</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Component-specific thermal windows (2°C–6°C PRBC, 20°C–24°C Platelets, ≤ −18°C FFP) with mandatory quarantine review.
                </p>
              </div>
            </div>

            <div className="py-4 flex items-start gap-3.5">
              <Boxes className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-semibold text-white">ISBT-128 Barcode & Custody Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  End-to-end 7-stage audit log from donation intake to courier transport and hospital receiving confirmation.
                </p>
              </div>
            </div>

            <div className="py-4 flex items-start gap-3.5">
              <CalendarClock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-semibold text-white">FEFO Inventory Optimization</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Ranks eligible units chronologically to prevent expiration wastage while isolating expired and quarantined stock.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Snapshot Metrics & Prototype Context */}
        <div className="mt-10 pt-6 border-t border-slate-800 space-y-5">
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div>
              <span className="text-[11px] text-slate-400 block">Tracked Stock</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">
                {units.length} units
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Available Now</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {availableUnitsCount} ready
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Active Transit</span>
              <span className="text-lg font-mono font-bold text-sky-400 tabular-nums">
                {inTransitCount} active
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Central Metropolitan Blood Center · Interactive Academic Prototype · Ready for FastAPI & PostgreSQL
          </p>
        </div>
      </div>

      {/* Right Column: Login Form & Role Selection */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Sign in to Blood Traceability and Availability
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose Administrator or User portal access to enter the prototype workspace.
              </p>
            </div>

            {/* Primary Portal Switcher: Administrator vs User */}
            <div
              role="tablist"
              aria-label="Account portal type"
              className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={portal === 'administrator'}
                onClick={() => handlePortalSwitch('administrator')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  portal === 'administrator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${portal === 'administrator' ? 'text-red-700' : 'text-slate-400'}`} />
                <span>Administrator</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={portal === 'user'}
                onClick={() => handlePortalSwitch('user')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  portal === 'user'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className={`w-3.5 h-3.5 ${portal === 'user' ? 'text-red-700' : 'text-slate-400'}`} />
                <span>User</span>
              </button>
            </div>

            {/* Sub-Role Selector when User Portal is Active */}
            {portal === 'user' && (
              <div className="mb-5">
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Operational User Role
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleUserSubRoleChange('Blood Bank Staff')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedUserRole === 'Blood Bank Staff'
                        ? 'border-red-600 bg-red-50/40 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <FlaskConical className="w-4 h-4 text-sky-700" />
                      {selectedUserRole === 'Blood Bank Staff' && (
                        <Check className="w-3.5 h-3.5 text-red-700" />
                      )}
                    </div>
                    <span className="block text-xs font-semibold mt-1.5">Blood Bank Staff</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Inventory & lab ops</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUserSubRoleChange('Courier')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedUserRole === 'Courier'
                        ? 'border-red-600 bg-red-50/40 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="w-4 h-4 text-amber-700" />
                      {selectedUserRole === 'Courier' && (
                        <Check className="w-3.5 h-3.5 text-red-700" />
                      )}
                    </div>
                    <span className="block text-xs font-semibold mt-1.5">Medical Courier</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Transit & custody</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@bloodtrace.health"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Access level: {activeRole}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={e => setRememberSession(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-red-700 focus:ring-red-600"
                  />
                  <span>Keep session active on refresh</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>
                  {isSubmitting
                    ? 'Verifying credentials...'
                    : `Sign In as ${portal === 'administrator' ? 'Administrator' : selectedUserRole}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Prototype Quick Demo Access Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">
                Prototype Demo Credentials
              </h3>
              <span className="text-[11px] text-slate-500">
                Click any account to enter
              </span>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {DEMO_ACCOUNTS.map(account => {
                const isSelected = email.toLowerCase() === account.email.toLowerCase();
                return (
                  <div
                    key={account.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <span>{account.label}</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-slate-600 font-normal truncate">{account.name}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                        {account.email} / {account.password}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount(account, true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      Quick Login
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Frontend prototype authentication stores session state locally for demonstration. Production deployments enforce server-side OAuth2 / JWT verification via FastAPI.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
