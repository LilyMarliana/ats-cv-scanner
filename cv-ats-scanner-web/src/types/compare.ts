export interface KeywordMatchDetail {
  keyword: string;
  isRequired: boolean;
  isMatched: boolean;
  matchedWith?: string;
}

export interface MatchingResult {
  overallScore: number;
  requiredScore: number;
  preferredScore: number;
  matchedKeywords: KeywordMatchDetail[];
  missingKeywords: KeywordMatchDetail[];
  totalRequired: number;
  totalPreferred: number;
}

export interface CompareResponse {
  success: boolean;
  message: string;
  data?: MatchingResult;
}