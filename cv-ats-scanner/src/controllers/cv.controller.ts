import type { Request, Response } from 'express';
import type { UploadResponse } from '../types/cv.types';
import { extractTextFromFile } from '../services/extractText.service';
import { detectSections, analyzeLayoutQuality } from '../services/sectionDetector.service';
import { analyzeCvQuality } from '../services/cvQuality.service';

export const uploadCV = async (req: Request, res: Response<UploadResponse>) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Tidak ada file yang diupload',
    });
  }

  try {
    const { text, rawTextWithLines, wordCount, isLikelyFailed } = await extractTextFromFile(
      req.file.path
    );
    const sections = detectSections(rawTextWithLines);
    const layoutAnalysis = analyzeLayoutQuality(sections);
    const quality = analyzeCvQuality(rawTextWithLines, text, sections);

    const warnings: string[] = [];
    if (isLikelyFailed) {
      warnings.push(
        'CV ini kemungkinan berupa hasil scan/gambar, kosong, atau gagal diekstrak. Coba upload versi PDF yang teksnya bisa di-select/copy langsung.'
      );
    }
    if (layoutAnalysis.isProbablyComplexLayout) {
      warnings.push(
        `CV ini kemungkinan menggunakan layout multi-kolom yang sulit dibaca sistem ATS. ${layoutAnalysis.reason} Pertimbangkan menggunakan format 1 kolom untuk hasil analisis yang lebih akurat.`
      );
    }

    return res.status(200).json({
      success: true,
      message:
        warnings.length > 0
          ? 'File berhasil diupload, tapi ada beberapa hal yang perlu diperhatikan'
          : 'File berhasil diupload dan teks berhasil diekstrak',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        extractedText: text,
        wordCount,
        isLikelyFailed,
        sections,
        layoutAnalysis,
        quality,
        ...(warnings.length > 0 && { warning: warnings.join(' ') }),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Gagal mengekstrak teks: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
};