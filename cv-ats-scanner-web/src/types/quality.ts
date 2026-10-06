export type FactorKey = 'kuantitatif' | 'panjang' | 'bullet' | 'kelengkapan';

export interface QualityFactor {
  key: FactorKey;
  label: string;
  score: number;
  detail: string;
}

export interface QualityTip {
  factor: FactorKey;
  text: string;
}

export interface CvQuality {
  atsScore: number;
  verdict: 'bagus' | 'cukup' | 'perlu_perbaikan';
  headline: string;
  factors: QualityFactor[];
  catatan: string;
  tips: QualityTip[];
  stats: {
    wordCount: number;
    bulletCount: number;
    bulletWithNumberCount: number;
    avgBulletWords: number;
    hasEmail: boolean;
    hasPhone: boolean;
    missingSections: string[];
  };
}