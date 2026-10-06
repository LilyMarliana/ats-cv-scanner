import type { CvQualityResult } from '../services/cvQuality.service';

export interface CVClassificationSummary {
  id?: string;

  filename: string;
  originalName: string;
  isLikelyFailed: boolean;
  layoutWarning?: string | undefined;

  bestMatch: {
    positionName: string;
    templateId: string;
    overallScore: number;
  };

  allScores: Array<{
    positionName: string;
    overallScore: number;
  }>;

  topMissingKeywords: string[];

  quality?: CvQualityResult;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;

  data?: {
    totalProcessed: number;
    totalFailed: number;
    results: CVClassificationSummary[];
  };
}