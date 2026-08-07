import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CircleUserRound, LogOut, Search, ShieldCheck } from 'lucide-react';
import { fetchRealtimeStudents } from '../services/realtimeDb';
import { getAttendanceRecords, getAttendanceSettings } from '../services/api';
import { filterVisibleAttendanceRecords, filterVisibleStudents } from '../lib/sitePrivacy';
import type { AttendanceRecord, Student } from '../types';

type StudentSession = {
  name: string;
  rollNumber: string;
};

const SESSION_KEY = 'attenzo-student-session';

function loadSession(): StudentSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as StudentSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StudentSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeRoll(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '').replace(/^0+(?=\d)/, '');
}

export default function StudentPortal() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<StudentSession | null>(loadSession());
  const [classStartDate, setClassStartDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentList, attendance, settings] = await Promise.all([
          fetchRealtimeStudents().catch(() => []),
          getAttendanceRecords(),
          getAttendanceSettings().catch(() => ({ classStartDate: '', dayOverrides: {} })),
        ]);
        setStudents(filterVisibleStudents(studentList));
        setRecords(filterVisibleAttendanceRecords(attendance));
        setClassStartDate(settings.classStartDate || '');
      } catch {
        setError('Unable to load portal data right now.');
      }
    };

    loadData();

    const interval = window.setInterval(() => {
      loadData();
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  const studentRecords = useMemo(() => {
    if (!session) return [];
    return records.filter((record) => {
      const matchesRoll = normalizeRoll(record.rollNumber || '') === normalizeRoll(session.rollNumber);
      const matchesName = normalizeText(record.name) === normalizeText(session.name);
      return matchesRoll || matchesName;
    });
  }, [records, session]);

  const activeRecords = useMemo(() => {
    if (!classStartDate) return studentRecords;
    return studentRecords.filter((record) => !record.date || record.date >= classStartDate);
  }, [classStartDate, studentRecords]);

  const presentCount = activeRecords.filter((record) => record.status === 'Present').length;
  const totalCount = activeRecords.filter((record) => record.status !== 'Holiday' && record.status !== 'Sunday').length;
  const attendancePercent = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;
  const classDays = new Set(activeRecords.map((record) => record.date).filter(Boolean)).size;
  const sortedDates = activeRecords.map((record) => record.date).filter(Boolean).sort();
  const classStartedFrom = classStartDate || sortedDates[0] || '—';
  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = studentRecords.find((record) => record.date === today);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const match = students.find(
        (student) =>
          normalizeText(student.name) === normalizeText(name) &&
          normalizeRoll(student.rollNumber) === normalizeRoll(rollNumber),
      );

      if (!match) {
        throw new Error('Student not found. Check your name and roll number.');
      }

      const nextSession = { name: match.name, rollNumber: match.rollNumber };
      saveSession(nextSession);
      setSession(nextSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#06111e] px-3 py-3 text-white sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-[-4rem] h-[16rem] w-[16rem] rounded-full bg-cyan-500/25 blur-3xl sm:left-[-8rem] sm:top-[-6rem] sm:h-[26rem] sm:w-[26rem]" />
        <div className="absolute right-[-2rem] top-[8rem] h-[14rem] w-[14rem] rounded-full bg-blue-500/20 blur-3xl sm:right-[-8rem] sm:h-[24rem] sm:w-[24rem]" />
        <div className="absolute bottom-[-6rem] left-[20%] h-[16rem] w-[16rem] rounded-full bg-emerald-500/15 blur-3xl sm:bottom-[-8rem] sm:h-[22rem] sm:w-[22rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.2),rgba(7,17,31,0.9))]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/55 px-3 py-3 backdrop-blur-2xl sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">Student portal</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Check your attendance</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Use the same name and roll number saved by your teacher to view your attendance record.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            {session ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : null}
          </div>
        </div>

        {!session ? (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-[0_30px_80px_-35px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <CircleUserRound className="h-6 w-6 text-cyan-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Student login</p>
                  <p className="text-sm text-slate-300">Enter your name and roll number</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">
                  Enter the name and roll number exactly as saved by your teacher.
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Student Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="2024001"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? 'Checking...' : 'View Attendance'}
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-4 text-white shadow-2xl shadow-slate-900/20 backdrop-blur-2xl sm:p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">What you can see</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Your attendance summary</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="rounded-3xl border border-emerald-400/10 bg-emerald-500/10 p-4">
                  Your attendance percentage
                </div>
                <div className="rounded-3xl border border-rose-400/10 bg-rose-500/10 p-4">
                  Your status for today
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  A record of your recent attendance
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Student</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/10">
                    <CircleUserRound className="h-6 w-6 text-cyan-200" />
                  </div>
                  <p className="text-lg font-semibold text-white">{session.name}</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Roll Number</p>
                <p className="mt-2 text-lg font-semibold text-white">{session.rollNumber}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Attendance</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">{attendancePercent}%</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Classes</p>
                <p className="mt-2 text-lg font-semibold text-white">{classDays}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Started</p>
                <p className="mt-2 text-lg font-semibold text-white">{classStartedFrom}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-xl shadow-slate-900/5 backdrop-blur-2xl">
                <div className="border-b border-white/10 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-white">Your attendance records</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 sm:py-4">Date</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 sm:py-4">Time</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 sm:py-4">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 sm:py-4">Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {activeRecords.length ? (
                        activeRecords.map((record, index) => (
                          <tr key={`${record.date}-${index}`} className="hover:bg-white/5">
                            <td className="px-3 py-3 text-sm text-slate-200 sm:px-6 sm:py-4">{record.date}</td>
                            <td className="px-3 py-3 text-sm text-slate-200 sm:px-6 sm:py-4">{record.checkinTime}</td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  record.status === 'Present'
                                    ? 'bg-emerald-500/15 text-emerald-300'
                                    : 'bg-rose-500/15 text-rose-300'
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-200 sm:px-6 sm:py-4">{record.day}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-300 sm:px-6 sm:py-14">
                            No attendance records found for your login details yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl sm:p-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-cyan-200" />
                    <h3 className="text-sm font-semibold text-white">Current status</h3>
                  </div>
                  <div className="mt-4 rounded-3xl bg-slate-950/90 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today</p>
                    <p className="mt-2 text-2xl font-semibold">{todayRecord?.status || 'Not marked yet'}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {todayRecord?.checkinTime ? `Check-in at ${todayRecord.checkinTime}` : todayRecord?.status === 'Holiday' || todayRecord?.status === 'Sunday' ? 'Marked as non-attendance day' : 'Waiting for attendance'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Registered profile</p>
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/10">
                      <CircleUserRound className="h-7 w-7 text-cyan-200" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{session.name}</p>
                      <p className="text-sm text-slate-300">Roll number: {session.rollNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
