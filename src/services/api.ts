import type { Student, AttendanceRecord, DashboardStats, CameraConfig, AttendanceSettings } from '../types';
import { API_BASE, withApiOrigin } from '../lib/apiBase';

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with ${response.status}`;

  try {
    const payload = (await response.json()) as ApiErrorPayload | null;
    return payload?.error || payload?.message || fallback;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json().catch(() => null)) as T;
}

async function requestVoid(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

async function requestStudent(formData: FormData, id?: string): Promise<Student> {
  const response = await fetch(`${API_BASE}/students${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as Student;
}

// Students API
export async function getStudents(): Promise<Student[]> {
  return requestJson<Student[]>('/students');
}

export async function addStudent(formData: FormData): Promise<Student> {
  return requestStudent(formData);
}

export async function updateStudent(id: string, formData: FormData): Promise<Student> {
  return requestStudent(formData, id);
}

export async function deleteStudent(id: string): Promise<void> {
  await requestVoid(`/students/${id}`, {
    method: 'DELETE',
  });
}

type AttendanceStartResult = {
  success: boolean;
  message: string;
  mode: 'webcam' | 'ip_camera' | 'cctv';
  source?: string;
  excelFile?: string;
};

// Attendance API
export async function startAttendance(mode: 'webcam' | 'ip_camera' | 'cctv', source?: string): Promise<AttendanceStartResult> {
  return requestJson<AttendanceStartResult>('/attendance/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      source,
      ipAddress: source,
    }),
  });
}

export async function stopAttendance(): Promise<{ success?: boolean; message?: string; excelUrl?: string }> {
  return requestJson<{ success?: boolean; message?: string; excelUrl?: string }>('/attendance/stop', {
    method: 'POST',
  });
}

export async function getAttendanceStatus(): Promise<{ running: boolean; present: string[]; absent: string[]; message?: string }> {
  return requestJson<{ running: boolean; present: string[]; absent: string[]; message?: string }>('/attendance/status');
}

// Reports API
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  return requestJson<AttendanceRecord[]>('/reports');
}

export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  return requestJson<AttendanceSettings>('/attendance/settings');
}

export async function updateAttendanceSettings(settings: AttendanceSettings): Promise<AttendanceSettings> {
  return requestJson<AttendanceSettings>('/attendance/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}

export async function markAttendanceDay(date: string, status: 'Holiday' | 'Sunday'): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>('/attendance/mark-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, status }),
  });
}

export function getAttendanceExcelUrl(): string {
  return withApiOrigin('/api/reports/excel');
}

// Dashboard API
export async function getDashboardStats(): Promise<DashboardStats> {
  return requestJson<DashboardStats>('/dashboard/stats');
}

// Cameras API
export async function getCameras(): Promise<CameraConfig[]> {
  return [];
}

export async function saveCameras(cameras: CameraConfig[]): Promise<void> {
  void cameras;
}
