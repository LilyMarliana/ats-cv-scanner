export interface MatchResultDetail {
  id: string;
  overallScore: number;
  requiredScore: number;
  preferredScore: number;
  jdTemplate: {
    id: string;
    positionName: string;
    isPreset: boolean;
  };
}

export interface CvHistoryItem {
  id: string;
  filename: string;
  originalName: string;
  wordCount: number;
  isLikelyFailed: boolean;
  layoutWarning: string | null;
  createdAt: string;
  matchResults: MatchResultDetail[];
}

export interface CvHistoryResponse {
  success: boolean;
  message: string;
  data?: CvHistoryItem[];
}

export interface CvHistoryDetailResponse {
  success: boolean;
  message: string;
  data?: CvHistoryItem & { extractedText: string };
}