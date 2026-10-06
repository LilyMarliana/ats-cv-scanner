import { describe, it, expect } from 'vitest';
import { analyzeJobDescription } from '../src/services/jdAnalyzer.service';

describe('Golden Test - JD Analyzer', () => {
  it('JD-01: should detect required keywords from a required sentence', () => {
    const jd = `
      Kandidat wajib menguasai Python, SQL, dan Excel.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'python',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'sql',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'excel',
      isRequired: true,
    });
  });

  it('JD-02: should mark preferred keywords correctly', () => {
    const jd = `
      Kandidat wajib menguasai Python dan SQL.
      React dan TypeScript diutamakan.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'python',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'sql',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'react',
      isRequired: false,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'typescript',
      isRequired: false,
    });
  });

  it('JD-03: should not include common stopwords as keywords', () => {
    const jd = `
      Kandidat wajib memiliki pengalaman bekerja
      dengan Python dan SQL.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).not.toContainEqual({
      keyword: 'dengan',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'dan',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'untuk',
      isRequired: true,
    });
  });

  it('JD-04: should preserve multi-word skill Machine Learning', () => {
    const jd = `
      Kandidat wajib memiliki pengalaman dalam Machine Learning dan Python.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'machine learning',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'python',
      isRequired: true,
    });
  });

  it('JD-05: should preserve multi-word skills Project Management and Microsoft Excel', () => {
    const jd = `
      Kandidat wajib memiliki kemampuan Project Management
      dan Microsoft Excel.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'project management',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'microsoft excel',
      isRequired: true,
    });
  });

  it('JD-06: should not treat a partial word as a multi-word skill', () => {
    const jd = `
      Kandidat wajib memiliki kemampuan Machine.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).not.toContainEqual({
      keyword: 'machine learning',
      isRequired: true,
    });
  });

  it('JD-07: should not treat generic experience words as required keywords', () => {
    const jd = `
      Kami mencari IT Support yang wajib memiliki pengalaman minimal 1 tahun
      menangani troubleshooting hardware dan software.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).not.toContainEqual({
      keyword: 'tahun',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'support',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'troubleshooting',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'hardware',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'software',
      isRequired: true,
    });
  });

  it('JD-08: should preserve meaningful multi-word skills from the Staff Administrasi preset', () => {
    const jd = `
      Kandidat harus menguasai Microsoft Office terutama Excel dan Word,
      serta memiliki kemampuan pengelolaan dokumen dan pengarsipan yang rapi.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'microsoft office',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'excel',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'word',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'rapi',
      isRequired: true,
    });
  });

  it('JD-09: should not treat generic HRD words as skills', () => {
    const jd = `
      Pemahaman tentang regulasi ketenagakerjaan dan pengalaman menggunakan HRIS
      akan menjadi nilai tambah.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).not.toContainEqual({
      keyword: 'pemahaman',
      isRequired: false,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'tentang',
      isRequired: false,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'regulasi',
      isRequired: false,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'ketenagakerjaan',
      isRequired: false,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'hris',
      isRequired: false,
    });
  });

  it('JD-10: should not treat generic audit descriptors as skills', () => {
    const jd = `
      Kandidat harus menguasai standar akuntansi, analisis laporan keuangan,
      dan penyusunan laporan audit. Wajib teliti dan memiliki kemampuan analitis
      yang kuat.
    `;

    const result = analyzeJobDescription(jd);

    expect(result.keywords).toContainEqual({
      keyword: 'akuntansi',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'analisis',
      isRequired: true,
    });

    expect(result.keywords).toContainEqual({
      keyword: 'laporan',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'teliti',
      isRequired: true,
    });

    expect(result.keywords).not.toContainEqual({
      keyword: 'kuat',
      isRequired: true,
    });
  });
});