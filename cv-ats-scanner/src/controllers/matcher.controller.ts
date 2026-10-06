import type { Request, Response } from 'express';
import type { MatchResponse, RankAllResponse, RankingResultItem } from '../types/matching.types';
import { analyzeJobDescription } from '../services/jdAnalyzer.service';
import { matchCVAgainstJD } from '../services/matcher.service';
import { getAllTemplates } from '../services/templateStore.service';

export const matchCVAndJD = (req: Request, res: Response<MatchResponse>) => {
  const { cvText, jdText } = req.body;

  if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'cvText tidak boleh kosong' });
  }
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'jdText tidak boleh kosong' });
  }

  const jdAnalysis = analyzeJobDescription(jdText);
  const matchResult = matchCVAgainstJD(cvText, jdAnalysis.keywords);

  return res.status(200).json({
    success: true,
    message: 'Berhasil membandingkan CV dengan job description',
    data: matchResult,
  });
};

export const rankCVAgainstAllTemplates = async (req: Request, res: Response<RankAllResponse>) => {
  const { cvText } = req.body;

  if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'cvText tidak boleh kosong' });
  }

  const templates = await getAllTemplates();

  const results: RankingResultItem[] = templates.map((template) => {
    const jdAnalysis = analyzeJobDescription(template.jdText);
    const matchResult = matchCVAgainstJD(cvText, jdAnalysis.keywords);

    return {
      positionName: template.positionName,
      templateId: template.id,
      overallScore: matchResult.overallScore,
      requiredScore: matchResult.requiredScore,
      preferredScore: matchResult.preferredScore,
      missingRequiredKeywords: matchResult.missingKeywords
        .filter((k) => k.isRequired)
        .map((k) => k.keyword),
    };
  });

  results.sort((a, b) => b.overallScore - a.overallScore);

  return res.status(200).json({
    success: true,
    message: 'Berhasil membandingkan CV terhadap semua posisi',
    data: results,
  });
};