import { useMemo, useState, type ChangeEvent } from 'react';
import {
  FileText,
  PieChart,
  Upload,
  Users,
} from 'lucide-react';

type AnalyticsRow = {
  name: string;
  registrationNumber: string;
  rollNumber: string;
  percentage: number;
  percentageText: string;
  statusLabel: string;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function detectDelimiter(text: string) {
  const candidates = [',', ';', '\t', '|'];
  const sampleLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);

  let bestDelimiter = ',';
  let bestScore = -1;

  for (const delimiter of candidates) {
    let score = 0;
    for (const line of sampleLines) {
      const count = line.split(delimiter).length - 1;
      if (count > 0) {
        score += count;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

function splitDelimitedLine(line: string, delimiter: string) {
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

    if (char === delimiter && !inQuotes) {
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
  const cleaned = value.replace(/,/g, '').replace(/%/g, '').trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePercentageValue(value: string) {
  const cleaned = value.trim();
  if (!cleaned || /^(present|absent|p|a|yes|no|na|n\/a|none)$/i.test(cleaned)) return null;

  const numeric = toNumber(cleaned);
  if (!Number.isFinite(numeric) || numeric < 0) return null;

  if (!cleaned.includes('%') && numeric <= 1) {
    return Math.round(numeric * 100);
  }

  return Math.min(100, Math.round(numeric));
}

function formatPercentageLabel(row: Pick<AnalyticsRow, 'percentage' | 'percentageText'>) {
  const raw = row.percentageText.trim();
  if (!raw) {
    return `${row.percentage.toFixed(0)}%`;
  }

  if (raw.endsWith('%')) {
    return raw;
  }

  return `${raw}%`;
}

function isHeaderRow(cells: string[], normalizedHeaders: string[]) {
  const normalizedCells = cells.map(normalizeKey).filter(Boolean);
  if (!normalizedCells.length) return false;

  const matches = normalizedCells.filter((cell) => normalizedHeaders.includes(cell));
  return matches.length >= Math.max(2, Math.min(normalizedHeaders.length, 3));
}

function isAttendanceTableHeader(cells: string[]) {
  const normalizedCells = cells.map(normalizeKey);
  const hasName = normalizedCells.some((cell) => cell === 'name' || cell.includes('name'));
  const hasRoll = normalizedCells.some((cell) => cell === 'rollno' || cell === 'rollnumber' || cell === 'roll');
  const hasPercent = normalizedCells.some((cell) => cell === 'percent' || cell.includes('percent'));
  const hasTotal = normalizedCells.some((cell) => cell === 'total' || cell.includes('total'));
  return hasName && hasRoll && (hasPercent || hasTotal);
}

function isDataSummaryRow(cells: string[]) {
  const normalizedFirst = normalizeKey(cells[0] || '');
  const normalizedName = normalizeKey(cells[3] || '');
  if (normalizedFirst === '-' || normalizedName === '-') return true;
  if (/^legends?/.test(normalizedFirst)) return true;
  if (/^total/.test(normalizedFirst)) return true;
  return false;
}

function matchesHeader(rawHeader: string, normalizedHeader: string, keys: string[]) {
  const normalizedKeys = keys.map(normalizeKey).filter(Boolean);
  if (normalizedKeys.length === 0) {
    return keys.some((key) => rawHeader.trim().replace(/"/g, '') === key);
  }

  return normalizedKeys.some((key) => normalizedHeader === key || normalizedHeader.includes(key));
}

function parseCsv(text: string): AnalyticsRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(text);
  const headerLineIndex = lines.findIndex((line) => isAttendanceTableHeader(splitDelimitedLine(line, delimiter)));
  if (headerLineIndex === -1) return [];

  const rawHeaders = splitDelimitedLine(lines[headerLineIndex], delimiter);
  const headers = rawHeaders.map(normalizeKey);

  const pickIndex = (keys: string[]) =>
    headers.findIndex((header, index) => matchesHeader(rawHeaders[index] || '', header, keys));

  const registrationIndex = pickIndex(['regno', 'regnumber', 'registrationnumber', 'registrationno']);
  const nameIndex = pickIndex(['name', 'studentname', 'fullname', 'student']);
  const rollIndex = pickIndex(['rollnumber', 'rollno', 'roll', 'id']);
  const percentageIndex =
    pickIndex(['attendancepercentage', 'attendance', 'percentage', 'percent', 'score', 'marks']) !== -1
      ? pickIndex(['attendancepercentage', 'attendance', 'percentage', 'percent', 'score', 'marks'])
      : rawHeaders.findIndex((header) => header.trim() === '%');
  const normalizedHeaders = headers.filter(Boolean);

  type StudentAggregate = {
    name: string;
    registrationNumber: string;
    rollNumber: string;
    percentage: number;
    percentageText: string;
  };

  const grouped = new Map<string, StudentAggregate>();

  for (const line of lines.slice(headerLineIndex + 1)) {
    const cells = splitDelimitedLine(line, delimiter);
    if (isDataSummaryRow(cells)) {
      continue;
    }
    if (isHeaderRow(cells, normalizedHeaders)) {
      continue;
    }

    const name = (cells[nameIndex] || cells[0] || '').trim();
    const registrationNumber = (cells[registrationIndex] || '').trim();
    const rollNumber = (cells[rollIndex] || cells[1] || '').trim();
    if (!name && !rollNumber) {
      continue;
    }

    const trailingCell = cells[cells.length - 1] || '';
    const percentageCell = percentageIndex !== -1 ? cells[percentageIndex] || trailingCell : trailingCell;

    const explicitPercentage = percentageCell ? parsePercentageValue(percentageCell) : null;
    if (explicitPercentage === null) {
      continue;
    }

    const key = normalizeKey(rollNumber || name);
    const current = grouped.get(key) || {
      name,
      registrationNumber,
      rollNumber,
      percentage: explicitPercentage,
      percentageText: percentageCell,
    };

    current.name = current.name || name;
    current.registrationNumber = current.registrationNumber || registrationNumber;
    current.rollNumber = current.rollNumber || rollNumber;
    current.percentage = explicitPercentage;
    current.percentageText = current.percentageText || percentageCell;

    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .map((row) => ({
      name: row.name,
      registrationNumber: row.registrationNumber,
      rollNumber: row.rollNumber,
      percentage: row.percentage,
      percentageText: row.percentageText,
      statusLabel: 'Unknown',
    }))
    .sort((left, right) => right.percentage - left.percentage || left.name.localeCompare(right.name));
}

function PieChartCard({ rows, threshold }: { rows: AnalyticsRow[]; threshold: number }) {
  const eligibleCount = rows.filter((row) => row.percentage >= threshold).length;
  const notEligibleCount = rows.length - eligibleCount;
  const total = rows.length;
  const eligiblePercent = total ? (eligibleCount / total) * 100 : 0;
  const notEligiblePercent = total ? (notEligibleCount / total) * 100 : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const eligibleStroke = (eligiblePercent / 100) * circumference;
  const notEligibleStroke = (notEligiblePercent / 100) * circumference;

  return (
    <div className="w-full rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-5 lg:p-6">
      <div className="mb-5 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-cyan-600" />
        <h3 className="text-base font-semibold text-white sm:text-lg">Attendance pie chart</h3>
      </div>

      <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto flex w-full max-w-[220px] items-center justify-center sm:max-w-[260px] md:max-w-[280px] lg:max-w-none">
          {total ? (
            <div className="relative w-full max-w-[280px] aspect-square">
              <svg viewBox="0 0 140 140" className="h-full w-full rotate-[-90deg]">
                <circle cx="70" cy="70" r={radius} className="fill-none stroke-white/10" strokeWidth="18" />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="fill-none stroke-emerald-400"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={`${eligibleStroke} ${circumference - eligibleStroke}`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="fill-none stroke-rose-400"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={`${notEligibleStroke} ${circumference - notEligibleStroke}`}
                  strokeDashoffset={-eligibleStroke}
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{total}</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-300 sm:text-[11px]">
                  Students
                </span>
              </div>
            </div>
          ) : (
            <p className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-300">
              Upload a CSV file to render the pie chart.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Eligible</p>
                <p className="mt-1 text-base font-medium text-white sm:text-lg">At or above threshold</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-emerald-300 sm:text-2xl">
                  {eligibleCount}{' '}
                  <span className="text-sm font-medium text-emerald-200 sm:text-base">({eligiblePercent.toFixed(0)}%)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Not eligible</p>
                <p className="mt-1 text-base font-medium text-white sm:text-lg">Below threshold</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-rose-300 sm:text-2xl">
                  {notEligibleCount}{' '}
                  <span className="text-sm font-medium text-rose-200 sm:text-base">({notEligiblePercent.toFixed(0)}%)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <span className="w-full rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200">
              Eligible: {threshold}% and above
            </span>
            <span className="w-full rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-center text-xs font-semibold text-rose-200">
              Not eligible: below {threshold}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2 text-xs text-slate-300 sm:text-sm">
        {total ? (
          <p>
            Pie chart shows the share of students who meet the threshold versus those who do not, using the uploaded CSV percentages.
          </p>
        ) : (
          <p>Upload a CSV file to render the pie chart.</p>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const [csvRows, setCsvRows] = useState<AnalyticsRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [threshold, setThreshold] = useState(75);

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
              Upload a CSV export and the analysis will use only the data inside that file. It reads the uploaded student rows, pulls the registration number and percentage, and compares them to the threshold.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0 rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-white">Upload CSV</h2>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Supported columns: `Name` and `%`.
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
            <h3 className="text-lg font-semibold text-white">Uploaded CSV data</h3>
          </div>
          <div className="space-y-3 md:hidden">
            {csvRows.length ? (
              csvRows.map((row) => {
                const isEligible = row.percentage >= threshold;
                return (
                  <div
                    key={`${row.registrationNumber || row.rollNumber}-${row.name}`}
                    className={`rounded-2xl border p-4 ${isEligible ? 'border-emerald-400/15 bg-emerald-500/10' : 'border-rose-400/15 bg-rose-500/10'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isEligible ? 'text-emerald-300' : 'text-rose-300'}`}>{row.percentageText || `${row.percentage.toFixed(0)}%`}</p>
                        <p className="text-[11px] text-slate-300">{isEligible ? 'Eligible' : 'Not eligible'}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-300">
                Upload a CSV to see the imported student data here.
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 hidden md:block">
            <table className="min-w-[28rem] w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">%</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {csvRows.length ? (
                  csvRows.map((row) => (
                    <tr key={`${row.registrationNumber || row.rollNumber}-${row.name}`} className="transition hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-medium text-white">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-emerald-300">{formatPercentageLabel(row)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.percentage >= threshold
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {row.percentage >= threshold ? 'Eligible' : 'Not eligible'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-300">
                      Upload a CSV to see the imported student data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <PieChartCard rows={csvRows} threshold={threshold} />
      </div>
    </div>
  );
}
