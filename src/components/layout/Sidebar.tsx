import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Camera,
  BarChart3,
  GraduationCap,
  Fingerprint,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/students', icon: Users, label: 'Students' },
  { path: '/app/live-cctv', icon: Camera, label: 'Live CCTV' },
  { path: '/app/reports', icon: BarChart3, label: 'Analytics' },
  { path: '/app/admin', icon: Shield, label: 'Admin' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[min(18rem,85vw)] flex-col border-r border-cyan-400/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)] text-white shadow-[20px_0_80px_-45px_rgba(15,23,42,0.9)] backdrop-blur-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:w-72 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/10 sm:h-12 sm:w-12">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-[0.2em] uppercase">TechGlaz Fest</span>
              <p className="text-[11px] text-slate-300/80">Teacher command center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-cyan-300/20 bg-white/10 text-white shadow-lg shadow-cyan-500/20'
                    : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 p-3 sm:p-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
            <p className="mt-1 text-sm text-white font-medium truncate">{user?.email ?? 'Teacher'}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
              Secure access active
            </div>
          </div>
          <NavLink
            to="/student"
            onClick={onClose}
            className="flex items-center justify-between rounded-[1.25rem] border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-50 transition hover:bg-cyan-500/20"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </span>
            <span className="text-xs text-cyan-100/80">Open</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
