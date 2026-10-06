import type { Request, Response } from 'express';
import type { BulkUploadResponse } from '../types/bulkCv.types';
import { classifySingleCV } from '../services/bulkClassifier.service';

export const bulkUploadCV = async (req: Request, res: Response<BulkUploadResponse>) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Tidak ada file yang diupload',
    });
  }

  const results = [];
  let totalFailed = 0;

  for (const file of files) {
    try {
      const summary = await classifySingleCV(file.path, file.filename, file.originalname);
      results.push(summary);
      if (summary.isLikelyFailed) totalFailed++;
    } catch (error) {
      totalFailed++;
      results.push({
        filename: file.filename,
        originalName: file.originalname,
        isLikelyFailed: true,
        layoutWarning: `Gagal memproses file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        bestMatch: { positionName: 'Tidak diketahui', templateId: '', overallScore: 0 },
        allScores: [],
        topMissingKeywords: [],
      });
    }
  }

  results.sort((a, b) => b.bestMatch.overallScore - a.bestMatch.overallScore);

  return res.status(200).json({
    success: true,
    message: `Berhasil memproses ${files.length} CV`,
    data: {
      totalProcessed: files.length,
      totalFailed,
      results,
    },
  });
};