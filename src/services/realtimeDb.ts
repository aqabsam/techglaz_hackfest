import type { Student } from '../types';
import { API_BASE } from '../lib/apiBase';
import type { AttendanceRecord } from '../types';

export type TeacherCredentialRecord = {
  email?: string;
  password?: string;
  name?: string;
  className?: string;
  section?: string;
};

async function readJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Teacher data request failed with ${response.status}`);
  }

  return (await response.json().catch(() => null)) as T | null;
}

function normalizeStudent(student: Partial<Student> & { photoUrl?: string | null }): Student | null {
  if (!student.id || !student.name || !student.rollNumber) {
    return null;
  }

  const photoUrl =
    student.photoUrl && (student.photoUrl.startsWith('http') || student.photoUrl.startsWith('data:'))
      ? student.photoUrl
      : '';

  return {
    id: student.id,
    name: student.name,
    rollNumber: student.rollNumber,
    phoneNumber: student.phoneNumber || '',
    photoUrl,
    photoFilename: student.photoFilename,
    createdAt: student.createdAt || '',
  };
}

export async function fetchTeacherCredentials(): Promise<TeacherCredentialRecord | null> {
  const credentials = await readJson<TeacherCredentialRecord>('/teacher-credentials');
  if (!credentials || typeof credentials !== 'object') {
    return null;
  }

  const candidate = credentials as TeacherCredentialRecord;
  if (!candidate.email && !candidate.password && !candidate.name && !candidate.className && !candidate.section) {
    return null;
  }

  return candidate;
}

export async function saveTeacherCredentials(teacher: TeacherCredentialRecord): Promise<void> {
  const response = await fetch(`${API_BASE}/teacher-credentials`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error(`Teacher profile save failed with ${response.status}`);
  }
}

export async function fetchRealtimeStudents(): Promise<Student[]> {
  const records = await readJson<Array<Partial<Student> & { photoUrl?: string | null }>>('/students');
  if (!records) {
    return [];
  }

  return records.map(normalizeStudent).filter((student): student is Student => Boolean(student));
}

export async function saveRealtimeStudent(student: Student): Promise<void> {
  const response = await fetch(`${API_BASE}/students/${student.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error(`Student save failed with ${response.status}`);
  }
}

export async function removeRealtimeStudent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Student delete failed with ${response.status}`);
  }
}

function normalizeAttendanceRecord(record: Partial<AttendanceRecord> & Record<string, unknown>): AttendanceRecord | null {
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const status = typeof record.status === 'string' ? record.status.trim() : '';

  if (!name || !status) {
    return null;
  }

  return {
    name,
    rollNumber: typeof record.rollNumber === 'string' ? record.rollNumber.trim() : '',
    checkinTime: typeof record.checkinTime === 'string' ? record.checkinTime.trim() : '',
    status,
    date: typeof record.date === 'string' ? record.date.trim() : '',
    day: typeof record.day === 'string' ? record.day.trim() : '',
  };
}

function collectAttendanceRecords(value: unknown, output: AttendanceRecord[], seen: Set<string>) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeAttendanceRecord((item || {}) as Record<string, unknown>);
      if (normalized) {
        const key = `${normalized.name}|${normalized.rollNumber}|${normalized.checkinTime}|${normalized.date}|${normalized.status}|${normalized.day}`;
        if (!seen.has(key)) {
          seen.add(key);
          output.push(normalized);
        }
      }
      collectAttendanceRecords(item, output, seen);
    }
    return;
  }

  const record = normalizeAttendanceRecord(value as Record<string, unknown>);
  if (record) {
    const key = `${record.name}|${record.rollNumber}|${record.checkinTime}|${record.date}|${record.status}|${record.day}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(record);
    }
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    collectAttendanceRecords(nested, output, seen);
  }
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const root = await readJson<unknown>('/reports');
  const records: AttendanceRecord[] = [];
  const seen = new Set<string>();
  collectAttendanceRecords(root, records, seen);
  return records;
}
