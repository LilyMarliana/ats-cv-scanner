export interface CvQualityResult {
  atsScore: number;
  formattingScore: number;
  contentScore: number;
  completenessScore: number;
  issues: string[];
  recommendations: string[];
}

export interface AllScoreItem {
  positionName: string;
  overallScore: number;
}

export interface BestMatch {
  positionName: string;
  templateId: string;
  overallScore: number;
}

export interface CVClassificationSummary {
  /**
   * ID CV di database.
   * Hanya tersedia jika CV berhasil disimpan.
   */
  id?: string;

  filename: string;
  originalName: string;
  isLikelyFailed: boolean;
  layoutWarning?: string;

  bestMatch: BestMatch;

  allScores: AllScoreItem[];

  topMissingKeywords: string[];

  /**
   * Hasil analisis kualitas CV.
   */
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