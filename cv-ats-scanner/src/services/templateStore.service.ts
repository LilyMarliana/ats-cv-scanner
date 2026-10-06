import { prisma } from '../utils/prismaClient';
import type { JDTemplate, CreateTemplateBody } from '../types/template.types';

export async function getAllTemplates(): Promise<JDTemplate[]> {
  return prisma.jDTemplate.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function addCustomTemplate(body: CreateTemplateBody): Promise<JDTemplate> {
  return prisma.jDTemplate.create({
    data: {
      positionName: body.positionName.trim(),
      jdText: body.jdText.trim(),
      isPreset: false,
    },
  });
}

export async function updateTemplate(
  id: string,
  body: CreateTemplateBody
): Promise<JDTemplate | null> {
  try {
    return await prisma.jDTemplate.update({
      where: { id },
      data: {
        positionName: body.positionName.trim(),
        jdText: body.jdText.trim(),
      },
    });
  } catch {
    return null; // record dengan id itu gak ketemu
  }
}

export async function removeTemplate(id: string): Promise<boolean> {
  try {
    await prisma.jDTemplate.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}