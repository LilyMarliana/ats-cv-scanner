import type { ExtractedKeyword, JDAnalysisResult } from '../types/jd.types';

const STOPWORDS = new Set([
  'dan', 'atau', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada',
  'ini', 'itu', 'adalah', 'akan', 'dapat', 'bisa', 'harus', 'juga',
  'the', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'a', 'an',
  'serta', 'oleh', 'saat', 'setiap', 'para', 'sebagai', 'agar', 'karena',
  'dalam',
]);

const GENERIC_JD_WORDS = new Set([
  'kami', 'kandidat', 'pelamar', 'perusahaan', 'posisi', 'baik', 'wajib',
  'diutamakan', 'minimal', 'maksimal', 'bidang', 'terkait', 'sesuai',
  'mampu', 'siap', 'diperlukan', 'dibutuhkan', 'memahami',
  'seperti', 'nilai', 'tambah', 'kemampuan', 'familiaritas', 'platform',
  'tahun', 'rapi', 'teliti', 'kuat', 'pemahaman', 'tentang', 'support',
]);

const VERB_PREFIXES = ['me', 'ber', 'di', 'ter', 'peng', 'pen', 'per'];

const REQUIRED_PATTERNS = [
  /wajib/i,
  /harus/i,
  /diharuskan/i,
  /required/i,
  /must have/i,
  /minimal/i,
];

const PREFERRED_PATTERNS = [
  /diutamakan/i,
  /lebih disukai/i,
  /nilai tambah/i,
  /akan menjadi nilai tambah/i,
  /preferred/i,
  /nice to have/i,
  /bonus/i,
];

function isSectionHeading(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed) return false;

  const hasColon = /:\s*$/.test(trimmed);

  const normalized = trimmed
    .replace(/:\s*$/, '')
    .trim()
    .toLowerCase();

  if (!normalized) return false;

  // A sentence containing "wajib", "harus", or "nilai tambah"
  // is not automatically a section heading.
  // Section markers are recognized only when the line explicitly
  // ends with ":" or is an exact standalone heading.
  if (hasColon) {
    return true;
  }

  return /^(kualifikasi|persyaratan|requirements?|qualifications?|skills?|keahlian|benefits?|benefit|tambahan|preferensi|preferred)$/i.test(
    normalized
  );
}

function getHeadingMode(
  line: string
): 'required' | 'preferred' | null {
  const normalized = line
    .replace(/[::]\s*$/, '')
    .trim()
    .toLowerCase();

  if (!normalized) return null;

  const isPreferred = PREFERRED_PATTERNS.some(
    (pattern) => pattern.test(normalized)
  );

  if (isPreferred) return 'preferred';

  const isRequired = REQUIRED_PATTERNS.some(
    (pattern) => pattern.test(normalized)
  );

  if (
    isRequired ||
    /^(kualifikasi|persyaratan|requirements?|qualifications?|skills?|keahlian)\b/i.test(
      normalized
    )
  ) {
    return 'required';
  }

  if (
    /^(tambahan|preferensi|preferred|benefits?|benefit)\b/i.test(
      normalized
    )
  ) {
    return 'preferred';
  }

  return null;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/\r?\n|[.•-]/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0);
}

function looksLikeGenericVerb(word: string): boolean {
  if (word.length < 6) return false;

  return VERB_PREFIXES.some((prefix) => {
    if (!word.startsWith(prefix)) return false;

    const remainder = word.slice(prefix.length);
    return remainder.length >= 4;
  });
}

function isMeaningfulKeyword(word: string): boolean {
  if (word.length <= 2) return false;
  if (STOPWORDS.has(word)) return false;
  if (GENERIC_JD_WORDS.has(word)) return false;
  if (looksLikeGenericVerb(word)) return false;
  if (/^\d+$/.test(word)) return false;

  return true;
}

function extractCandidateWords(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(isMeaningfulKeyword);
}

const MULTI_WORD_KEYWORDS = [
  'machine learning',
  'deep learning',
  'project management',
  'product management',
  'data analysis',
  'data analytics',
  'data science',
  'data visualization',
  'business analysis',
  'business intelligence',
  'digital marketing',
  'social media',
  'software engineering',
  'software development',
  'web development',
  'mobile development',
  'frontend development',
  'backend development',
  'full stack',
  'full stack development',
  'user experience',
  'user interface',
  'ui design',
  'ux design',
  'user research',
  'design system',
  'natural language processing',
  'computer vision',
  'artificial intelligence',
  'power bi',
  'microsoft excel',
  'microsoft office',
  'visual basic',
  'rest api',
  'node.js',
  'react.js',
  'next.js',
  'vue.js',
  'angular.js',
];

function extractCandidateKeywords(sentence: string): string[] {
  const normalizedSentence = sentence
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const detectedPhrases: string[] = [];

  for (const phrase of MULTI_WORD_KEYWORDS) {
    if (normalizedSentence.includes(phrase)) {
      detectedPhrases.push(phrase);
    }
  }

  const phraseTokens = new Set(
    detectedPhrases.flatMap((phrase) => phrase.split(/\s+/))
  );

  const words = extractCandidateWords(sentence);

  const remainingWords = words.filter(
    (word) => !phraseTokens.has(word)
  );

  return [...detectedPhrases, ...remainingWords];
}

export function analyzeJobDescription(rawText: string): JDAnalysisResult {
  const keywordMap = new Map<string, boolean>();

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hasSectionHeadings = lines.some((line) => isSectionHeading(line));

  const addKeywords = (sentence: string, isRequired: boolean) => {
    const keywords = extractCandidateKeywords(sentence);

    for (const keyword of keywords) {
      const existing = keywordMap.get(keyword);

      if (
        existing === undefined ||
        (existing === false && isRequired)
      ) {
        keywordMap.set(keyword, isRequired);
      }
    }
  };

  if (!hasSectionHeadings) {
    // Preserve the original paragraph/sentence behavior.
    // Newlines are intentionally NOT sentence boundaries here.
    const sentences = splitIntoSentences(
      rawText.replace(/\r?\n/g, ' ')
    );

    for (const sentence of sentences) {
      const isPreferredSentence = PREFERRED_PATTERNS.some(
        (pattern) => pattern.test(sentence)
      );

      const isRequired = !isPreferredSentence;

      addKeywords(sentence, isRequired);
    }
  } else {
    // Section-aware mode is only activated when actual section headings exist.
    let currentSection: 'required' | 'preferred' | null = null;

    for (const line of lines) {
      if (isSectionHeading(line)) {
        currentSection = getHeadingMode(line);
        continue;
      }

      const sentences = splitIntoSentences(line);

      for (const sentence of sentences) {
        const isPreferredSentence = PREFERRED_PATTERNS.some(
          (pattern) => pattern.test(sentence)
        );

        const isRequiredSentence = REQUIRED_PATTERNS.some(
          (pattern) => pattern.test(sentence)
        );

        const isRequired =
          isPreferredSentence
            ? false
            : isRequiredSentence
              ? true
              : currentSection === 'required'
                ? true
                : currentSection === 'preferred'
                  ? false
                  : true;

        addKeywords(sentence, isRequired);
      }
    }
  }

  const keywords: ExtractedKeyword[] = Array.from(
    keywordMap.entries()
  )
    .map(([keyword, isRequired]) => ({
      keyword,
      isRequired,
    }))
    .sort(
      (a, b) =>
        Number(b.isRequired) - Number(a.isRequired)
    );

  const wordCount = rawText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

  return {
    rawText: rawText.trim(),
    keywords,
    wordCount,
  };
}

