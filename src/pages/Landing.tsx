import { useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CloudCog,
  FileSpreadsheet,
  Fingerprint,
  Menu,
  Shield,
  Sparkles,
  Users,
  UserCheck,
  GraduationCap,
  X,
} from 'lucide-react';

const featureCards = [
  {
    icon: Fingerprint,
    title: 'Attendance matching',
    description: 'Student roster records help recognition run during each classroom session.',
  },
  {
    icon: Shield,
    title: 'Secure sign-in',
    description: 'Teacher access is locked to your approved email and TechGlaz Fest profile.',
  },
  {
    icon: Camera,
    title: 'Webcam and CCTV',
    description: 'Use local webcam, phone IP camera, or RTSP CCTV streams from the same dashboard.',
  },
  {
    icon: Users,
    title: 'Student profiles',
    description: 'Store name, roll number, phone number, and attendance-ready roster details.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel export',
    description: 'Stop attendance and download the live report as a formatted Excel file instantly.',
  },
  {
    icon: CloudCog,
    title: 'Modern workflow',
    description: 'Clean admin pages, polished output screens, and Firebase-backed roster sync.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create roster',
    description: 'Add each student once with name, roll number, and phone number.',
  },
  {
    step: '02',
    title: 'Start camera',
    description: 'Choose webcam, IP webcam, or CCTV RTSP and start live face detection.',
  },
  {
    step: '03',
    title: 'Export records',
    description: 'Stop the session to produce the Excel attendance sheet for the day.',
  },
];

const portalCards = [
  {
    title: 'Teacher Portal',
    description:
      'Teacher login, student registration, live dashboard, analytics, and Firebase roster management.',
    href: '/login',
    icon: UserCheck,
    accent: 'from-slate-950/85 via-cyan-950/55 to-indigo-950/55',
    badge: 'Teacher login',
  },
  {
    title: 'Student Portal',
    description:
      'Student login using name and roll number to view personal attendance history and today’s status.',
    href: '/student',
    icon: GraduationCap,
    accent: 'from-emerald-950/80 via-cyan-950/45 to-teal-950/55',
    badge: 'Student login',
  },
];

function GlassCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/15 hover:shadow-[0_28px_90px_-32px_rgba(14,165,233,0.45)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-300/20 transition group-hover:scale-105">
        <Icon className="h-6 w-6 text-cyan-200" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div id="top" className="min-h-screen overflow-hidden bg-[#06111e] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[22rem] w-[22rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.2),rgba(7,17,31,0.9))]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),transparent_28%,rgba(34,211,238,0.05)_72%,transparent)]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Fingerprint className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">TechGlaz Fest</p>
              <p className="text-[11px] text-slate-300">CCTV attendance for classrooms</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="#top"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 md:inline-flex"
            >
              Home
            </a>
            <a
              href="#features"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 md:inline-flex"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 md:inline-flex"
            >
              How it works
            </a>
            <a
              href="#portals"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 md:inline-flex"
            >
              Portals
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex items-center justify-center rounded-full border border-white/15 p-2 text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 sm:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link
              to="/login"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-cyan-300/40 hover:bg-white/10 sm:inline-flex"
            >
              Teacher Portal
            </Link>
            <Link
              to="/student"
              className="hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 sm:inline-flex"
            >
              Student Portal
            </Link>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-950/90 px-4 py-4 sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <a
                href="#top"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                How it works
              </a>
              <a
                href="#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Portals
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Teacher Portal
              </Link>
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25"
              >
                Student Portal
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="relative pt-24">
        <section className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
                <BadgeCheck className="h-4 w-4" />
                Live attendance made modern
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
                  TechGlaz Fest for
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent">
                    modern attendance management
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Track students with webcam or CCTV recognition, manage student records, and export clean Excel attendance reports from one focused platform.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  Teacher Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Features
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ['TechGlaz Fest profile', 'Teacher login'],
                  ['Realtime roster', 'Live attendance'],
                  ['Excel export', 'One-click report'],
                ].map(([title, subtitle]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full min-w-0">
              <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-cyan-400/30 blur-2xl" />
              <div className="absolute -right-8 bottom-12 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_120px_-35px_rgba(14,165,233,0.5)] backdrop-blur-2xl sm:p-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/85 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live feed</p>
                      <p className="mt-1 text-lg font-semibold text-white">Attendance output screen</p>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                      Active
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm font-medium text-white">Present students</p>
                      </div>
                      <p className="mt-3 text-3xl font-semibold text-cyan-200">24</p>
                  <p className="mt-1 text-sm text-slate-400">Recognized from your student roster</p>
                    </div>

                    <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                        <p className="text-sm font-medium text-white">CCTV stream</p>
                      </div>
                      <p className="mt-3 text-3xl font-semibold text-cyan-200">Live</p>
                      <p className="mt-1 text-sm text-slate-400">Webcam, IP, and CCTV supported</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Export</p>
                    <p className="mt-2 text-sm text-white">
                      Stop the session to generate the Excel attendance sheet automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="portals" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Choose a portal</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start with the right screen for the right person
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Teacher portal for registration and roster control. Student portal for exact name-and-roll login and attendance history.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {portalCards.map((portal) => (
                <Link
                  key={portal.title}
                  to={portal.href}
                  className={`group rounded-[1.9rem] border border-white/10 bg-gradient-to-br ${portal.accent} p-6 shadow-[0_24px_90px_-35px_rgba(14,165,233,0.35)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                      <portal.icon className="h-7 w-7 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-white/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </div>
                  <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    {portal.badge}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{portal.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">{portal.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built to feel fast, clear, and classroom-ready
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <GlassCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl sm:p-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Three simple steps from setup to Excel export
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/15 hover:shadow-[0_28px_90px_-32px_rgba(14,165,233,0.45)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/25">
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-white/10 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20 p-8 shadow-[0_30px_100px_-40px_rgba(14,165,233,0.5)] backdrop-blur-2xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100">Ready to begin</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Open the attendance dashboard and start your first session
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Teacher login now uses your TechGlaz Fest account, and the rest of the dashboard stays on Firebase for roster data.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-slate-950/75 px-4 py-10 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">TechGlaz Fest</p>
                <p className="text-sm text-slate-400">Modern CCTV attendance system</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              TechGlaz Fest keeps teacher sign-in, student management, and live attendance tools in one polished dashboard built for phones and desktops.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quick links</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {[
                ['Teacher Portal', '/login'],
                ['Student Portal', '/student'],
                ['Live CCTV', '/login'],
                ['Attendance reports', '/login'],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="w-fit rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Support</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Teacher login: TechGlaz Fest account</p>
              <p>Attendance export: Excel report on stop</p>
              <p>Camera modes: Webcam, IP camera, CCTV</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 TechGlaz Fest. Built for classroom attendance.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a className="transition hover:text-cyan-200" href="/login">
              Sign in
            </a>
            <a className="transition hover:text-cyan-200" href="/student">
              Student portal
            </a>
            <a className="transition hover:text-cyan-200" href="#features">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
