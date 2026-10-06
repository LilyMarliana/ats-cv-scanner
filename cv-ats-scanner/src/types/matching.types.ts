export interface KeywordMatchDetail {
  keyword: string;
  isRequired: boolean;
  isMatched: boolean;
  matchedWith?: string; // kata di CV yang cocok, kalau matched
}

export interface MatchingResult {
  overallScore: number; // 0-100
  requiredScore: number; // 0-100, khusus keyword wajib
  preferredScore: number; // 0-100, khusus keyword nice-to-have
  matchedKeywords: KeywordMatchDetail[];
  missingKeywords: KeywordMatchDetail[];
  totalRequired: number;
  totalPreferred: number;
}

export interface MatchRequestBody {
  cvText: string;
  jdText: string;
}

export interface MatchResponse {
  success: boolean;
  message: string;
  data?: MatchingResult;
}

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

export interface MatchRequestBody {
  cvText: string;
  jdText: string;
}

export interface MatchResponse {
  success: boolean;
  message: string;
  data?: MatchingResult;
}

export interface RankingResultItem {
  positionName: string;
  templateId: string;
  overallScore: number;
  requiredScore: number;
  preferredScore: number;
  missingRequiredKeywords: string[];
}

export interface RankAllResponse {
  success: boolean;
  message: string;
  data?: RankingResultItem[];
}