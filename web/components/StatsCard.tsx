'use client';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'text-zinc-300',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
};

export function StatsCard({ label, value, unit, variant = 'default', icon }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className={variantStyles[variant]}>{icon}</span>}
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${variantStyles[variant]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
