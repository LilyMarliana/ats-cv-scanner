import type { Request, Response } from 'express';
import type { JDAnalyzeResponse } from '../types/jd.types';
import { analyzeJobDescription } from '../services/jdAnalyzer.service';

export const analyzeJD = (req: Request, res: Response<JDAnalyzeResponse>) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Teks job description tidak boleh kosong',
    });
  }

  const result = analyzeJobDescription(text);

  return res.status(200).json({
    success: true,
    message: 'Job description berhasil dianalisis',
    data: result,
  });
};