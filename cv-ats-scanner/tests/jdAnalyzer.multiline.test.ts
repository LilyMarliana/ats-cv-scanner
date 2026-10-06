import { describe, expect, it } from 'vitest';
import { analyzeJobDescription } from '../src/services/jdAnalyzer.service';

describe('JD Analyzer - multiline sections', () => {
  it('should classify multiline required and preferred skills correctly', () => {
    const jd = [
      'Kualifikasi Wajib:',
      'Laravel',
      'MySQL',
      'REST API',
      'Nilai Tambah:',
      'Docker',
      'Kubernetes',
    ].join('\n');

    const result = analyzeJobDescription(jd);

    const getKeyword = (keyword: string) =>
      result.keywords.find((item) => item.keyword === keyword);

    expect(getKeyword('laravel')?.isRequired).toBe(true);
    expect(getKeyword('mysql')?.isRequired).toBe(true);
    expect(getKeyword('rest api')?.isRequired).toBe(true);

    expect(getKeyword('docker')?.isRequired).toBe(false);
    expect(getKeyword('kubernetes')?.isRequired).toBe(false);

    expect(getKeyword('kualifikasi')).toBeUndefined();
  });
});
