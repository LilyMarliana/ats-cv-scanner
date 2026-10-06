import { useState, useEffect, useRef } from 'react';
import { FileText, ArrowLeftRight, Check, X, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import type { JDTemplate, TemplateListResponse } from '../types/position';
import type { CompareResponse, MatchingResult } from '../types/compare';
import type { CvQuality } from '../types/quality';
import { AtsScoreCard } from '../components/AtsScoreCard';

interface ExtractResponse {
  success: boolean;
  message: string;
  data?: { extractedText: string; isLikelyFailed?: boolean; warning?: string; quality?: CvQuality };
}

function getScoreVariant(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

export function CompareCv() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [templates, setTemplates] = useState<JDTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [quality, setQuality] = useState<CvQuality | null>(null);
  const [cvWarning, setCvWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<TemplateListResponse>('/templates').then((res) => {
      if (res.data.success && res.data.data) setTemplates(res.data.data);
    });
  }, []);

  async function handleFileSelect(file: File | null) {
    if (!file) return;
    setCvFile(file);
    setIsExtracting(true);
    setError(null);
    setQuality(null);
    setCvWarning(null);
    setResult(null);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await api.post<ExtractResponse>('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data) {
        setCvText(res.data.data.extractedText);
        setCvWarning(res.data.data.warning ?? null);
        // Kalau teks gagal diekstrak, skor ATS nggak bermakna -> jangan ditampilkan
        if (!res.data.data.isLikelyFailed && res.data.data.quality) {
          setQuality(res.data.data.quality);
        }
      }
    } catch {
      setError('Gagal mengekstrak teks dari CV.');
    } finally {
      setIsExtracting(false);
    }
  }

  function handleSelectTemplate(id: string) {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) setJdText(template.jdText);
  }

  async function handleCompare() {
    if (!cvText.trim() || !jdText.trim()) {
      setError('CV dan Job Description harus diisi terlebih dahulu.');
      return;
    }
    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post<CompareResponse>('/match/compare', { cvText, jdText });
      if (res.data.success && res.data.data) {
        setResult(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    } finally {
      setIsComparing(false);
    }
  }

  const scoreVariant = result ? getScoreVariant(result.overallScore) : 'success';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-navy mb-1">Compare CV</h1>
        <p className="text-sm text-text-secondary">
          Bandingkan 1 CV terhadap 1 Job Description secara langsung
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">Upload atau Pilih CV</p>
            <FileText size={16} className="text-gray-400" />
          </div>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center cursor-pointer hover:border-navy transition-colors"
          >
            {cvFile ? (
              <p className="text-sm text-gray-900 font-medium truncate">{cvFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-900 mb-1">
                  Seret file ke sini atau <span className="text-navy font-medium">pilih file</span>
                </p>
                <p className="text-xs text-text-secondary">PDF, DOCX (maks 5MB)</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>
          {isExtracting && (
            <p className="text-xs text-text-secondary mt-2">Mengekstrak teks CV...</p>
          )}
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">Job Description</p>
            <div className="relative">
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="text-xs text-navy border border-border-subtle rounded-lg pl-2 pr-7 py-1.5 bg-surface appearance-none cursor-pointer focus:outline-none"
              >
                <option value="">Pilih dari Posisi Tersimpan</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.positionName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-navy pointer-events-none"
              />
            </div>
          </div>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={7}
            placeholder="Tempelkan teks Job Description di sini..."
            className="w-full border border-border-subtle rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy"
          />
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <button
          onClick={handleCompare}
          disabled={isComparing || !cvText.trim() || !jdText.trim()}
          className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <ArrowLeftRight size={16} />
          {isComparing ? 'Membandingkan...' : 'Bandingkan Sekarang'}
        </button>
      </div>

      {error && <p className="text-sm text-error text-center mt-3">{error}</p>}

      {cvWarning && (
        <p className="text-xs text-warning bg-warning-bg rounded-lg px-3 py-2 mt-4">{cvWarning}</p>
      )}

      {result && (
        <div className="mt-8">
          <div className="bg-surface border border-border-subtle rounded-xl p-6 mb-4">
            <div className="flex items-center justify-center gap-10">
              <div className="text-center">
                <p className="text-3xl font-medium text-gray-900">{result.overallScore}%</p>
                <p className="text-xs text-text-secondary mt-1">Skor Keseluruhan</p>
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-medium ${
                    getScoreVariant(result.requiredScore) === 'success'
                      ? 'text-success'
                      : getScoreVariant(result.requiredScore) === 'warning'
                      ? 'text-warning'
                      : 'text-error'
                  }`}
                >
                  {result.requiredScore}%
                </p>
                <p className="text-xs text-text-secondary mt-1">Requirement Wajib</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-gray-500">{result.preferredScore}%</p>
                <p className="text-xs text-text-secondary mt-1">Nice-to-have</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-5">
              <div
                className={`h-2 rounded-full ${
                  scoreVariant === 'success'
                    ? 'bg-success'
                    : scoreVariant === 'warning'
                    ? 'bg-warning'
                    : 'bg-error'
                }`}
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-border-subtle rounded-xl p-5">
              <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                <Check size={14} className="text-success" />
                Kata Kunci Cocok ({result.matchedKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.length === 0 && (
                  <p className="text-xs text-text-secondary">Tidak ada kata kunci yang cocok</p>
                )}
                {result.matchedKeywords.map((k) => (
                  <span
                    key={k.keyword}
                    className="text-xs bg-success-bg text-success px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {k.keyword}
                    {k.isRequired && <span className="opacity-60">*</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-xl p-5">
              <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                <X size={14} className="text-error" />
                Kata Kunci Hilang ({result.missingKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.length === 0 && (
                  <p className="text-xs text-text-secondary">Semua kata kunci ditemukan</p>
                )}
                {result.missingKeywords.map((k) => (
                  <span
                    key={k.keyword}
                    className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {k.keyword}
                    {k.isRequired && <span className="opacity-60">*</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-3 text-center">
            * menandakan kata kunci wajib (required)
          </p>

          {quality && <AtsScoreCard quality={quality} />}
        </div>
      )}
    </div>
  );
}