import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-300',
    ring: 'ring-cyan-400/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-300',
    ring: 'ring-emerald-400/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-300',
    ring: 'ring-amber-400/20',
  },
  purple: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-300',
    ring: 'ring-violet-400/20',
  },
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_24px_80px_-35px_rgba(2,6,23,0.45)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/15 hover:shadow-[0_24px_80px_-30px_rgba(14,165,233,0.28)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 sm:h-14 sm:w-14 ${colors.bg} ${colors.icon} ${colors.ring}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        {trend && (
          <span
            className={`inline-flex max-w-full self-start text-xs font-medium px-2 py-1 rounded-full sm:self-auto ${
              trendUp
                ? 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/20'
                : 'bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/20'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-white sm:text-3xl">{value}</h3>
        <p className="mt-1 text-sm text-slate-300">{title}</p>
      </div>
    </div>
  );
}
