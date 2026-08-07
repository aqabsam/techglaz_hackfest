import type { Student } from '../types';
import { firebaseDatabaseUrl } from '../lib/firebase';
import type { AttendanceRecord } from '../types';

export type TeacherCredentialRecord = {
  email?: string;
  password?: string;
  name?: string;
  className?: string;
  section?: string;
};

async function readJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${firebaseDatabaseUrl}/${path}.json`);
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

function extractTeacherCredential(record: unknown): TeacherCredentialRecord | null {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const candidate = record as TeacherCredentialRecord & Record<string, unknown>;
  if (typeof candidate.email === 'string' && typeof candidate.password === 'string') {
    return {
      email: candidate.email,
      password: candidate.password,
      name: typeof candidate.name === 'string' ? candidate.name : undefined,
      className: typeof candidate.className === 'string' ? candidate.className : undefined,
      section: typeof candidate.section === 'string' ? candidate.section : undefined,
    };
  }

  for (const nested of Object.values(candidate)) {
    if (nested && typeof nested === 'object') {
      const nestedCredential = extractTeacherCredential(nested);
      if (nestedCredential) {
        return nestedCredential;
      }
    }
  }

  return null;
}

export async function fetchTeacherCredentials(): Promise<TeacherCredentialRecord | null> {
  const root = await readJson<unknown>('');
  return extractTeacherCredential(root);
}

export async function saveTeacherCredentials(teacher: TeacherCredentialRecord): Promise<void> {
  const response = await fetch(`${firebaseDatabaseUrl}/teacherCredentials.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error(`Teacher profile save failed with ${response.status}`);
  }
}

export async function fetchRealtimeStudents(): Promise<Student[]> {
  const records = await readJson<Record<string, Partial<Student> & { photoUrl?: string | null }> | Array<Partial<Student> & { photoUrl?: string | null }>>('students');
  if (!records) {
    return [];
  }

  const values = Array.isArray(records) ? records : Object.values(records);
  return values.map(normalizeStudent).filter((student): student is Student => Boolean(student));
}

export async function saveRealtimeStudent(student: Student): Promise<void> {
  const response = await fetch(`${firebaseDatabaseUrl}/students/${student.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error(`Student save failed with ${response.status}`);
  }
}

export async function removeRealtimeStudent(id: string): Promise<void> {
  const response = await fetch(`${firebaseDatabaseUrl}/students/${id}.json`, {
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
  const root = await readJson<unknown>('');
  const records: AttendanceRecord[] = [];
  const seen = new Set<string>();
  collectAttendanceRecords(root, records, seen);
  return records;
}
