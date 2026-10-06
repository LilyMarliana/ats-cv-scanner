import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Briefcase, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from '../components/Badge';
import { PositionFormModal } from '../components/PositionFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { JDTemplate, TemplateListResponse } from '../types/position';

export function Positions() {
  const [templates, setTemplates] = useState<JDTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<JDTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JDTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadTemplates() {
    setIsLoading(true);
    try {
      const res = await api.get<TemplateListResponse>('/templates');
      if (res.data.success && res.data.data) {
        setTemplates(res.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleCreate(positionName: string, jdText: string) {
    await api.post('/templates', { positionName, jdText });
    await loadTemplates();
  }

  async function handleEdit(positionName: string, jdText: string) {
    if (!editTarget) return;
    await api.put(`/templates/${editTarget.id}`, { positionName, jdText });
    await loadTemplates();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/templates/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadTemplates();
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = templates.filter((t) =>
    t.positionName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-navy mb-1">Positions</h1>
          <p className="text-sm text-text-secondary">
            Kelola posisi lowongan yang digunakan untuk mencocokkan CV
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-navy-light transition-colors shrink-0"
        >
          <Plus size={16} />
          Tambah Posisi
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari posisi berdasarkan nama..."
          className="w-full border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm bg-surface focus:outline-none focus:border-navy"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-text-secondary">Memuat data posisi...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-border-subtle rounded-xl p-10 bg-surface flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-4">
            <Briefcase size={24} className="text-navy/40" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1.5">
            {templates.length === 0 ? 'Belum ada posisi' : 'Tidak ditemukan'}
          </p>
          <p className="text-xs text-text-secondary max-w-[260px] mb-4">
            {templates.length === 0
              ? 'Tambahkan posisi pertama untuk mulai mencocokkan CV'
              : 'Coba kata kunci pencarian lain'}
          </p>
          {templates.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-navy font-medium hover:underline"
            >
              + Tambah posisi sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-border-subtle">
                <th className="text-left font-normal px-4 py-3">Nama Posisi</th>
                <th className="text-left font-normal px-4 py-3">Tipe</th>
                <th className="text-left font-normal px-4 py-3">Deskripsi</th>
                <th className="text-right font-normal px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.positionName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.isPreset ? 'neutral' : 'success'}>
                      {t.isPreset ? 'Preset' : 'Custom'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                    {t.jdText}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditTarget(t)}
                        className="p-1.5 text-gray-400 hover:text-navy rounded-md hover:bg-navy/5"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-1.5 text-gray-400 hover:text-error rounded-md hover:bg-error-bg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <PositionFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}

      {editTarget && (
        <PositionFormModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Hapus posisi "${deleteTarget.positionName}"?`}
          message="Tindakan ini tidak bisa dibatalkan. Riwayat CV yang sudah dicocokkan ke posisi ini tetap tersimpan."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}