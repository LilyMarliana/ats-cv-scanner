import { useState, useRef, useMemo, useEffect } from 'react';
import {
  CloudUpload,
  X,
  Zap,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { CvResultCard } from '../components/CvResultCard';
import type { BulkUploadResponse, CVClassificationSummary } from '../types/cv';

type SortMode = 'score' | 'name';
type FilterMode = 'all' | 'success' | 'failed';

const PAGE_SIZE = 8;

export function BulkUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<CVClassificationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadExpanded, setUploadExpanded] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasResults = results.length > 0;

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const incoming = Array.from(selected).filter(
      (f) => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
    );
    setFiles((prev) => [...prev, ...incoming].slice(0, 10));
    setError(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleProcess() {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append('cvs', file));

    try {
      const response = await api.post<BulkUploadResponse>('/cv/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data) {
        setResults(response.data.data.results);
        setFiles([]);
        setFilterMode('all');
        setCurrentPage(1);
        setUploadExpanded(false);
      } else {
        setError(response.data.message);
      }
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan di port 3001.');
    } finally {
      setIsProcessing(false);
    }
  }

  const successResults = results.filter((r) => !r.isLikelyFailed);
  const failedResults = results.filter((r) => r.isLikelyFailed);

  const avgScore =
    successResults.length > 0
      ? Math.round(
          successResults.reduce((sum, r) => sum + r.bestMatch.overallScore, 0) /
            successResults.length
        )
      : 0;

  const topScore =
    successResults.length > 0
      ? Math.max(...successResults.map((r) => r.bestMatch.overallScore))
      : 0;

  const atsResults = successResults.filter((r) => r.quality);
  const avgAts =
    atsResults.length > 0
      ? Math.round(
          atsResults.reduce((sum, r) => sum + (r.quality?.atsScore ?? 0), 0) / atsResults.length
        )
      : 0;

  const filteredResults = useMemo(() => {
    if (filterMode === 'success') return successResults;
    if (filterMode === 'failed') return failedResults;
    return results;
  }, [results, filterMode, successResults, failedResults]);

  const sortedResults = useMemo(() => {
    const copy = [...filteredResults];
    if (sortMode === 'score') {
      copy.sort((a, b) => {
        if (a.isLikelyFailed && !b.isLikelyFailed) return 1;
        if (!a.isLikelyFailed && b.isLikelyFailed) return -1;
        return b.bestMatch.overallScore - a.bestMatch.overallScore;
      });
    } else {
      copy.sort((a, b) => a.originalName.localeCompare(b.originalName));
    }
    return copy;
  }, [filteredResults, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedResults.length / PAGE_SIZE));
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMode, sortMode]);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-navy mb-1">Upload CV massal</h1>
        <p className="text-sm text-text-secondary">
          {hasResults
            ? `${results.length} CV telah dianalisis dan diberi skor kecocokan`
            : 'Upload hingga 10 CV sekaligus untuk klasifikasi otomatis ke posisi yang tersedia'}
        </p>
      </div>

      {hasResults && !uploadExpanded ? (
        <button
          onClick={() => setUploadExpanded(true)}
          className="w-full flex flex-wrap items-center gap-2.5 bg-surface border border-border-subtle rounded-xl px-4 py-2.5 mb-2 hover:border-navy transition-colors text-left"
        >
          <CloudUpload size={18} className="text-navy shrink-0" />
          <span className="text-sm text-text-secondary flex-1">
            Tarik file ke sini atau klik untuk tambah CV
          </span>
          <span className="text-xs font-medium text-navy shrink-0">Upload lagi</span>
        </button>
      ) : (
        <div className="mb-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-surface ${
              isDragging ? 'border-navy bg-navy/5' : 'border-border-subtle hover:border-navy'
            }`}
          >
            <CloudUpload size={30} className="mx-auto text-navy mb-3" />
            <p className="text-sm text-gray-900 mb-1">
              <span className="font-medium text-navy">Klik untuk pilih file</span> atau seret ke sini
            </p>
            <p className="text-xs text-text-secondary">
              PDF, DOCX &middot; maks 5MB/file &middot; maks 10 file
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-secondary">
                  {files.length} file dipilih
                </p>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-text-secondary hover:text-error"
                >
                  Hapus semua
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-surface border border-border-subtle rounded-lg px-3 py-2"
                  >
                    <FileText size={15} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-900 truncate flex-1">{file.name}</span>
                    <span className="text-xs text-text-secondary shrink-0">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-error shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleProcess}
              disabled={files.length === 0 || isProcessing}
              className="flex-1 bg-navy text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Zap size={16} />
              {isProcessing ? `Memproses ${files.length} CV...` : `Proses ${files.length || ''} CV`.trim()}
            </button>
            {hasResults && (
              <button
                onClick={() => setUploadExpanded(false)}
                className="text-sm text-text-secondary border border-border-subtle rounded-lg px-4 hover:bg-surface"
              >
                Tutup
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm text-error mt-3 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              {error}
            </p>
          )}
        </div>
      )}

      {!hasResults ? (
        <div className="border-t border-border-subtle mt-6 pt-5">
          <p className="text-xs font-medium text-gray-900 mb-3">Cara kerja sistem</p>
          <div className="flex flex-col gap-3">
            {[
              'Sistem membaca dan mengenali bagian CV (pengalaman, pendidikan, keahlian)',
              'Dicocokkan otomatis ke semua posisi terbuka dan diberi skor',
              'Hasil diurutkan dari kandidat paling cocok',
            ].map((text, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-navy/10 text-navy text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 mt-4">
            <div className="bg-surface border border-border-subtle rounded-xl p-3.5">
              <p className="text-xs text-text-secondary mb-1">Total diproses</p>
              <p className="text-lg font-medium text-navy">{results.length}</p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3.5">
              <p className="text-xs text-text-secondary mb-1">Skor rata-rata</p>
              <p className="text-lg font-medium text-navy">{avgScore}%</p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3.5">
              <p className="text-xs text-text-secondary mb-1">Skor tertinggi</p>
              <p className="text-lg font-medium text-navy">{topScore}%</p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3.5">
              <p className="text-xs text-text-secondary mb-1">Rata-rata skor ATS</p>
              <p className="text-lg font-medium text-navy">{avgAts}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 px-0.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  filterMode === 'all'
                    ? 'bg-navy text-white border-navy'
                    : 'bg-surface text-text-secondary border-border-subtle hover:border-navy'
                }`}
              >
                Semua ({results.length})
              </button>
              <button
                onClick={() => setFilterMode('success')}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  filterMode === 'success'
                    ? 'bg-success text-white border-success'
                    : 'bg-surface text-text-secondary border-border-subtle hover:border-success'
                }`}
              >
                <CheckCircle2 size={13} />
                {successResults.length} berhasil
              </button>
              {failedResults.length > 0 && (
                <button
                  onClick={() => setFilterMode('failed')}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    filterMode === 'failed'
                      ? 'bg-error text-white border-error'
                      : 'bg-surface text-text-secondary border-border-subtle hover:border-error'
                  }`}
                >
                  <AlertTriangle size={13} />
                  {failedResults.length} bermasalah
                </button>
              )}
            </div>
            <button
              onClick={() => setSortMode(sortMode === 'score' ? 'name' : 'score')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-navy border border-border-subtle rounded-lg px-2.5 py-1.5 bg-surface shrink-0"
            >
              <ArrowDownWideNarrow size={13} />
              Urutkan: {sortMode === 'score' ? 'Skor' : 'Nama'}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {paginatedResults.map((result, i) => (
              <CvResultCard
                key={i}
                result={result}
                isTopCandidate={
                  !result.isLikelyFailed && result.bestMatch.overallScore === topScore && topScore > 0
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-secondary">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}