import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { JDTemplate } from '../types/position';

interface PositionFormModalProps {
  initial?: JDTemplate | null;
  onClose: () => void;
  onSubmit: (positionName: string, jdText: string) => Promise<void>;
}

export function PositionFormModal({ initial, onClose, onSubmit }: PositionFormModalProps) {
  const [positionName, setPositionName] = useState('');
  const [jdText, setJdText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPositionName(initial?.positionName ?? '');
    setJdText(initial?.jdText ?? '');
  }, [initial]);

  async function handleSubmit() {
    if (!positionName.trim() || !jdText.trim()) {
      setError('Nama posisi dan deskripsi tidak boleh kosong');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(positionName, jdText);
      onClose();
    } catch {
      setError('Gagal menyimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-lg shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h3 className="text-base font-medium text-navy">
            {initial ? 'Edit Posisi' : 'Tambah Posisi Baru'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Nama Posisi</label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="Contoh: Staff Administrasi"
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Deskripsi Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
              placeholder="Tulis kriteria dan requirement posisi ini..."
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-navy"
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-border-subtle text-text-secondary hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-sm px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}