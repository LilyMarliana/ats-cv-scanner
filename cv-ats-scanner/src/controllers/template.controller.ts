import type { Request, Response } from 'express';
import {
  getAllTemplates,
  addCustomTemplate,
  updateTemplate,
  removeTemplate,
} from '../services/templateStore.service';

export const listTemplates = async (req: Request, res: Response) => {
  const templates = await getAllTemplates();
  return res.status(200).json({
    success: true,
    message: 'Berhasil mengambil daftar template',
    data: templates,
  });
};

export const createTemplate = async (req: Request, res: Response) => {
  const { positionName, jdText } = req.body;

  if (!positionName || typeof positionName !== 'string' || positionName.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'positionName tidak boleh kosong' });
  }
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'jdText tidak boleh kosong' });
  }

  const newTemplate = await addCustomTemplate({ positionName, jdText });

  return res.status(201).json({
    success: true,
    message: `Template posisi "${newTemplate.positionName}" berhasil ditambahkan`,
    data: newTemplate,
  });
};

export const editTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positionName, jdText } = req.body;

  if (!positionName || typeof positionName !== 'string' || positionName.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'positionName tidak boleh kosong' });
  }
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'jdText tidak boleh kosong' });
  }

  const updated = await updateTemplate(id as string, { positionName, jdText });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
  }

  return res.status(200).json({
    success: true,
    message: `Template posisi "${updated.positionName}" berhasil diperbarui`,
    data: updated,
  });
};

export const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await removeTemplate(id as string);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
  }

  return res.status(200).json({ success: true, message: 'Template berhasil dihapus' });
};