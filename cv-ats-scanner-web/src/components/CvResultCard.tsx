import {
  Award,
  X,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CVClassificationSummary } from '../types/cv';

interface CvResultCardProps {
  result: CVClassificationSummary;
  isTopCandidate: boolean;
}

function getScoreTone(score: number) {
  if (score >= 70) {
    return {
      text: 'text-success',
      bar: 'bg-success',
      label: 'Kecocokan tinggi',
    };
  }

  if (score >= 40) {
    return {
      text: 'text-warning',
      bar: 'bg-warning',
      label: 'Kecocokan sedang',
    };
  }

  return {
    text: 'text-error',
    bar: 'bg-error',
    label: 'Kecocokan rendah',
  };
}

function initials(name: string) {
  const base = name.replace(/\.(pdf|docx)$/i, '');
  const parts = base.split(/[\s_-]+/).filter(Boolean);

  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

function DetailLink({ id }: { id?: string }) {
  if (!id) return null;

  return (
    <Link
      to={`/cv/${id}`}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-navy-light transition-colors"
    >
      Lihat detail
      <ArrowUpRight size={13} />
    </Link>
  );
}

export function CvResultCard({
  result,
  isTopCandidate,
}: CvResultCardProps) {
  // =========================
  // FAILED CV
  // =========================
  if (result.isLikelyFailed) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-error/30 bg-error/5">
        <AlertTriangle
          size={20}
          className="text-error shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-error truncate">
            {result.originalName}
          </p>

          <p className="text-xs text-text-secondary mt-0.5">
            Gagal diekstrak · kemungkinan kosong atau hasil scan/gambar
          </p>
        </div>

        <button className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border-subtle rounded-lg px-3 py-1.5 shrink-0 hover:bg-surface">
          <RotateCcw size={13} />
          Upload ulang
        </button>
      </div>
    );
  }

  const score = result.bestMatch.overallScore;
  const tone = getScoreTone(score);
  const missing = result.topMissingKeywords ?? [];

  // =========================
  // TOP CANDIDATE
  // =========================
  if (isTopCandidate) {
    return (
      <div className="rounded-xl border-2 border-navy p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
            <Award size={13} />
            Kandidat terbaik batch ini
          </span>

          <DetailLink id={result.id} />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy/10 text-navy text-xs font-medium flex items-center justify-center shrink-0">
            {initials(result.originalName)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {result.originalName}
            </p>

            <p className="text-xs text-text-secondary mt-0.5">
              {result.bestMatch.positionName}
            </p>
          </div>

          <span
            className={`text-xl font-medium shrink-0 ${tone.text}`}
          >
            {score}%
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-3">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{
              width: `${Math.max(
                0,
                Math.min(100, score)
              )}%`,
            }}
          />
        </div>

        {missing.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1 text-xs bg-error/10 text-error px-2 py-1 rounded-lg">
              <X size={12} />

              {missing.slice(0, 4).join(', ')}

              {missing.length > 4
                ? ` +${missing.length - 4}`
                : ''}
            </span>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // NORMAL RESULT
  // =========================
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border-subtle hover:border-navy/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle text-text-secondary text-[11px] font-medium flex items-center justify-center shrink-0">
        {initials(result.originalName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {result.originalName}
        </p>

        <p className="text-xs text-text-secondary mt-0.5">
          {result.bestMatch.positionName}

          {missing.length > 0
            ? ` · ${missing.length} kata kunci belum ditemukan`
            : ''}
        </p>
      </div>

      <span
        className={`text-base font-medium shrink-0 ${tone.text}`}
      >
        {score}%
      </span>

      <DetailLink id={result.id} />
    </div>
  );
}