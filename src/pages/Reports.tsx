import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Search,
  Upload,
  Users,
} from 'lucide-react';
import { getAttendanceRecords } from '../services/api';
import { filterVisibleAttendanceRecords } from '../lib/sitePrivacy';
import type { AttendanceRecord } from '../types';

type AnalyticsRow = {
  name: string;
  rollNumber: string;
  percentage: number;
  statusLabel: string;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function toNumber(value: string) {
  const cleaned = value.replace(/%/g, '').trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function looksLikePercentage(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return false;
  if (/^(present|absent|p|a|yes|no)$/i.test(cleaned)) return false;
  return /[0-9]/.test(cleaned);
}

function parseCsv(text: string): AnalyticsRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeKey);

  const pickIndex = (keys: string[]) =>
    headers.findIndex((header) => keys.some((key) => header === key || header.includes(key)));

  const nameIndex = pickIndex(['name', 'studentname', 'fullname', 'student']);
  const rollIndex = pickIndex(['rollnumber', 'rollno', 'roll', 'id']);
  const statusIndex = pickIndex(['status', 'attendance status', 'presentabsent']);
  const percentageIndex = pickIndex(['attendancepercentage', 'attendance', 'percentage', 'percent', 'score', 'marks']);
  const presentIndex = pickIndex(['present', 'presentdays', 'attended']);
  const totalIndex = pickIndex(['total', 'totaldays', 'classes', 'workingdays']);

  const rawRows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const name = cells[nameIndex] || cells[0] || '';
    const rollNumber = cells[rollIndex] || cells[1] || '';
    const status = cells[statusIndex] || '';
    let percentage = 0;
    let hasPercentage = false;

    if (percentageIndex !== -1 && cells[percentageIndex] && looksLikePercentage(cells[percentageIndex])) {
      percentage = toNumber(cells[percentageIndex]);
      hasPercentage = true;
    } else if (presentIndex !== -1 && totalIndex !== -1) {
      const present = toNumber(cells[presentIndex]);
      const total = toNumber(cells[totalIndex]);
      percentage = total ? Math.round((present / total) * 100) : 0;
      hasPercentage = total > 0;
    }

    return {
      name,
      rollNumber,
      percentage,
      status,
      hasPercentage,
    };
  }).filter((row) => row.name);

  const grouped = new Map<
    string,
    { name: string; rollNumber: string; explicitPercentages: number[]; presentCount: number; totalCount: number }
  >();

  for (const row of rawRows) {
    const key = `${normalizeKey(row.name)}|${normalizeKey(row.rollNumber || row.name)}`;
    const current = grouped.get(key) || {
      name: row.name,
      rollNumber: row.rollNumber,
      explicitPercentages: [] as number[],
      presentCount: 0,
      totalCount: 0,
    };

    current.name = current.name || row.name;
    current.rollNumber = current.rollNumber || row.rollNumber;

    if (row.hasPercentage && row.percentage > 0) {
      current.explicitPercentages.push(row.percentage);
    }

    if (!row.hasPercentage) {
      current.totalCount += 1;
      const normalizedStatus = row.status.trim().toLowerCase();
      if (normalizedStatus === 'present' || normalizedStatus === 'p' || normalizedStatus.includes('present')) {
        current.presentCount += 1;
      }
    }

    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .map((row) => {
      const explicitAverage = row.explicitPercentages.length
        ? Math.round(row.explicitPercentages.reduce((sum, value) => sum + value, 0) / row.explicitPercentages.length)
        : 0;
      const percentage = explicitAverage || (row.totalCount ? Math.round((row.presentCount / row.totalCount) * 100) : 0);
      return {
        name: row.name,
        rollNumber: row.rollNumber,
        percentage,
        statusLabel: percentage >= 75 ? 'Above threshold' : 'Below threshold',
      };
    })
    .sort((left, right) => right.percentage - left.percentage || left.name.localeCompare(right.name));
}

function BarGraph({ rows }: { rows: AnalyticsRow[] }) {
  const visibleRows = rows.slice(0, 8);
  const max = Math.max(100, ...visibleRows.map((row) => row.percentage));

  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-white">Attendance bar graph</h3>
      </div>

      <div className="space-y-4">
        {visibleRows.length ? (
          visibleRows.map((row) => {
            const width = Math.max(6, Math.round((row.percentage / max) * 100));
            const color = row.percentage >= 75 ? 'bg-emerald-400' : 'bg-rose-400';
            return (
              <div key={`${row.rollNumber}-${row.name}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white">{row.name}</span>
                  <span className={row.percentage >= 75 ? 'text-emerald-300' : 'text-rose-300'}>
                    {row.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${color}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            Upload a CSV file to render the bar graph.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvRows, setCsvRows] = useState<AnalyticsRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setRecords(filterVisibleAttendanceRecords(await getAttendanceRecords()));
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesFrom = dateFrom ? record.date >= dateFrom : true;
      const matchesTo = dateTo ? record.date <= dateTo : true;
      const matchesSearch = search
        ? record.name.toLowerCase().includes(search.toLowerCase()) ||
          (record.rollNumber || '').toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesFrom && matchesTo && matchesSearch;
    });
  }, [dateFrom, dateTo, records, search]);

  const presentCount = filteredRecords.filter((record) => record.status === 'Present').length;
  const absentCount = filteredRecords.filter((record) => record.status === 'Absent').length;
  const attendancePercent = filteredRecords.length
    ? Math.round((presentCount / filteredRecords.length) * 100)
    : 0;

  const eligibleRows = useMemo(
    () => csvRows.filter((row) => row.percentage >= threshold),
    [csvRows, threshold],
  );
  const belowRows = useMemo(
    () => csvRows.filter((row) => row.percentage < threshold),
    [csvRows, threshold],
  );

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setCsvRows(parseCsv(text));
    setCsvFileName(file.name);
  };

  const handleDownloadRecords = () => {
    if (!filteredRecords.length) return;

    const header = ['Date', 'Day', 'Name', 'Roll Number', 'Check-in Time', 'Status'];
    const rows = filteredRecords.map((record) => [
      record.date,
      record.day,
      record.name,
      record.rollNumber || '',
      record.checkinTime,
      record.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-records.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-xl">
              <FileText className="h-3.5 w-3.5" />
              Teacher analytics
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Analytics</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Upload a CSV export to compare attendance against a threshold. The parser now groups raw Present/Absent rows or summary rows, so percentages reflect the actual file content.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadRecords}
            disabled={!filteredRecords.length}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Download Records
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0 rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-white">Upload CSV</h2>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Supported columns: name, roll number, status rows, attendance percentage, or present/total counts.
          </p>

          <div className="mt-5 rounded-[1.5rem] border-2 border-dashed border-white/15 bg-white/5 p-4 sm:p-5">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
            />
            <p className="mt-3 text-xs text-slate-400">
              {csvFileName ? `Loaded: ${csvFileName}` : 'No CSV file uploaded yet.'}
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-200">
              Attendance threshold: {threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-cyan-600"
            />
            <p className="mt-2 text-xs text-slate-400">
              Students at or above this value show in green.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Eligible</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{eligibleRows.length}</p>
            </div>
            <div className="rounded-3xl border border-rose-400/15 bg-rose-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Below threshold</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{belowRows.length}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-white">Threshold list</h3>
          </div>
          <div className="space-y-2">
            {csvRows.length ? (
              csvRows.map((row) => {
                const isGreen = row.percentage >= threshold;
                return (
                  <div
                    key={`${row.rollNumber}-${row.name}`}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                      isGreen ? 'border border-emerald-400/15 bg-emerald-500/10 text-white' : 'border border-rose-400/15 bg-rose-500/10 text-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-xs opacity-75">{row.rollNumber || 'No roll number'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{row.percentage.toFixed(0)}%</p>
                      <p className="text-xs">{isGreen ? 'Above threshold' : 'Below threshold'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Upload a CSV to see the names listed in green and red.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Filter attendance records</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="sm:col-span-2 xl:col-span-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll number"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-white backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Records</p>
              <p className="mt-2 text-2xl font-semibold">{filteredRecords.length}</p>
            </div>
            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Present</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{presentCount}</p>
            </div>
            <div className="rounded-3xl border border-rose-400/15 bg-rose-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Absent</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{absentCount}</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-[1.75rem] border border-white/10">
            <table className="min-w-[44rem] w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Roll</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-300">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredRecords.length ? (
                  filteredRecords.map((record, index) => (
                    <tr key={`${record.name}-${index}`} className="transition hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-medium text-white">{record.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{record.rollNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{record.checkinTime}</td>
                      <td className="px-4 py-3">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-300">
                      No records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0">
          <BarGraph rows={csvRows} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-white">Attendance percent</h2>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Current filtered attendance stands at {attendancePercent}% based on the records loaded from Firebase.
        </p>
      </div>
    </div>
  );
}
