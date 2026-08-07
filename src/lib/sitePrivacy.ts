import type { AttendanceRecord, Student } from '../types';

const hiddenNameFragments = ['mohd aqab sami', 'mohd aqabsami', 'aban shami'];
const hiddenPhoneDigits = new Set(['8986392298']);

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function digitsOnly(value: string | undefined) {
  return (value || '').replace(/\D/g, '');
}

export function shouldHideStudent(student: Pick<Student, 'name' | 'phoneNumber'>) {
  const normalizedName = normalize(student.name);
  const normalizedPhone = digitsOnly(student.phoneNumber);

  return hiddenNameFragments.some((fragment) => normalizedName.includes(fragment)) || hiddenPhoneDigits.has(normalizedPhone);
}

export function filterVisibleStudents<T extends Pick<Student, 'name' | 'phoneNumber'>>(students: T[]) {
  return students.filter((student) => !shouldHideStudent(student));
}

export function filterVisibleAttendanceRecords(records: AttendanceRecord[]) {
  return records.filter((record) => {
    const normalizedName = normalize(record.name);
    return !hiddenNameFragments.some((fragment) => normalizedName.includes(fragment));
  });
}

export function filterVisibleNames(names: string[]) {
  return names.filter((name) => {
    const normalizedName = normalize(name);
    return !hiddenNameFragments.some((fragment) => normalizedName.includes(fragment));
  });
}
