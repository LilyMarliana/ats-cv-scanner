export type SectionType =
  | 'ringkasan'
  | 'pengalaman_kerja'
  | 'pendidikan'
  | 'keahlian'
  | 'sertifikasi'
  | 'kontak'
  | 'tidak_dikenal';

export interface DetectedSection {
  type: SectionType;
  heading: string;
  content: string;
}

export interface LayoutAnalysis {
  isProbablyComplexLayout: boolean;
  emptySectionCount: number;
  totalSectionCount: number;
  reason?: string | undefined;
}

const SECTION_KEYWORDS: Record<Exclude<SectionType, 'tidak_dikenal'>, string[]> = {
  ringkasan: ['tentang saya', 'ringkasan', 'profil', 'summary', 'about me'],
  pengalaman_kerja: ['pengalaman kerja', 'riwayat pekerjaan', 'work experience', 'pengalaman'],
  pendidikan: ['riwayat pendidikan', 'pendidikan', 'education'],
  keahlian: ['keahlian', 'kemampuan', 'skills', 'skill'],
  sertifikasi: ['sertifikasi', 'sertifikat', 'certification'],
  kontak: ['kontak', 'contact'],
};

const MAX_HEADING_WORDS = 4; // heading jarang lebih dari 4 kata
const MIN_CONTENT_WORDS = 3; // section dianggap "kosong" kalau isinya di bawah ini

interface LineMatch {
  lineIndex: number;
  type: SectionType;
  heading: string; // teks asli baris itu
  score: number; // makin tinggi, makin yakin ini heading beneran
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

// Cek apakah 1 baris "kemungkinan besar" adalah heading section tertentu
function matchLineToKeyword(line: string, keyword: string): number {
  const normalizedLine = normalize(line);
  const normalizedKeyword = normalize(keyword);

  const wordCountInLine = normalizedLine.split(/\s+/).filter(Boolean).length;

  // Syarat dasar: baris harus pendek, dan harus MENGANDUNG keyword
  if (wordCountInLine > MAX_HEADING_WORDS) return 0;
  if (!normalizedLine.includes(normalizedKeyword)) return 0;

  let score = 1; // baseline: pendek + mengandung keyword

  // Bonus 1: baris itu SAMA PERSIS dengan keyword (bukan ada tambahan kata lain)
  if (normalizedLine === normalizedKeyword) score += 2;

  // Bonus 2: ditulis ALL CAPS
  if (line.trim() === line.trim().toUpperCase() && /[A-Z]/.test(line)) score += 2;

  // Bonus 3: ditulis Title Case per kata (misal "Pengalaman Kerja")
  const words = line.trim().split(/\s+/);
  const isTitleCase = words.every((w) => w.length > 0 && w[0] === w[0]?.toUpperCase());
  if (isTitleCase) score += 1;

  return score;
}

export function detectSections(rawTextWithLines: string): DetectedSection[] {
  const lines = rawTextWithLines.split('\n');
  const candidateMatches: LineMatch[] = [];

  lines.forEach((line, lineIndex) => {
    for (const [type, keywords] of Object.entries(SECTION_KEYWORDS) as [
      Exclude<SectionType, 'tidak_dikenal'>,
      string[]
    ][]) {
      for (const keyword of keywords) {
        const score = matchLineToKeyword(line, keyword);
        if (score > 0) {
          candidateMatches.push({ lineIndex, type, heading: line.trim(), score });
        }
      }
    }
  });

  if (candidateMatches.length === 0) {
    return [{ type: 'tidak_dikenal', heading: '', content: lines.join(' ').trim() }];
  }

  // Per kategori, ambil match dengan score tertinggi.
  // Kalau seri, ambil yang posisinya paling awal muncul di dokumen.
  const bestByType = new Map<SectionType, LineMatch>();

  for (const match of candidateMatches) {
    const existing = bestByType.get(match.type);
    if (!existing) {
      bestByType.set(match.type, match);
      continue;
    }
    if (
      match.score > existing.score ||
      (match.score === existing.score && match.lineIndex < existing.lineIndex)
    ) {
      bestByType.set(match.type, match);
    }
  }

  const finalMatches = Array.from(bestByType.values()).sort((a, b) => a.lineIndex - b.lineIndex);

  const sections: DetectedSection[] = [];

  // Teks sebelum heading pertama (biasanya nama & kontak)
  if (finalMatches[0] && finalMatches[0].lineIndex > 0) {
    const introLines = lines.slice(0, finalMatches[0].lineIndex);
    const introText = introLines.join(' ').trim();
    if (introText.length > 0) {
      sections.push({ type: 'kontak', heading: '(sebelum section pertama)', content: introText });
    }
  }

  for (let i = 0; i < finalMatches.length; i++) {
    const current = finalMatches[i];
    const next = finalMatches[i + 1];
    if (!current) continue;

    const startLine = current.lineIndex + 1; // +1 biar gak ikut ke-include baris heading-nya sendiri
    const endLine = next ? next.lineIndex : lines.length;

    const contentLines = lines.slice(startLine, endLine);
    const content = contentLines.join(' ').trim();

    sections.push({ type: current.type, heading: current.heading, content });
  }

  return sections;
}

export function analyzeLayoutQuality(sections: DetectedSection[]): LayoutAnalysis {
  const relevantSections = sections.filter((s) => s.type !== 'tidak_dikenal');

  if (relevantSections.length === 0) {
    return {
      isProbablyComplexLayout: false,
      emptySectionCount: 0,
      totalSectionCount: 0,
    };
  }

  const emptySections = relevantSections.filter((s) => {
    const wordCount = s.content.split(/\s+/).filter(Boolean).length;
    return wordCount < MIN_CONTENT_WORDS;
  });

  const emptyRatio = emptySections.length / relevantSections.length;

  // Kalau lebih dari 1/3 section yang kedeteksi ternyata kosong/nyaris kosong,
  // kemungkinan besar ini indikasi layout kompleks (multi-kolom) yang bikin
  // urutan teks kacau saat di-extract.
  const isProbablyComplexLayout = emptyRatio > 0.3 && emptySections.length >= 2;

  return {
    isProbablyComplexLayout,
    emptySectionCount: emptySections.length,
    totalSectionCount: relevantSections.length,
    reason: isProbablyComplexLayout
      ? `${emptySections.length} dari ${relevantSections.length} section terdeteksi kosong/nyaris kosong, kemungkinan karena layout PDF multi-kolom.`
      : undefined,
  };
}