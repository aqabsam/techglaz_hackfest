import { useState } from 'react';
import { Save, Plus, Trash2, Settings2, CircleCheckBig, Camera, Activity, Radio, Zap, MonitorPlay } from 'lucide-react';
import type { CameraConfig } from '../types';

export default function Admin() {
  const [cameras, setCameras] = useState<CameraConfig[]>([
    { id: '1', name: 'Main Webcam', ipAddress: '0 (built-in)', type: 'webcam', status: 'active' },
    { id: '2', name: 'Phone Camera', ipAddress: 'http://192.168.1.100:4747/video', type: 'ip_camera', status: 'inactive' },
    { id: '3', name: 'CCTV Hall A', ipAddress: 'rtsp://admin:pass@192.168.1.50:554/stream1', type: 'cctv', status: 'active' },
  ]);

  const [newCamera, setNewCamera] = useState({ name: '', ipAddress: '', type: 'ip_camera' as CameraConfig['type'] });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCamera = () => {
    if (!newCamera.name || !newCamera.ipAddress) return;
    const camera: CameraConfig = {
      id: Date.now().toString(),
      name: newCamera.name,
      ipAddress: newCamera.ipAddress,
      type: newCamera.type,
      status: 'inactive',
    };
    setCameras([...cameras, camera]);
    setNewCamera({ name: '', ipAddress: '', type: 'ip_camera' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setCameras(cameras.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-xl">
              <Settings2 className="h-3.5 w-3.5" />
              Admin portal
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">System settings</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Manage camera sources, auto-start behavior, and attendance system configuration from one clean control panel.
            </p>
          </div>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 sm:w-auto">
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-white backdrop-blur-xl">
            <div className="flex items-center gap-2 text-cyan-200">
              <Camera className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.2em]">Sources</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{cameras.length}</p>
            <p className="mt-1 text-sm text-slate-400">Configured input sources</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-white backdrop-blur-xl">
            <div className="flex items-center gap-2 text-emerald-200">
              <Activity className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.2em]">Active</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{cameras.filter((camera) => camera.status === 'active').length}</p>
            <p className="mt-1 text-sm text-emerald-100/80">Live and ready</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/10 p-4 text-white backdrop-blur-xl">
            <div className="flex items-center gap-2 text-cyan-100">
              <Zap className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.2em]">Mode</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">CCTV</p>
            <p className="mt-1 text-sm text-cyan-100/80">Webcam, IP, and RTSP support</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                  <MonitorPlay className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Camera configuration</h2>
                  <p className="text-sm text-slate-300">Manage connected cameras and sources</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Camera
              </button>
            </div>

            {showAddForm && (
              <div className="mb-5 rounded-[1.5rem] border border-cyan-400/15 bg-cyan-500/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
                  <input
                    type="text"
                    placeholder="Camera name"
                    value={newCamera.name}
                    onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <input
                    type="text"
                    placeholder="IP Address or RTSP URL"
                    value={newCamera.ipAddress}
                    onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <select
                    value={newCamera.type}
                    onChange={(e) => setNewCamera({ ...newCamera, type: e.target.value as CameraConfig['type'] })}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="ip_camera">IP Camera</option>
                    <option value="webcam">Webcam</option>
                    <option value="cctv">CCTV</option>
                  </select>
                  <button
                    onClick={handleAddCamera}
                    className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  className="flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                      {camera.type === 'cctv' ? <Radio className="h-5 w-5 text-cyan-300" /> : <Camera className="h-5 w-5 text-cyan-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{camera.name}</p>
                      <p className="text-xs text-slate-300">{camera.ipAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
                      {camera.type}
                    </span>
                    <button
                      onClick={() => handleDelete(camera.id)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <CircleCheckBig className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">System settings</h2>
                <p className="text-sm text-slate-300">Quick toggles for teacher workflow</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-medium text-white">Auto-start on login</p>
                  <p className="text-xs text-slate-300">Begin attendance on system start</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-cyan-600 peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-medium text-white">Email notifications</p>
                  <p className="text-xs text-slate-300">Get alerts for absences</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-cyan-600 peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-sm font-medium text-white">Confidence threshold</p>
                <input type="range" min="0.3" max="0.7" step="0.05" defaultValue="0.5" className="w-full accent-cyan-600" />
                <p className="mt-2 text-xs text-slate-300">Current: 0.5 (default)</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-4 text-white shadow-2xl shadow-slate-900/20 backdrop-blur-xl sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Quick note</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use this workspace to keep camera sources organized, verify attendance flow readiness, and manage the core classroom setup from one place.
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              Recommended: keep at least one active source ready before starting a session.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
