import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Download, Monitor, Play, Square, Smartphone, Users, Wifi, WifiOff, CircleAlert } from 'lucide-react';
import Modal from '../components/auth/common/Modal';
import { getAttendanceStatus, startAttendance, stopAttendance } from '../services/api';
import { filterVisibleNames } from '../lib/sitePrivacy';
import { loadMergedStudentRoster } from '../lib/studentRoster';
import type { Student } from '../types';

type CameraMode = 'webcam' | 'ip_camera' | 'cctv' | null;

export default function LiveCCTV() {
  const [mode, setMode] = useState<CameraMode>(null);
  const [source, setSource] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rosterStudents, setRosterStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showStopDialog, setShowStopDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  useEffect(() => {
    const loadRoster = async () => {
      try {
        const roster = await loadMergedStudentRoster();
        setStudents(roster);
        setRosterStudents(roster);
      } catch {
        setStudents([]);
        setRosterStudents([]);
      }
    };

    loadRoster();
  }, []);

  useEffect(() => {
    const stopPreview = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (mode !== 'webcam') {
      stopPreview();
      return undefined;
    }

    let cancelled = false;

    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'user' },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setError('Front camera preview could not start. Check camera permissions in your browser.');
      }
    };

    startPreview();

    return () => {
      cancelled = true;
      stopPreview();
    };
  }, [mode]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (!isRunning) return;
      try {
        const status = await getAttendanceStatus();
        setPresentStudents(filterVisibleNames(status.present));
        setAbsentStudents(filterVisibleNames(status.absent));
      } catch {
        // ignore live polling failures
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const currentModeLabel = useMemo(() => {
    if (mode === 'webcam') return 'Front camera webcam';
    if (mode === 'ip_camera') return 'IP camera';
    if (mode === 'cctv') return 'CCTV RTSP';
    return '';
  }, [mode]);

  const handleStart = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await startAttendance(mode || 'webcam', source);
      setMessage(result.message || 'Attendance started');
      await delay(1500);
      const status = await getAttendanceStatus();

      if (!status.running) {
        setIsRunning(false);
        setError(result.message || 'Live attendance is unavailable in this frontend-only build.');
        return;
      }

      setIsRunning(true);
      setPresentStudents(filterVisibleNames(status.present));
      setAbsentStudents(filterVisibleNames(status.absent));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await stopAttendance();
      setIsRunning(false);
      setMode(null);
      setMessage(result.message || 'Attendance stopped');
      setShowStopDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to stop attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    setError('Attendance export is unavailable without the backend.');
  };

  const rosterCards = useMemo(() => rosterStudents.slice(0, 8), [rosterStudents]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-xl">
              <CircleAlert className="h-3.5 w-3.5" />
              Live output screen
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Live CCTV Attendance</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use the front webcam preview to confirm your device camera. Live recognition was previously handled by the backend and is no longer part of this frontend-only build.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/55 px-5 py-4 text-white backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
            <p className="mt-2 text-lg font-semibold">{currentModeLabel || 'Not selected'}</p>
            <p className="text-sm text-slate-400">Backend-free preview only</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!isRunning && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <button
            onClick={() => setMode('webcam')}
            className={`rounded-[1.75rem] border p-5 text-left shadow-lg transition sm:p-6 ${
              mode === 'webcam'
                ? 'border-cyan-400/30 bg-cyan-500/10 shadow-cyan-500/10'
                : 'border-white/15 bg-white/10 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl'
            }`}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Monitor className="h-7 w-7 text-cyan-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Device Webcam</h3>
            <p className="mt-2 text-sm text-slate-300">Use the front-facing camera on this laptop or an attached USB webcam.</p>
          </button>

          <button
            onClick={() => setMode('ip_camera')}
            className={`rounded-[1.75rem] border p-5 text-left shadow-lg transition sm:p-6 ${
              mode === 'ip_camera'
                ? 'border-blue-400/30 bg-blue-500/10 shadow-blue-500/10'
                : 'border-white/15 bg-white/10 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl'
            }`}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <Smartphone className="h-7 w-7 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Phone IP Camera</h3>
            <p className="mt-2 text-sm text-slate-300">Enter the IP Webcam URL from your phone or mobile camera app.</p>
          </button>

          <button
            onClick={() => setMode('cctv')}
            className={`rounded-[1.75rem] border p-5 text-left shadow-lg transition sm:p-6 ${
              mode === 'cctv'
                ? 'border-emerald-400/30 bg-emerald-500/10 shadow-emerald-500/10'
                : 'border-white/15 bg-white/10 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl'
            }`}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Camera className="h-7 w-7 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">CCTV RTSP</h3>
            <p className="mt-2 text-sm text-slate-300">Paste your CCTV RTSP or HTTP stream and begin recognition.</p>
          </button>
        </div>
      )}

      {!isRunning && mode && (
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
          <h3 className="text-lg font-semibold text-white">
            {mode === 'webcam' ? 'Camera ready' : 'Enter camera source'}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {mode === 'webcam'
              ? 'The browser preview shows your front camera only. Attendance processing is disabled without the backend.'
              : 'Paste the live stream address and start attendance.'}
          </p>

          {mode !== 'webcam' && (
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                {mode === 'ip_camera' ? 'IP Webcam URL' : 'CCTV RTSP URL'}
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder={mode === 'ip_camera' ? 'http://192.168.1.100:4747/video' : 'rtsp://admin:password@192.168.1.10:554/stream1'}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleStart}
                  disabled={loading || (mode !== 'webcam' && !source)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play className="h-5 w-5" />
                  {loading ? 'Starting...' : mode === 'webcam' ? 'Preview Camera' : 'Start Attendance'}
                </button>
            <button
              onClick={() => setMode(null)}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Attendance running
                </div>
                <span className="text-sm text-slate-300">{currentModeLabel}</span>
                {source && <span className="text-sm text-slate-400">{source}</span>}
              </div>

          <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleStop}
                  disabled={loading}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/15">
                    <Square className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span>{loading ? 'Stopping...' : 'Stop Camera'}</span>
                    <span className="text-[11px] font-normal text-rose-100/90">Finish the session and review export options</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/15"
                >
                  <Download className="h-4 w-4" />
                  Download Records
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-3 shadow-2xl shadow-slate-900/20 sm:p-4">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_rgba(15,23,42,1)_60%)]">
                {mode === 'webcam' ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="aspect-video h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
                      Front camera preview
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-200 backdrop-blur">
                      Front camera is visible here so you can confirm permissions and framing before adding attendance support again.
                    </div>
                  </>
                ) : (
                  <div className="flex aspect-video items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto h-16 w-16 text-cyan-300/80" />
                      <p className="mt-4 text-sm text-slate-200">Camera feed preview is available only for the local webcam</p>
                      <p className="mt-2 text-xs text-slate-400">Recognition uses only the students stored in your roster</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-emerald-400/15 bg-white/10 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-white">Present ({presentStudents.length})</h3>
                </div>
                <div className="space-y-2">
                  {presentStudents.length ? (
                    presentStudents.map((name) => (
                      <div key={name} className="rounded-2xl border border-emerald-400/10 bg-emerald-500/10 px-3 py-2 text-sm text-slate-200">
                        {name}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">No one has been recognized yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-rose-400/15 bg-white/10 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-rose-600" />
                  <h3 className="text-sm font-semibold text-white">Absent ({absentStudents.length})</h3>
                </div>
                <div className="space-y-2">
                  {absentStudents.length ? (
                    absentStudents.map((name) => (
                      <div key={name} className="rounded-2xl border border-rose-400/10 bg-rose-500/10 px-3 py-2 text-sm text-slate-200">
                        {name}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">
                      Absent list will appear once students are loaded and attendance starts.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Roster source</p>
                <p className="mt-2 text-sm font-medium text-white">{students.length} students in roster</p>
                <p className="mt-1 text-sm text-slate-300">
                  Add student records in Students so the roster stays in sync with Firebase.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-600" />
                  <h3 className="text-sm font-semibold text-white">Realtime roster</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {rosterCards.length ? (
                    rosterCards.map((student) => (
                      <div key={student.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{student.name}</p>
                          <p className="truncate text-xs text-slate-400">Roll no. {student.rollNumber}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">
                      Student records will appear here after syncing from the TechGlaz Fest roster.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        title="Attendance stopped"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-300">
            The session has been stopped. Choose whether to download the Excel report or return to the page without downloading yet.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </button>
            <button
              onClick={() => setShowStopDialog(false)}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Return to page
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
