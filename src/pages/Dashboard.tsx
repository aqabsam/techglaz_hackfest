import { useEffect, useState } from 'react';
import { Users, Camera, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import StatCard from '../components/auth/common/StatCard';
import { getAttendanceRecords, getDashboardStats } from '../services/api';
import type { AttendanceRecord, DashboardStats } from '../types';
import { filterVisibleAttendanceRecords, filterVisibleStudents } from '../lib/sitePrivacy';
import { loadMergedStudentRoster } from '../lib/studentRoster';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCameras: 0,
    todayAttendance: 0,
    totalAlerts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, records, mergedStudents] = await Promise.all([
          getDashboardStats(),
          getAttendanceRecords(),
          loadMergedStudentRoster().catch(() => []),
        ]);

        const visibleStudents = filterVisibleStudents(mergedStudents);
        const visibleRecords = filterVisibleAttendanceRecords(records);

        setStats({
          ...statsData,
          totalStudents: visibleStudents.length || statsData.totalStudents,
        });
        setRecentActivity(visibleRecords.slice(-6).reverse());
      } catch {
        // Keep the dashboard usable even if Firebase is temporarily unavailable.
      }
    };

    loadDashboard();
  }, []);

  const statCards = [
    { title: 'Total Students', value: String(stats.totalStudents), icon: Users, trend: 'Student roster', trendUp: true, color: 'blue' as const },
    { title: 'Active Cameras', value: String(stats.activeCameras), icon: Camera, trend: 'Webcam or CCTV', trendUp: true, color: 'green' as const },
    { title: "Today's Attendance", value: String(stats.todayAttendance), icon: CheckCircle2, trend: 'Present today', trendUp: true, color: 'amber' as const },
    { title: 'Alerts', value: String(stats.totalAlerts), icon: AlertTriangle, trend: 'System notices', trendUp: false, color: 'purple' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.45)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-xl">
              <Activity className="h-3.5 w-3.5" />
              Live classroom overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This dashboard reflects your Firebase roster and any attendance records already stored in Realtime Database.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/55 px-5 py-4 text-white backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today</p>
            <p className="mt-2 text-lg font-semibold">{new Date().toLocaleDateString()}</p>
            <p className="text-sm text-slate-400">Auto-updated from attendance records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <h2 className="text-lg font-semibold text-white">Recent Attendance</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-[42rem] w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Roll No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentActivity.length ? (
                  recentActivity.map((item, index) => (
                    <tr key={`${item.name}-${index}`} className="transition hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.rollNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.checkinTime}</td>
                      <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-300">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <h2 className="text-lg font-semibold text-white">System Snapshot</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
              <div>
                <p className="text-sm font-medium text-white">Students ready</p>
                <p className="text-xs text-slate-300">Loaded from the saved Firebase roster</p>
              </div>
              <span className="text-2xl font-semibold text-emerald-300">{stats.totalStudents}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4">
              <div>
                <p className="text-sm font-medium text-white">Cameras active</p>
                <p className="text-xs text-slate-300">No backend camera process in this build</p>
              </div>
              <span className="text-2xl font-semibold text-cyan-300">{stats.activeCameras}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4">
              <div>
                <p className="text-sm font-medium text-white">Alerts</p>
                <p className="text-xs text-slate-300">Currently no active warning rules</p>
              </div>
              <span className="text-2xl font-semibold text-rose-300">{stats.totalAlerts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
