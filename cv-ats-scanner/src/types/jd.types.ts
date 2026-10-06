export interface ExtractedKeyword {
  keyword: string;
  isRequired: boolean; // true = wajib/must-have, false = nice-to-have
}

export interface JDAnalysisResult {
  rawText: string;
  keywords: ExtractedKeyword[];
  wordCount: number;
}

export interface JDAnalyzeResponse {
  success: boolean;
  message: string;
  data?: JDAnalysisResult;
}