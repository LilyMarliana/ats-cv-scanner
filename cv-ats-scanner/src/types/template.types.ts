export interface JDTemplate {
  id: string;
  positionName: string;
  jdText: string;
  isPreset: boolean; // true = bawaan sistem, false = ditambahin HRD
}

export interface CreateTemplateBody {
  positionName: string;
  jdText: string;
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