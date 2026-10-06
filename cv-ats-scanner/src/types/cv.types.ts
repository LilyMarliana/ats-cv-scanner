import type { DetectedSection, LayoutAnalysis } from '../services/sectionDetector.service';
import type { CvQualityResult } from '../services/cvQuality.service';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    extractedText?: string;
    wordCount?: number;
    isLikelyFailed?: boolean;
    sections?: DetectedSection[];
    layoutAnalysis?: LayoutAnalysis;
    quality?: CvQualityResult;
    warning?: string | undefined;
  };
}