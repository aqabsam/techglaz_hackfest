import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18)_0%,_rgba(15,23,42,0.94)_42%,_rgba(2,6,23,1)_100%)]">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72 pt-16">
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[96rem] p-3 sm:p-4 lg:p-6 xl:px-8">
          <Outlet />
          <footer className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-300 backdrop-blur-xl sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>TechGlaz Fest keeps attendance controls, analytics, and student records in one place.</p>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <span>Mobile friendly</span>
                <span>TechGlaz Fest roster sync</span>
                <span>Excel export</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
