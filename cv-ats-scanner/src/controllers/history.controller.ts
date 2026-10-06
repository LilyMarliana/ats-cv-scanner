import type { Request, Response } from 'express';
import { getCvHistory, getCvById, deleteCvUpload } from '../services/cvHistory.service';

export const listCvHistory = async (req: Request, res: Response) => {
  const history = await getCvHistory();

  return res.status(200).json({
    success: true,
    message: 'Berhasil mengambil riwayat CV',
    data: history,
  });
};

export const getCvDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cv = await getCvById(id as string);

  if (!cv) {
    return res.status(404).json({ success: false, message: 'CV tidak ditemukan' });
  }

  return res.status(200).json({
    success: true,
    message: 'Berhasil mengambil detail CV',
    data: cv,
  });
};

export const deleteCv = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await deleteCvUpload(id as string);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'CV tidak ditemukan' });
  }

  return res.status(200).json({ success: true, message: 'CV berhasil dihapus dari riwayat' });
};