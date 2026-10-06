import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractResult {
  text: string;
  rawTextWithLines: string;
  wordCount: number;
  isLikelyFailed: boolean;
}

const MIN_WORD_THRESHOLD = 30;

function removePageMarkers(text: string): string {
  return text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '');
}

export async function extractTextFromFile(filePath: string): Promise<ExtractResult> {
  const ext = path.extname(filePath).toLowerCase();

  let rawText = '';

  if (ext === '.pdf') {
    const fileBuffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    rawText = result.text;
  } else if (ext === '.docx') {
    const fileBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    rawText = result.value;
  } else {
    throw new Error(`Tipe file tidak didukung: ${ext}`);
  }

  const withoutMarkers = removePageMarkers(rawText);

  // Versi 1: masih ada baris (\n), dipakai buat section detection
  const rawTextWithLines = withoutMarkers
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  // Versi 2: diratain jadi 1 baris, dipakai buat tampilan/analisis kata
  const cleanedText = withoutMarkers.trim().replace(/\s+/g, ' ');
  const wordCount = cleanedText.length > 0 ? cleanedText.split(' ').length : 0;

  const isLikelyFailed = wordCount < MIN_WORD_THRESHOLD;

  return {
    text: cleanedText,
    rawTextWithLines,
    wordCount,
    isLikelyFailed,
  };
}