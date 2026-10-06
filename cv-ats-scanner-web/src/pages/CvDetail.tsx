import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Brain,
  Target,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from '../components/Badge';

interface CvDetailData {
  id: string;
  originalName: string;
  filename?: string;
  extractedText?: string;

  isLikelyFailed: boolean;
  layoutWarning?: string;

  bestMatch?: {
    positionName: string;
    templateId: string;
    overallScore: number;
  };

  matchResults?: Array<{
    positionName: string;
    overallScore: number;
    jdTemplate?: {
      positionName: string;
    };
  }>;

  allScores?: Array<{
    positionName: string;
    overallScore: number;
  }>;

  topMissingKeywords?: string[];

  quality?: {
    atsScore: number;
    formattingScore: number;
    contentScore: number;
    completenessScore: number;
    issues: string[];
    recommendations: string[];
  };

  createdAt?: string;
}

interface CvDetailResponse {
  success: boolean;
  message: string;
  data?: CvDetailData;
}

function getScoreTone(score: number) {
  if (score >= 70) {
    return {
      text: 'text-success',
      bg: 'bg-success-bg',
      bar: 'bg-success',
      label: 'Baik',
    };
  }

  if (score >= 50) {
    return {
      text: 'text-warning',
      bg: 'bg-warning-bg',
      bar: 'bg-warning',
      label: 'Perlu ditingkatkan',
    };
  }

  return {
    text: 'text-error',
    bg: 'bg-error-bg',
    bar: 'bg-error',
    label: 'Rendah',
  };
}

function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const tone = getScoreTone(score);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">{label}</span>

        <span className={`text-xs font-medium ${tone.text}`}>
          {score}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
          style={{
            width: `${Math.max(0, Math.min(100, score))}%`,
          }}
        />
      </div>
    </div>
  );
}

export function CvDetail() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<CvDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showExtractedText, setShowExtractedText] =
    useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!id) {
        setError('ID CV tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response =
          await api.get<CvDetailResponse>(`/history/${id}`);

        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError(
            response.data.message ||
              'Data CV tidak ditemukan.'
          );
        }
      } catch {
        setError(
          'Gagal mengambil detail CV. Pastikan backend berjalan.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-text-secondary py-12">
          Memuat detail CV...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-navy mb-6"
        >
          <ArrowLeft size={15} />
          Kembali ke history
        </Link>

        <div className="border border-border-subtle bg-surface rounded-xl p-8 text-center">
          <AlertTriangle
            size={28}
            className="mx-auto text-error mb-3"
          />

          <p className="text-sm font-medium text-gray-900 mb-1">
            Gagal memuat CV
          </p>

          <p className="text-xs text-text-secondary">
            {error || 'Data CV tidak ditemukan.'}
          </p>
        </div>
      </div>
    );
  }

  const bestMatch =
    data.bestMatch ||
    (data.matchResults?.length
      ? [...data.matchResults].sort(
          (a, b) => b.overallScore - a.overallScore
        )[0]
      : null);

  const allScores =
    data.allScores ||
    data.matchResults?.map((item) => ({
      positionName:
        item.jdTemplate?.positionName ||
        item.positionName,
      overallScore: item.overallScore,
    })) ||
    [];

  const topMissingKeywords =
    data.topMissingKeywords || [];

  const quality = data.quality;

  const overallScore = bestMatch?.overallScore ?? 0;
  const scoreTone = getScoreTone(overallScore);

  return (
    <div className="max-w-5xl mx-auto w-full pb-10">
      {/* BACK */}
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-navy mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Kembali ke CV History
      </Link>

      {/* HEADER */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
              <FileText
                size={21}
                className="text-navy"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-medium text-navy truncate">
                {data.originalName}
              </h1>

              {data.createdAt && (
                <p className="text-xs text-text-secondary mt-1">
                  Dianalisis{' '}
                  {new Date(
                    data.createdAt
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {data.isLikelyFailed ? (
            <Badge variant="error">
              Gagal diproses
            </Badge>
          ) : data.layoutWarning ? (
            <Badge variant="warning">
              Layout warning
            </Badge>
          ) : (
            <Badge variant="success">
              Berhasil dianalisis
            </Badge>
          )}
        </div>
      </div>

      {/* MAIN SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1 bg-surface border border-border-subtle rounded-2xl p-5">
          <p className="text-xs text-text-secondary mb-2">
            ATS Match Score
          </p>

          <div className="flex items-end gap-2 mb-3">
            <span
              className={`text-4xl font-semibold ${scoreTone.text}`}
            >
              {overallScore}%
            </span>

            <span className="text-xs text-text-secondary mb-1.5">
              {scoreTone.label}
            </span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreTone.bar} transition-all duration-700`}
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, overallScore)
                )}%`,
              }}
            />
          </div>

          {bestMatch && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-secondary mb-1">
                Posisi dengan kecocokan tertinggi
              </p>

              <p className="text-sm font-medium text-gray-900">
                {bestMatch.positionName}
              </p>
            </div>
          )}
        </div>

        {/* QUALITY */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target
              size={17}
              className="text-navy"
            />

            <div>
              <p className="text-sm font-medium text-gray-900">
                CV Quality
              </p>

              <p className="text-xs text-text-secondary">
                Evaluasi kualitas CV berdasarkan parser saat ini
              </p>
            </div>
          </div>

          {quality ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreBar
                label="ATS Score"
                score={quality.atsScore}
              />

              <ScoreBar
                label="Formatting"
                score={quality.formattingScore}
              />

              <ScoreBar
                label="Content"
                score={quality.contentScore}
              />

              <ScoreBar
                label="Completeness"
                score={quality.completenessScore}
              />
            </div>
          ) : (
            <div className="text-xs text-text-secondary py-4">
              Data CV Quality belum tersedia.
            </div>
          )}
        </div>
      </div>

      {/* MATCH RESULTS */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase
            size={17}
            className="text-navy"
          />

          <div>
            <p className="text-sm font-medium text-gray-900">
              Kecocokan Posisi
            </p>

            <p className="text-xs text-text-secondary">
              Hasil pencocokan CV dengan posisi yang tersedia
            </p>
          </div>
        </div>

        {allScores.length > 0 ? (
          <div className="flex flex-col gap-3">
            {[...allScores]
              .sort(
                (a, b) =>
                  b.overallScore - a.overallScore
              )
              .map((item, index) => {
                const tone = getScoreTone(
                  item.overallScore
                );

                return (
                  <div
                    key={`${item.positionName}-${index}`}
                    className="border border-border-subtle rounded-xl p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {index === 0 && (
                          <span className="text-[10px] uppercase tracking-wide bg-navy/5 text-navy px-2 py-1 rounded-md shrink-0">
                            Top Match
                          </span>
                        )}

                        <span className="text-sm font-medium text-gray-900 truncate">
                          {item.positionName}
                        </span>
                      </div>

                      <span
                        className={`text-sm font-semibold shrink-0 ${tone.text}`}
                      >
                        {item.overallScore}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tone.bar}`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              item.overallScore
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-xs text-text-secondary">
            Belum ada hasil pencocokan posisi.
          </p>
        )}
      </div>

      {/* KEYWORDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2
              size={17}
              className="text-success"
            />

            <p className="text-sm font-medium text-gray-900">
              Keyword yang perlu diperhatikan
            </p>
          </div>

          {topMissingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topMissingKeywords.map(
                (keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-warning-bg text-warning border border-warning/10"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              Tidak ada keyword yang perlu diperhatikan.
            </p>
          )}
        </div>

        {/* QUALITY ISSUES */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle
              size={17}
              className="text-warning"
            />

            <p className="text-sm font-medium text-gray-900">
              Catatan CV
            </p>
          </div>

          {quality?.issues &&
          quality.issues.length > 0 ? (
            <div className="flex flex-col gap-2">
              {quality.issues.map(
                (issue, index) => (
                  <div
                    key={index}
                    className="flex gap-2 text-xs text-text-secondary"
                  >
                    <span className="text-warning">
                      •
                    </span>

                    <span>{issue}</span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              Tidak ada catatan khusus.
            </p>
          )}
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {quality?.recommendations &&
        quality.recommendations.length > 0 && (
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles
                size={17}
                className="text-navy"
              />

              <p className="text-sm font-medium text-gray-900">
                Rekomendasi perbaikan CV
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quality.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="flex gap-2.5 bg-gray-50 rounded-xl p-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-navy/10 text-navy text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* AI SECTION */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
              <Brain
                size={19}
                className="text-navy"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  AI CV Analysis
                </p>

                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy/5 text-navy">
                  PREMIUM
                </span>
              </div>

              <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                Analisis AI akan memberikan insight lebih
                mendalam mengenai pengalaman, skill,
                potensi kandidat, dan kecocokan dengan
                posisi yang dipilih.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-navy text-white text-xs font-medium opacity-60 cursor-not-allowed"
          >
            <Sparkles size={14} />
            Analisis dengan AI
          </button>
        </div>
      </div>

      {/* EXTRACTED TEXT - COLLAPSED */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() =>
            setShowExtractedText(
              (current) => !current
            )
          }
          className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText
                size={17}
                className="text-gray-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                Teks CV asli
              </p>

              <p className="text-xs text-text-secondary mt-0.5">
                Lihat teks hasil ekstraksi dari file CV
              </p>
            </div>
          </div>

          {showExtractedText ? (
            <ChevronUp
              size={17}
              className="text-gray-400 shrink-0"
            />
          ) : (
            <ChevronDown
              size={17}
              className="text-gray-400 shrink-0"
            />
          )}
        </button>

        {showExtractedText && (
          <div className="border-t border-border-subtle p-5">
            {data.extractedText ? (
              <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary font-sans max-h-[500px] overflow-y-auto bg-gray-50 rounded-xl p-4">
                {data.extractedText}
              </pre>
            ) : (
              <p className="text-xs text-text-secondary">
                Teks hasil ekstraksi tidak tersedia.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}