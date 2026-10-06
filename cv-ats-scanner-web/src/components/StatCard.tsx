interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export function StatCard({
  label,
  value,
  valueColor = 'text-navy',
}: StatCardProps) {
  return (
    <div className="group app-card app-card-hover relative overflow-hidden p-4">
      <div className="absolute right-0 top-0 h-16 w-16 translate-x-5 -translate-y-5 rounded-full bg-[#a98268]/5 transition-transform duration-300 group-hover:scale-125" />

      <div className="relative">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
          {label}
        </p>

        <p className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}