import type { ExtractedKeyword } from '../types/jd.types';
import type { KeywordMatchDetail, MatchingResult } from '../types/matching.types';

const MIN_SUBSTRING_LENGTH = 5;

function normalize(text: string): string {
  return text.toLowerCase();
}

function findMatchInText(keyword: string, cvWords: string[]): string | null {
  const normalizedKeyword = normalize(keyword).trim();
  const keywordWords = normalizedKeyword.split(/\s+/).filter(Boolean);

  // Multi-word keyword harus dicocokkan sebagai frasa lengkap.
  if (keywordWords.length > 1) {
    const keywordPhrase = keywordWords.join(' ');

    for (let i = 0; i <= cvWords.length - keywordWords.length; i++) {
      const candidatePhrase = cvWords
        .slice(i, i + keywordWords.length)
        .join(' ');

      if (candidatePhrase === keywordPhrase) {
        return candidatePhrase;
      }
    }

    return null;
  }

  // 1. Exact match
  const exactMatch = cvWords.find(
    (word) => word === normalizedKeyword
  );

  if (exactMatch) {
    return exactMatch;
  }

  // 2. Partial match untuk single-word keyword
  if (normalizedKeyword.length >= MIN_SUBSTRING_LENGTH) {
    const partialMatch = cvWords.find(
      (word) =>
        word.length >= MIN_SUBSTRING_LENGTH &&
        (word.includes(normalizedKeyword) ||
          normalizedKeyword.includes(word))
    );

    if (partialMatch) {
      return partialMatch;
    }
  }

  return null;
}

export function matchCVAgainstJD(
  cvText: string,
  jdKeywords: ExtractedKeyword[]
): MatchingResult {
  const cvWords = normalize(cvText)
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const matchedKeywords: KeywordMatchDetail[] = [];
  const missingKeywords: KeywordMatchDetail[] = [];

  for (const jdKeyword of jdKeywords) {
    const matchedWith = findMatchInText(
      jdKeyword.keyword,
      cvWords
    );

    const detail: KeywordMatchDetail = {
      keyword: jdKeyword.keyword,
      isRequired: jdKeyword.isRequired,
      isMatched: matchedWith !== null,
      ...(matchedWith && { matchedWith }),
    };

    if (detail.isMatched) {
      matchedKeywords.push(detail);
    } else {
      missingKeywords.push(detail);
    }
  }

  const requiredKeywords = jdKeywords.filter(
    (keyword) => keyword.isRequired
  );

  const preferredKeywords = jdKeywords.filter(
    (keyword) => !keyword.isRequired
  );

  const matchedRequired = matchedKeywords.filter(
    (keyword) => keyword.isRequired
  ).length;

  const matchedPreferred = matchedKeywords.filter(
    (keyword) => !keyword.isRequired
  ).length;

  const requiredScore =
    requiredKeywords.length > 0
      ? Math.round(
          (matchedRequired / requiredKeywords.length) * 100
        )
      : 100;

  const preferredScore =
    preferredKeywords.length > 0
      ? Math.round(
          (matchedPreferred / preferredKeywords.length) * 100
        )
      : 0;

  const overallScore =
    preferredKeywords.length > 0
      ? Math.round(
          requiredScore * 0.7 +
            preferredScore * 0.3
        )
      : requiredScore;

  return {
    overallScore,
    requiredScore,
    preferredScore,
    matchedKeywords,
    missingKeywords,
    totalRequired: requiredKeywords.length,
    totalPreferred: preferredKeywords.length,
  };
}
