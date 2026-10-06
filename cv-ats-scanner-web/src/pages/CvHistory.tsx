import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type {
  CvHistoryItem,
  CvHistoryResponse,
} from '../types/history';

const PAGE_SIZE = 8;

type StatusFilter = 'all' | 'normal' | 'warning' | 'failed';

function getBestMatch(item: CvHistoryItem) {
  if (item.matchResults.length === 0) return null;

  return [...item.matchResults].sort(
    (a, b) => b.overallScore - a.overallScore
  )[0];
}

function getStatus(item: CvHistoryItem): StatusFilter {
  if (item.isLikelyFailed) return 'failed';
  if (item.layoutWarning) return 'warning';

  return 'normal';
}

function getScoreVariant(
  score: number
): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';

  return 'error';
}

export function CvHistory() {
  const [items, setItems] = useState<CvHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] =
    useState<CvHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadHistory() {
    setIsLoading(true);

    try {
      const res =
        await api.get<CvHistoryResponse>('/history');

      if (res.data.success && res.data.data) {
        setItems(res.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await api.delete(`/history/${deleteTarget.id}`);

      setDeleteTarget(null);

      await loadHistory();
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.originalName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        getStatus(item) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-navy mb-1">
          CV History
        </h1>

        <p className="text-sm text-text-secondary">
          Riwayat seluruh CV yang pernah diupload dan
          dianalisis
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama file..."
            className="w-full border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm bg-surface focus:outline-none focus:border-navy"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as StatusFilter
            )
          }
          className="border border-border-subtle rounded-lg px-3 py-2.5 text-sm bg-surface text-text-secondary focus:outline-none focus:border-navy"
        >
          <option value="all">Semua status</option>
          <option value="normal">Normal</option>
          <option value="warning">Layout warning</option>
          <option value="failed">
            Gagal diproses
          </option>
        </select>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-text-secondary">
          Memuat riwayat...
        </div>
      ) : filtered.length === 0 ? (
        /* EMPTY */
        <div className="border border-border-subtle rounded-xl p-10 bg-surface flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-4">
            <HistoryIcon
              size={24}
              className="text-navy/40"
            />
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1.5">
            {items.length === 0
              ? 'Belum ada riwayat CV'
              : 'Tidak ditemukan'}
          </p>

          <p className="text-xs text-text-secondary max-w-[260px] mb-4">
            {items.length === 0
              ? 'Upload CV di halaman Bulk Upload untuk mulai membangun riwayat'
              : 'Coba ubah kata kunci atau filter status'}
          </p>

          {items.length === 0 && (
            <Link
              to="/upload"
              className="text-sm text-navy font-medium hover:underline"
            >
              + Upload CV sekarang
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* TABLE */}
          <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-border-subtle">
                  <th className="text-left font-normal px-4 py-3">
                    Nama File
                  </th>

                  <th className="text-left font-normal px-4 py-3">
                    Tanggal Upload
                  </th>

                  <th className="text-left font-normal px-4 py-3">
                    Posisi Tercocok
                  </th>

                  <th className="text-left font-normal px-4 py-3">
                    Skor
                  </th>

                  <th className="text-left font-normal px-4 py-3">
                    Status
                  </th>

                  <th className="text-right font-normal px-4 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((item) => {
                  const best = getBestMatch(item);
                  const status = getStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border-subtle last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      {/* FILE */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/cv/${item.id}`}
                          className="text-sm text-gray-900 font-medium hover:text-navy hover:underline"
                        >
                          {item.originalName}
                        </Link>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </td>

                      {/* POSITION */}
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {best
                          ? best.jdTemplate
                              .positionName
                          : '—'}
                      </td>

                      {/* SCORE */}
                      <td className="px-4 py-3">
                        {best ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  getScoreVariant(
                                    best.overallScore
                                  ) === 'success'
                                    ? 'bg-success'
                                    : getScoreVariant(
                                        best.overallScore
                                      ) === 'warning'
                                    ? 'bg-warning'
                                    : 'bg-error'
                                }`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      best.overallScore
                                    )
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm font-medium text-gray-700">
                              {best.overallScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        {status === 'normal' && (
                          <Badge variant="success">
                            Normal
                          </Badge>
                        )}

                        {status === 'warning' && (
                          <Badge variant="warning">
                            Layout warning
                          </Badge>
                        )}

                        {status === 'failed' && (
                          <Badge variant="error">
                            Gagal diproses
                          </Badge>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* DETAIL */}
                          <Link
                            to={`/cv/${item.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy border border-border-subtle rounded-lg px-2.5 py-1.5 hover:border-navy hover:bg-navy/5 transition-colors"
                            title="Lihat detail CV"
                          >
                            Lihat detail
                            <ArrowUpRight
                              size={13}
                            />
                          </Link>

                          {/* DELETE */}
                          <button
                            onClick={() =>
                              setDeleteTarget(item)
                            }
                            className="p-1.5 text-gray-400 hover:text-error rounded-md hover:bg-error-bg transition-colors"
                            title="Hapus riwayat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-text-secondary">
                Menampilkan{' '}
                {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length
                )}{' '}
                dari {filtered.length} entri
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-navy text-white'
                        : 'bg-surface text-text-secondary border border-border-subtle hover:border-navy'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <ConfirmDialog
          title={`Hapus riwayat "${deleteTarget.originalName}"?`}
          message="CV dan seluruh hasil analisisnya akan dihapus permanen dari riwayat. Tindakan ini tidak bisa dibatalkan."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}