import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Fingerprint, FileText, Lock, Mail, ShieldCheck, Sparkles, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTeacherCredentials } from '../services/realtimeDb';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname || '/app/dashboard';
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, user]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedTeacherEmail = async () => {
      try {
        const credentials = await fetchTeacherCredentials();
        if (!cancelled && credentials?.email) {
          setEmail(credentials.email);
        }
      } catch {
        // Keep the form usable even if Firebase is temporarily unavailable.
      }
    };

    loadSavedTeacherEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        await signUp(name, email, password);
        setMessage('Account created successfully.');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#06111e] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[22rem] w-[22rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.2),rgba(7,17,31,0.9))]" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Fingerprint className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">TechGlaz Fest</p>
              <p className="text-[11px] text-slate-300">Teacher portal</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="flex items-center">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4" />
                Secure teacher access
              </div>

              <div className="space-y-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/25">
                  <Fingerprint className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    TechGlaz Fest
                  </h1>
                  <p className="text-base leading-7 text-slate-300 sm:text-lg">
                    Sign in or create your teacher profile, manage the student roster, and run attendance from one polished dashboard.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <UserCheck className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Teacher Login</p>
                  <p className="mt-2 text-sm font-semibold text-white">Secure portal access</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Roster Match</p>
                  <p className="mt-2 text-sm font-semibold text-white">Name and roll check</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <FileText className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reports</p>
                  <p className="mt-2 text-sm font-semibold text-white">Excel attendance export</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Teacher portal</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Add students once, then manage attendance, edits, and exports from the same space.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Student portal</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Students log in with the exact name and roll number saved by the teacher to see attendance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_30px_80px_-35px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-8">
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/10 p-1.5">
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === 'signin' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {mode === 'signin' ? 'Welcome back' : 'Register teacher account'}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Sign in with the teacher credentials saved in Firebase Realtime Database.
                If you are setting it up for the first time, use Register to create the teacher profile.
              </p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Full Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Teacher name"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-11 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-11 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-11 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-300">
                Teacher access is tied to your TechGlaz Fest account, and the student portal matches the exact name and roll number you save in the roster.
              </p>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
