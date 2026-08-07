import { getStudents } from '../services/api';
import { filterVisibleStudents } from './sitePrivacy';
import type { Student } from '../types';

export async function loadMergedStudentRoster(): Promise<Student[]> {
  const students = await getStudents().catch(() => []);
  return filterVisibleStudents(students);
}
