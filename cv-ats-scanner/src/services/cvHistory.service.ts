import { prisma } from '../utils/prismaClient';

export interface SaveCvUploadInput {
  filename: string;
  originalName: string;
  extractedText: string;
  wordCount: number;
  isLikelyFailed: boolean;
  layoutWarning?: string;
}

export interface SaveMatchResultInput {
  cvUploadId: string;
  jdTemplateId: string;
  overallScore: number;
  requiredScore: number;
  preferredScore: number;
}

export async function saveCvUpload(input: SaveCvUploadInput) {
  return prisma.cvUpload.create({
    data: {
      filename: input.filename,
      originalName: input.originalName,
      extractedText: input.extractedText,
      wordCount: input.wordCount,
      isLikelyFailed: input.isLikelyFailed,
      ...(input.layoutWarning && { layoutWarning: input.layoutWarning }),
    },
  });
}

export async function saveMatchResults(results: SaveMatchResultInput[]) {
  if (results.length === 0) return;

  return prisma.cvMatchResult.createMany({
    data: results,
  });
}

export async function getCvHistory() {
  return prisma.cvUpload.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      matchResults: {
        include: { jdTemplate: true },
        orderBy: { overallScore: 'desc' },
      },
    },
  });
}

export async function getCvById(id: string) {
  return prisma.cvUpload.findUnique({
    where: { id },
    include: {
      matchResults: {
        include: { jdTemplate: true },
        orderBy: { overallScore: 'desc' },
      },
    },
  });
}

export async function deleteCvUpload(id: string): Promise<boolean> {
  try {
    await prisma.cvUpload.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}