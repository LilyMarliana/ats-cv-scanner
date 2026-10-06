import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CloudUpload,
  Briefcase,
  History,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';

const menuItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/upload',
    label: 'Bulk upload',
    icon: CloudUpload,
  },
  {
    to: '/positions',
    label: 'Positions',
    icon: Briefcase,
  },
  {
    to: '/history',
    label: 'CV history',
    icon: History,
  },
  {
    to: '/compare',
    label: 'Compare CV',
    icon: ArrowLeftRight,
  },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[#e5e4de] bg-[#f1f0eb]/95 px-4 py-5 backdrop-blur-xl">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <Sparkles size={17} strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight text-navy">
              ATS Scanner
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              CV intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a39e]">
          Workspace
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
                  'text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white text-navy shadow-[0_2px_10px_rgba(57,66,61,0.06)]'
                    : 'text-text-secondary hover:bg-white/70 hover:text-navy',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-gold opacity-100'
                        : 'bg-transparent opacity-0',
                    ].join(' ')}
                  />

                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={[
                      'shrink-0 transition-transform duration-200',
                      isActive
                        ? 'text-navy'
                        : 'text-text-secondary group-hover:text-navy',
                    ].join(' ')}
                  />

                  <span
                    className={
                      isActive ? 'font-medium text-navy' : 'font-normal'
                    }
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto">
        <div className="rounded-2xl border border-[#e3e1da] bg-white/70 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4f0]">
              <Sparkles size={13} className="text-success" />
            </div>

            <div>
              <p className="text-xs font-medium text-navy">AI Ready</p>
              <p className="text-[10px] text-text-secondary">
                Analysis layer siap dikembangkan
              </p>
            </div>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-[#ebeae4]">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-success to-gold" />
          </div>
        </div>

        <p className="mt-4 px-2 text-[10px] leading-relaxed text-[#9a9d98]">
          ATS Scanner workspace
        </p>
      </div>
    </aside>
  );
}