import type { Student, AttendanceRecord, DashboardStats, CameraConfig } from '../types';
import { fetchAttendanceRecords, fetchRealtimeStudents, removeRealtimeStudent, saveRealtimeStudent } from './realtimeDb';
import { firebaseDatabaseUrl } from '../lib/firebase';

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Unable to read photo file.'));
    reader.readAsDataURL(file);
  });
}

function ensureStudentFromFormData(formData: FormData, existing?: Student): Partial<Student> {
  return {
    id: existing?.id || crypto.randomUUID(),
    name: String(formData.get('name') || existing?.name || '').trim(),
    rollNumber: String(formData.get('rollNumber') || existing?.rollNumber || '').trim(),
    phoneNumber: String(formData.get('phoneNumber') || existing?.phoneNumber || '').trim(),
    photoUrl: existing?.photoUrl || '',
    photoFilename: existing?.photoFilename,
    createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10),
  };
}

async function readAttendanceRecords(): Promise<AttendanceRecord[]> {
  return fetchAttendanceRecords();
}

// Students API
export async function getStudents(): Promise<Student[]> {
  return fetchRealtimeStudents();
}

export async function addStudent(formData: FormData): Promise<Student> {
  const photo = formData.get('photo');
  const student = ensureStudentFromFormData(formData);

  if (photo instanceof File && photo.size > 0) {
    student.photoUrl = await fileToDataUrl(photo);
  }

  const normalized = student as Student;
  await saveRealtimeStudent(normalized);
  return normalized;
}

export async function updateStudent(id: string, formData: FormData): Promise<Student> {
  const existing = (await fetchRealtimeStudents()).find((student) => student.id === id);
  if (!existing) {
    throw new Error('Student not found.');
  }

  const photo = formData.get('photo');
  const student = ensureStudentFromFormData(formData, existing);

  if (photo instanceof File && photo.size > 0) {
    student.photoUrl = await fileToDataUrl(photo);
  }

  const normalized = { ...existing, ...student, id } as Student;
  await saveRealtimeStudent(normalized);
  return normalized;
}

export async function deleteStudent(id: string): Promise<void> {
  await removeRealtimeStudent(id);
}

type AttendanceStartResult = {
  success: boolean;
  message: string;
  mode: 'webcam' | 'ip_camera' | 'cctv';
  source?: string;
};

// Attendance API
export async function startAttendance(mode: 'webcam' | 'ip_camera' | 'cctv', source?: string): Promise<AttendanceStartResult> {
  return {
    success: false,
    message:
      'Live attendance needs the backend that was removed from this project. You can still manage students and view any attendance records already stored in Firebase.',
    mode,
    source,
  };
}

export async function stopAttendance(): Promise<{ success?: boolean; message?: string; excelUrl?: string }> {
  return {
    success: false,
    message: 'No backend attendance session is running.',
    excelUrl: '',
  };
}

export async function getAttendanceStatus(): Promise<{ running: boolean; present: string[]; absent: string[] }> {
  return { running: false, present: [], absent: [] };
}

// Reports API
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  return readAttendanceRecords();
}

export function getAttendanceExcelUrl(): string {
  return `${firebaseDatabaseUrl}`;
}

// Dashboard API
export async function getDashboardStats(): Promise<DashboardStats> {
  const [students, records] = await Promise.all([fetchRealtimeStudents(), readAttendanceRecords()]);
  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = records.filter(
    (record) => record.status.toLowerCase() === 'present' && (!record.date || record.date === today),
  ).length;

  return {
    totalStudents: students.length,
    activeCameras: 0,
    todayAttendance,
    totalAlerts: 0,
  };
}

// Cameras API
export async function getCameras(): Promise<CameraConfig[]> {
  return [];
}

export async function saveCameras(cameras: CameraConfig[]): Promise<void> {
  void cameras;
}
