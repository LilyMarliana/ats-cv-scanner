import { extractTextFromFile } from './extractText.service';
import { analyzeJobDescription } from './jdAnalyzer.service';
import { matchCVAgainstJD } from './matcher.service';
import { getAllTemplates } from './templateStore.service';
import { saveCvUpload, saveMatchResults } from './cvHistory.service';
import type { CVClassificationSummary } from '../types/bulkCv.types';

export async function classifySingleCV(
  filePath: string,
  filename: string,
  originalName: string
): Promise<CVClassificationSummary> {
  const { text, wordCount, isLikelyFailed } = await extractTextFromFile(filePath);

  const templates = await getAllTemplates();

  const allResults = templates.map((template) => {
    const jdAnalysis = analyzeJobDescription(template.jdText);
    const matchResult = matchCVAgainstJD(text, jdAnalysis.keywords);

    return {
      positionName: template.positionName,
      templateId: template.id,
      overallScore: matchResult.overallScore,
      requiredScore: matchResult.requiredScore,
      preferredScore: matchResult.preferredScore,
      missingRequired: matchResult.missingKeywords
        .filter((k) => k.isRequired)
        .map((k) => k.keyword),
    };
  });

  allResults.sort((a, b) => b.overallScore - a.overallScore);

  const best = allResults[0];

  const layoutWarning =
    isLikelyFailed && wordCount < 30
      ? 'CV ini kemungkinan gagal diekstrak (kosong atau hasil scan/gambar).'
      : undefined;

  // Simpan CV ke database terlebih dahulu
  const savedCv = await saveCvUpload({
    filename,
    originalName,
    extractedText: text,
    wordCount,
    isLikelyFailed,
    ...(layoutWarning && { layoutWarning }),
  });

  // Simpan seluruh hasil matching
  await saveMatchResults(
    allResults.map((r) => ({
      cvUploadId: savedCv.id,
      jdTemplateId: r.templateId,
      overallScore: r.overallScore,
      requiredScore: r.requiredScore,
      preferredScore: r.preferredScore,
    }))
  );

  return {
    // ID ini yang sekarang dikirim ke frontend
    id: savedCv.id,

    filename,
    originalName,
    isLikelyFailed,

    ...(layoutWarning && { layoutWarning }),

    bestMatch: {
      positionName: best?.positionName ?? 'Tidak diketahui',
      templateId: best?.templateId ?? '',
      overallScore: best?.overallScore ?? 0,
    },

    allScores: allResults.map((r) => ({
      positionName: r.positionName,
      overallScore: r.overallScore,
    })),

    topMissingKeywords: best?.missingRequired.slice(0, 5) ?? [],
  };
}