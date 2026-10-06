import type { DetectedSection } from './sectionDetector.service';

export type FactorKey = 'kuantitatif' | 'panjang' | 'bullet' | 'kelengkapan';

export interface QualityFactor {
  key: FactorKey;
  label: string;
  score: number; // 0-100
  detail: string; // penjelasan singkat kenapa skornya segitu
}

export interface QualityTip {
  factor: FactorKey;
  text: string;
}

export interface CvQualityResult {
  atsScore: number; // 0-100
  verdict: 'bagus' | 'cukup' | 'perlu_perbaikan';
  headline: string;
  factors: QualityFactor[];
  catatan: string;
  tips: QualityTip[];
  stats: {
    wordCount: number;
    bulletCount: number;
    bulletWithNumberCount: number;
    avgBulletWords: number;
    hasEmail: boolean;
    hasPhone: boolean;
    missingSections: string[];
  };
}

// ---------- Konfigurasi (gampang diubah kalau mau dituning) ----------
const WEIGHTS: Record<FactorKey, number> = {
  kuantitatif: 0.3,
  kelengkapan: 0.3,
  panjang: 0.2,
  bullet: 0.2,
};

const IDEAL_WORDS_MIN = 350;
const IDEAL_WORDS_MAX = 800;
const TARGET_QUANTIFIED_RATIO = 0.4; // 40% bullet sebaiknya punya angka/hasil terukur
const MAX_BULLET_WORDS = 25; // bullet lebih panjang dari ini dianggap kurang ringkas
const MIN_SECTION_WORDS = 3;
const VERY_SHORT_WORDS = 150; // CV di bawah ini nggak boleh dapat skor tinggi
const VERY_SHORT_CAP = 60;

const BULLET_START = /^\s*(?:[•●▪■◦○‣∙·\-–—*]|\d{1,2}[.)])\s+/;
const EMAIL_REGEX = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE_REGEX = /(?:\+62|62|0)8\d[\d\s-]{7,12}/;

// ---------- Helper ----------
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function looksLikeHeading(line: string): boolean {
  const words = countWords(line);
  const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
  return words <= 4 && isAllCaps;
}

// Ambil daftar bullet dari teks per-baris.
// Baris lanjutan (wrap dari PDF) yang diawali huruf kecil digabung ke bullet sebelumnya.
function extractBullets(rawTextWithLines: string): string[] {
  const lines = rawTextWithLines
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    if (BULLET_START.test(line)) {
      if (current) bullets.push(current);
      current = line.replace(BULLET_START, '').trim();
    } else if (current && /^[a-z]/.test(line) && !looksLikeHeading(line)) {
      current += ' ' + line;
    } else {
      if (current) bullets.push(current);
      current = null;
    }
  }
  if (current) bullets.push(current);

  if (bullets.length >= 3) return bullets;

  // Fallback: CV tanpa simbol bullet -> anggap baris deskripsi (>= 6 kata, bukan heading) sebagai bullet
  return lines.filter((l) => countWords(l) >= 6 && !looksLikeHeading(l) && !EMAIL_REGEX.test(l));
}

// Cek apakah sebuah bullet punya angka "bermakna" (bukan cuma tahun/nomor telepon/URL)
function hasMeaningfulNumber(bullet: string): boolean {
  const cleaned = bullet
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(EMAIL_REGEX, ' ')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ') // tahun
    .replace(/\b\d{1,2}[/-]\d{4}\b/g, ' '); // 03/2024
  return /\d/.test(cleaned);
}

// ---------- Scoring per faktor ----------
function scoreQuantitative(bullets: string[]) {
  if (bullets.length === 0) {
    return { score: 0, withNumber: 0, detail: 'Tidak ada poin pengalaman/pencapaian yang terdeteksi.' };
  }
  const withNumber = bullets.filter(hasMeaningfulNumber).length;
  const ratio = withNumber / bullets.length;
  const score = Math.round(clamp((ratio / TARGET_QUANTIFIED_RATIO) * 100));
  return {
    score,
    withNumber,
    detail: `${withNumber} dari ${bullets.length} poin memuat angka/hasil terukur.`,
  };
}

function scoreLength(wordCount: number) {
  let score: number;
  let detail: string;

  if (wordCount < IDEAL_WORDS_MIN) {
    score = Math.round(clamp((wordCount / IDEAL_WORDS_MIN) * 100));
    detail = `${wordCount} kata — terlalu singkat (ideal ${IDEAL_WORDS_MIN}–${IDEAL_WORDS_MAX} kata).`;
  } else if (wordCount > IDEAL_WORDS_MAX) {
    score = Math.round(clamp(100 - (wordCount - IDEAL_WORDS_MAX) / 8, 20));
    detail = `${wordCount} kata — terlalu panjang (ideal ${IDEAL_WORDS_MIN}–${IDEAL_WORDS_MAX} kata).`;
  } else {
    score = 100;
    detail = `${wordCount} kata — panjang CV sudah ideal.`;
  }
  return { score, detail };
}

function scoreConciseness(bullets: string[]) {
  if (bullets.length === 0) {
    return { score: 0, avgWords: 0, detail: 'Tidak ada bullet point yang terdeteksi.' };
  }
  const lengths = bullets.map(countWords);
  const avgWords = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const shortEnough = lengths.filter((n) => n <= MAX_BULLET_WORDS).length;
  const score = Math.round((shortEnough / bullets.length) * 100);
  return {
    score,
    avgWords,
    detail: `${shortEnough} dari ${bullets.length} poin ringkas (≤ ${MAX_BULLET_WORDS} kata), rata-rata ${avgWords} kata.`,
  };
}

function scoreCompleteness(text: string, sections: DetectedSection[]) {
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);

  const hasSection = (type: DetectedSection['type']) =>
    sections.some((s) => s.type === type && countWords(s.content) >= MIN_SECTION_WORDS);

  const checks: { label: string; ok: boolean }[] = [
    { label: 'Kontak (email & telepon)', ok: hasEmail && hasPhone },
    { label: 'Ringkasan/Profil', ok: hasSection('ringkasan') },
    { label: 'Pengalaman', ok: hasSection('pengalaman_kerja') },
    { label: 'Pendidikan', ok: hasSection('pendidikan') },
    { label: 'Keahlian', ok: hasSection('keahlian') },
  ];

  const present = checks.filter((c) => c.ok).length;
  const missing = checks.filter((c) => !c.ok).map((c) => c.label);
  const score = Math.round((present / checks.length) * 100);

  return {
    score,
    hasEmail,
    hasPhone,
    missing,
    detail:
      missing.length === 0
        ? 'Semua bagian penting ditemukan.'
        : `${present} dari ${checks.length} bagian ditemukan. Belum ada: ${missing.join(', ')}.`,
  };
}

// ---------- Catatan & tips ----------
function buildTips(
  factors: QualityFactor[],
  stats: CvQualityResult['stats']
): QualityTip[] {
  const byKey = Object.fromEntries(factors.map((f) => [f.key, f])) as Record<FactorKey, QualityFactor>;
  const tips: QualityTip[] = [];

  if (byKey.kuantitatif.score < 80) {
    tips.push({
      factor: 'kuantitatif',
      text: 'Tambahkan angka pada pencapaianmu, misalnya "meningkatkan akurasi model dari 78% ke 91%" atau "melayani 500+ pengguna". Rekruter lebih mudah menilai hasil yang terukur.',
    });
  }
  if (byKey.kelengkapan.score < 100) {
    tips.push({
      factor: 'kelengkapan',
      text: `Lengkapi bagian yang belum terdeteksi: ${stats.missingSections.join(', ')}. Gunakan judul bagian yang standar (mis. "Pengalaman Kerja", "Pendidikan", "Keahlian").`,
    });
  }
  if (byKey.panjang.score < 80) {
    tips.push({
      factor: 'panjang',
      text:
        stats.wordCount < IDEAL_WORDS_MIN
          ? `CV-mu baru ${stats.wordCount} kata. Tambahkan detail proyek, tools yang dipakai, dan hasil kerja sampai kira-kira ${IDEAL_WORDS_MIN}–${IDEAL_WORDS_MAX} kata.`
          : `CV-mu ${stats.wordCount} kata. Ringkas pengalaman lama atau yang kurang relevan supaya tetap di kisaran ${IDEAL_WORDS_MIN}–${IDEAL_WORDS_MAX} kata (1–2 halaman).`,
    });
  }
  if (byKey.bullet.score < 80) {
    tips.push({
      factor: 'bullet',
      text: `Pecah poin yang panjang. Usahakan tiap bullet maksimal ${MAX_BULLET_WORDS} kata: mulai dengan kata kerja, lalu aksi dan hasilnya.`,
    });
  }

  if (tips.length === 0) {
    tips.push({
      factor: 'kuantitatif',
      text: 'CV-mu sudah kuat secara struktur. Langkah berikutnya: sesuaikan kata kunci dengan job description posisi yang kamu lamar.',
    });
  }
  return tips.slice(0, 3);
}

function buildCatatan(atsScore: number, factors: QualityFactor[]): string {
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  if (!weakest) return '';
  if (atsScore >= 80 && weakest.score >= 70) {
    return 'Struktur dan isi CV-mu sudah ramah ATS. Tinggal sesuaikan kata kunci untuk tiap lowongan.';
  }
  return `Bagian yang paling perlu diperbaiki: ${weakest.label} (${weakest.score}%). ${weakest.detail}`;
}

// ---------- Fungsi utama ----------
export function analyzeCvQuality(
  rawTextWithLines: string,
  flatText: string,
  sections: DetectedSection[]
): CvQualityResult {
  const bullets = extractBullets(rawTextWithLines);
  const wordCount = countWords(flatText);

  const q = scoreQuantitative(bullets);
  const l = scoreLength(wordCount);
  const b = scoreConciseness(bullets);
  const c = scoreCompleteness(flatText, sections);

  const factors: QualityFactor[] = [
    { key: 'kuantitatif', label: 'Dampak Kuantitatif', score: q.score, detail: q.detail },
    { key: 'panjang', label: 'Panjang CV', score: l.score, detail: l.detail },
    { key: 'bullet', label: 'Keringkasan Bullet Point', score: b.score, detail: b.detail },
    { key: 'kelengkapan', label: 'Kelengkapan Bagian', score: c.score, detail: c.detail },
  ];

  let atsScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * WEIGHTS[f.key], 0)
  );
  if (wordCount < VERY_SHORT_WORDS) atsScore = Math.min(atsScore, VERY_SHORT_CAP);

  const verdict: CvQualityResult['verdict'] =
    atsScore >= 75 ? 'bagus' : atsScore >= 50 ? 'cukup' : 'perlu_perbaikan';

  const headline =
    verdict === 'bagus'
      ? `Kerja bagus! Skor ATS CV kamu ${atsScore}%.`
      : verdict === 'cukup'
      ? `Lumayan! Skor ATS CV kamu ${atsScore}%, masih bisa ditingkatkan.`
      : `Skor ATS CV kamu ${atsScore}%. CV ini perlu diperbaiki sebelum dikirim.`;

  const stats: CvQualityResult['stats'] = {
    wordCount,
    bulletCount: bullets.length,
    bulletWithNumberCount: q.withNumber ?? 0,
    avgBulletWords: b.avgWords,
    hasEmail: c.hasEmail,
    hasPhone: c.hasPhone,
    missingSections: c.missing,
  };

  return {
    atsScore,
    verdict,
    headline,
    factors,
    catatan: buildCatatan(atsScore, factors),
    tips: buildTips(factors, stats),
    stats,
  };
}