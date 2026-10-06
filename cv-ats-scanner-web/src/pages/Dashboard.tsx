import { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import type {
  CvHistoryItem,
  CvHistoryResponse,
} from '../types/history';
import type { TemplateListResponse } from '../types/position';

function getBestMatch(item: CvHistoryItem) {
  if (item.matchResults.length === 0) return null;

  return [...item.matchResults].sort(
    (a, b) => b.overallScore - a.overallScore
  )[0];
}

function getStatus(
  item: CvHistoryItem
): 'normal' | 'warning' | 'failed' {
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

function formatRelativeTime(dateStr: string): string {
  const diffMs =
    Date.now() - new Date(dateStr).getTime();

  const diffHours = Math.floor(
    diffMs / (1000 * 60 * 60)
  );

  if (diffHours < 1) return 'Baru saja';

  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) return 'Kemarin';

  return `${diffDays} hari lalu`;
}

export function Dashboard() {
  const [history, setHistory] = useState<CvHistoryItem[]>([]);
  const [totalPositions, setTotalPositions] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        const [
          historyRes,
          templatesRes,
        ] = await Promise.all([
          api.get<CvHistoryResponse>('/history'),
          api.get<TemplateListResponse>('/templates'),
        ]);

        if (
          historyRes.data.success &&
          historyRes.data.data
        ) {
          setHistory(historyRes.data.data);
        }

        if (
          templatesRes.data.success &&
          templatesRes.data.data
        ) {
          setTotalPositions(
            templatesRes.data.data.length
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const totalProcessed = history.length;

  const needsAttention = history.filter(
    (item) =>
      item.isLikelyFailed ||
      item.layoutWarning
  ).length;

  const successItems = history.filter(
    (item) => !item.isLikelyFailed
  );

  const avgScore =
    successItems.length > 0
      ? Math.round(
          successItems.reduce(
            (sum, item) => {
              const best = getBestMatch(item);

              return (
                sum +
                (best?.overallScore ?? 0)
              );
            },
            0
          ) / successItems.length
        )
      : 0;

  const recentActivity = [...history]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const today =
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-6 shadow-[0_10px_40px_rgba(57,66,61,0.04)]">
        <div className="absolute right-0 top-0 h-48 w-48 translate-x-20 -translate-y-20 rounded-full bg-gold/10 blur-2xl" />

        <div className="relative flex items-end justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4f0]">
                <Activity
                  size={14}
                  className="text-success"
                />
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Overview
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-navy">
              Selamat datang kembali
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              {today}
            </p>
          </div>

          <Link
            to="/upload"
            className="soft-button flex shrink-0 items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-navy-light"
          >
            <Plus size={16} />
            Upload CV baru
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total CV diproses"
          value={
            isLoading ? '—' : totalProcessed
          }
        />

        <StatCard
          label="Posisi terbuka"
          value={
            isLoading
              ? '—'
              : totalPositions
          }
        />

        <StatCard
          label="Perlu perhatian"
          value={
            isLoading
              ? '—'
              : needsAttention
          }
          valueColor="text-error"
        />

        <StatCard
          label="Rata-rata skor"
          value={
            isLoading
              ? '—'
              : `${avgScore}%`
          }
        />
      </div>

      {/* AI-ready teaser */}
      <section className="relative overflow-hidden rounded-2xl border border-[#ded8d1] bg-gradient-to-r from-[#faf8f5] to-white p-5">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-[#a98268]/10 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f1e9e2]">
            <Sparkles
              size={18}
              className="text-[#a98268]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">
              Intelligent CV analysis
            </p>

            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Workspace ini siap dikembangkan dengan
              analisis AI untuk insight CV yang lebih
              mendalam.
            </p>
          </div>

          <span className="ml-auto hidden shrink-0 rounded-full border border-[#ded8d1] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#856852] sm:inline-flex">
            Coming soon
          </span>
        </div>
      </section>

      {/* Recent activity */}
      <section className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-navy">
              Aktivitas terbaru
            </p>

            <p className="mt-0.5 text-[11px] text-text-secondary">
              Ringkasan analisis CV terbaru
            </p>
          </div>

          <Link
            to="/history"
            className="flex items-center gap-1 text-xs font-medium text-navy transition-colors hover:text-gold"
          >
            Lihat semua
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-text-secondary">
            Memuat data...
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f2ee]">
              <FileText
                size={24}
                className="text-[#a9aaa4]"
              />
            </div>

            <p className="mb-1 text-sm font-semibold text-gray-900">
              Belum ada aktivitas
            </p>

            <p className="mb-4 max-w-xs text-xs leading-relaxed text-text-secondary">
              Upload CV pertama untuk mulai melihat
              aktivitas analisis di sini.
            </p>

            <Link
              to="/upload"
              className="text-xs font-semibold text-navy hover:text-gold"
            >
              + Upload CV sekarang
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-[#9a9d98]">
                  <th className="px-5 py-3 text-left font-semibold">
                    Nama file
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Posisi
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Skor
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left font-semibold">
                    Waktu
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentActivity.map(
                  (item) => {
                    const best =
                      getBestMatch(item);

                    const status =
                      getStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className="group border-b border-border-subtle last:border-0 transition-colors hover:bg-[#fafaf7]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f3ef]">
                              {status ===
                              'failed' ? (
                                <AlertCircle
                                  size={14}
                                  className="text-error"
                                />
                              ) : status ===
                                'warning' ? (
                                <AlertTriangle
                                  size={14}
                                  className="text-warning"
                                />
                              ) : (
                                <FileText
                                  size={14}
                                  className="text-text-secondary"
                                />
                              )}
                            </div>

                            <span className="max-w-[220px] truncate text-sm font-medium text-gray-900">
                              {
                                item.originalName
                              }
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-sm text-text-secondary">
                          {best
                            ? best.jdTemplate
                                .positionName
                            : '—'}
                        </td>

                        <td className="px-4 py-3.5">
                          {best ? (
                            <Badge
                              variant={getScoreVariant(
                                best.overallScore
                              )}
                            >
                              {
                                best.overallScore
                              }
                              %
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {status ===
                            'normal' && (
                            <Badge variant="success">
                              Normal
                            </Badge>
                          )}

                          {status ===
                            'warning' && (
                            <Badge variant="warning">
                              Layout warning
                            </Badge>
                          )}

                          {status ===
                            'failed' && (
                            <Badge variant="error">
                              Gagal diproses
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-text-secondary">
                          {formatRelativeTime(
                            item.createdAt
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}