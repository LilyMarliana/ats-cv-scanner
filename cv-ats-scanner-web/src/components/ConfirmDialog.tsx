import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Hapus',
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl p-6 max-w-sm w-full shadow-lg">
        <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center mb-4">
          <AlertTriangle size={18} className="text-error" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg border border-border-subtle text-text-secondary hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="text-sm px-4 py-2 rounded-lg bg-error text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}