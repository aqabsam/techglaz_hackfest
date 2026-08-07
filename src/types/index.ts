export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  phoneNumber?: string;
  photoUrl: string;
  photoFilename?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  name: string;
  rollNumber?: string;
  checkinTime: string;
  status: string;
  date: string;
  day: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeCameras: number;
  todayAttendance: number;
  totalAlerts: number;
}

export interface CameraConfig {
  id: string;
  name: string;
  ipAddress: string;
  type: 'webcam' | 'ip_camera' | 'cctv';
  status: 'active' | 'inactive' | 'error';
}
