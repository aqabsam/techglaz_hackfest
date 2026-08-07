import { useEffect, useMemo, useRef, useState } from 'react';
import { Fingerprint, IdCard, Pencil, Plus, Search, Trash2, Upload, User, Users } from 'lucide-react';
import Modal from '../components/auth/common/Modal';
import { addStudent, deleteStudent, updateStudent } from '../services/api';
import { loadMergedStudentRoster } from '../lib/studentRoster';
import type { Student } from '../types';

const emptyForm = { name: '', rollNumber: '', phoneNumber: '', photo: null as File | null };

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudents(await loadMergedStudentRoster());
      } catch {
        setError('Unable to load students right now.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
          (student.phoneNumber || '').toLowerCase().includes(search.toLowerCase()),
      ),
    [search, students],
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, photo: null }));
      setPhotoPreview('');
      return;
    }

    setForm((current) => ({ ...current, photo: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setPhotoPreview('');
    setShowModal(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      rollNumber: student.rollNumber,
      phoneNumber: student.phoneNumber || '',
      photo: null,
    });
    setPhotoPreview(student.photoUrl || '');
    setShowModal(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoPreview('');
    setEditingStudent(null);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveStudent = async () => {
    if (!form.name || !form.rollNumber || (!editingStudent && !form.photo)) return;

    setSaving(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('rollNumber', form.rollNumber);
      payload.append('phoneNumber', form.phoneNumber);
      if (form.photo) {
        payload.append('photo', form.photo);
      }

      const student = editingStudent ? await updateStudent(editingStudent.id, payload) : await addStudent(payload);
      setStudents((current) =>
        editingStudent ? current.map((item) => (item.id === student.id ? student : item)) : [student, ...current],
      );
      resetForm();
    } catch {
      setError(editingStudent ? 'Failed to update student. Please try again.' : 'Failed to add student. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      setStudents((current) => current.filter((student) => student.id !== id));
    } catch {
      setError('Could not delete that student.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-xl">
              <Users className="h-3.5 w-3.5" />
              TechGlaz Fest student roster
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Students</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Add students with name, roll number, phone number, and image. Their photo is saved for face recognition and attendance matching.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-white backdrop-blur-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <Users className="h-5 w-5 text-cyan-200" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Students</p>
            <p className="mt-3 text-3xl font-semibold">{students.length}</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/10 p-4 text-white backdrop-blur-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20">
              <Fingerprint className="h-5 w-5 text-cyan-100" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Roster Sync</p>
            <p className="mt-3 text-2xl font-semibold">Teacher entries</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-white backdrop-blur-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20">
              <IdCard className="h-5 w-5 text-emerald-100" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Searchable Data</p>
            <p className="mt-3 text-2xl font-semibold">Name, Roll, Phone</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or phone number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-300" />
            <span className="text-sm font-medium text-white">Student roster</span>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-300">
              Loading students...
            </div>
          ) : filteredStudents.length ? (
            filteredStudents.map((student) => (
              <div key={student.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{student.name}</p>
                    <p className="mt-1 text-sm text-slate-300">Roll No. {student.rollNumber}</p>
                    <p className="mt-1 text-sm text-slate-300">{student.phoneNumber || '-'}</p>
                    <p className="mt-1 text-xs text-slate-400">Added on {student.createdAt}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openEditModal(student)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-300"
                      aria-label={`Edit ${student.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                      aria-label={`Delete ${student.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-300">
              No students found
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[52rem] w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Roll No.</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Added On</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-300">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 text-sm font-semibold text-white">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{student.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{student.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-300"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                          aria-label={`Delete ${student.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-300">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center">
            <button
              type="button"
              className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/15 bg-white/5 transition hover:border-cyan-400"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Selected student photo" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-300 transition group-hover:text-cyan-300" />
                  <p className="mt-2 text-xs text-slate-400">Attach student photo</p>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              {editingStudent ? 'Replace the attached photo or leave it as-is.' : 'Upload a clear front-facing photo for attendance matching.'}
            </p>
            {form.photo && (
              <p className="mt-1 text-center text-xs font-medium text-cyan-200">Selected: {form.photo.name}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Full Name</label>
              <input
                type="text"
                placeholder="Enter student name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Roll Number</label>
              <input
                type="text"
                placeholder="2024001"
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStudent}
              disabled={saving || !form.name || !form.rollNumber || (!editingStudent && !form.photo)}
              className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
