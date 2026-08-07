import { useEffect, useState } from 'react';
import { Fingerprint, User, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../auth/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherCredentials, saveTeacherCredentials, type TeacherCredentialRecord } from '../../services/realtimeDb';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<TeacherCredentialRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!showProfileModal) return;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError('');

      try {
        const credentials = await fetchTeacherCredentials();
        setProfile({
          email: credentials?.email || user?.email || '',
          name: credentials?.name || user?.displayName || 'Teacher',
          className: credentials?.className || user?.className || '',
          section: credentials?.section || user?.section || '',
          password: credentials?.password || '',
        });
      } catch {
        setProfileError('Unable to load teacher details right now.');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [showProfileModal, user]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setProfileSaving(true);
    setProfileError('');

    try {
      await saveTeacherCredentials({
        email: profile.email?.trim().toLowerCase() || user?.email || '',
        name: profile.name?.trim() || 'Teacher',
        className: profile.className?.trim() || '',
        section: profile.section?.trim() || '',
        password: profile.password || '',
      });

      setShowProfileModal(false);
    } catch {
      setProfileError('Could not save teacher details.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/20 bg-slate-950/45 text-white backdrop-blur-2xl">
        <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 transition hover:bg-white/10 lg:hidden"
          >
            <Menu className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Fingerprint className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <span className="block font-semibold leading-tight text-white">
              TechGlaz Fest
              </span>
              <span className="text-[11px] text-slate-300">Live attendance sync</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 sm:gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-white/90 sm:block">
                {user?.displayName || user?.email || 'Teacher'}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="mb-1 border-b border-white/10 px-3 py-2">
                  <p className="text-xs text-slate-400">Signed in</p>
                  <p className="truncate text-sm font-medium text-white">
                    {user?.email || 'Teacher'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-rose-300 transition hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </nav>

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Teacher Profile"
      >
        <div className="space-y-5">
          {profileLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
              Loading teacher details...
            </div>
          ) : (
            <>
              {profileError && (
                <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {profileError}
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Name</label>
                  <input
                    value={profile?.name || ''}
                    onChange={(e) => setProfile((current) => ({ ...(current || {}), name: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Teacher name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Email</label>
                  <input
                    value={profile?.email || ''}
                    readOnly
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-300 outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Class</label>
                    <input
                      value={profile?.className || ''}
                      onChange={(e) => setProfile((current) => ({ ...(current || {}), className: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Example: 10th"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Section</label>
                    <input
                      value={profile?.section || ''}
                      onChange={(e) => setProfile((current) => ({ ...(current || {}), section: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Example: A"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileSaving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
