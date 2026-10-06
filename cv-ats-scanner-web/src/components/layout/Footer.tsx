import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border-subtle px-1 pb-6 pt-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle bg-surface">
            <ShieldCheck size={13} className="text-text-secondary" />
          </div>

          <p className="text-[11px] text-text-secondary">
            <span className="font-medium text-navy">ATS Scanner</span>
            <span className="mx-1.5 text-[#c0c1bc]">·</span>
            Dibangun oleh Lily
          </p>
        </div>

        <p className="text-[10px] text-text-secondary">
          © {new Date().getFullYear()} ATS Scanner
        </p>
      </div>
    </footer>
  );
}