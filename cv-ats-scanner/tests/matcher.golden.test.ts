import { describe, it, expect } from 'vitest';
import { matchCVAgainstJD } from '../src/services/matcher.service';

describe('Golden Test - CV vs JD Matching', () => {
  it('GT-01: should return 100 when all required and preferred keywords match', () => {
    const cvText =
      'I have experience with HTML CSS JavaScript Git React TypeScript';

    const jdKeywords = [
      { keyword: 'HTML', isRequired: true },
      { keyword: 'CSS', isRequired: true },
      { keyword: 'JavaScript', isRequired: true },
      { keyword: 'Git', isRequired: true },
      { keyword: 'React', isRequired: false },
      { keyword: 'TypeScript', isRequired: false },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.preferredScore).toBe(100);
    expect(result.overallScore).toBe(100);
  });

  it('GT-02: should reduce score when one required keyword is missing', () => {
    const cvText =
      'I have experience with HTML CSS JavaScript React TypeScript';

    const jdKeywords = [
      { keyword: 'HTML', isRequired: true },
      { keyword: 'CSS', isRequired: true },
      { keyword: 'JavaScript', isRequired: true },
      { keyword: 'Git', isRequired: true },
      { keyword: 'React', isRequired: false },
      { keyword: 'TypeScript', isRequired: false },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(75);
    expect(result.preferredScore).toBe(100);
    expect(result.overallScore).toBe(83);
  });

  it('GT-03: should not match SQL against PostgreSQL', () => {
    const cvText =
      'I have experience with JavaScript and PostgreSQL';

    const jdKeywords = [
      { keyword: 'SQL', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(0);
    expect(result.overallScore).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
    expect(result.missingKeywords).toHaveLength(1);
  });

  it('GT-04: should match SQL when SQL is explicitly present', () => {
    const cvText =
      'I have experience with SQL, JavaScript, and PostgreSQL';

    const jdKeywords = [
      { keyword: 'SQL', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.matchedKeywords).toHaveLength(1);
    expect(result.missingKeywords).toHaveLength(0);
  });

  it('GT-05: should apply the 70/30 weighting when required matches but preferred does not', () => {
    const cvText =
      'I have experience with HTML CSS JavaScript Git';

    const jdKeywords = [
      { keyword: 'HTML', isRequired: true },
      { keyword: 'CSS', isRequired: true },
      { keyword: 'JavaScript', isRequired: true },
      { keyword: 'Git', isRequired: true },
      { keyword: 'React', isRequired: false },
      { keyword: 'TypeScript', isRequired: false },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.preferredScore).toBe(0);
    expect(result.overallScore).toBe(70);
  });

  it('GT-06: should not match Java against JavaScript', () => {
    const cvText =
      'I have experience with JavaScript and React';

    const jdKeywords = [
      { keyword: 'Java', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(0);
    expect(result.overallScore).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
    expect(result.missingKeywords).toHaveLength(1);
  });

  it('GT-07: should match the multi-word skill Machine Learning', () => {
    const cvText =
      'I have experience in Machine Learning and Python';

    const jdKeywords = [
      { keyword: 'Machine Learning', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.matchedKeywords).toHaveLength(1);
    expect(result.missingKeywords).toHaveLength(0);
  });

  it('GT-08: should not match Machine Learning against Machine alone', () => {
    const cvText =
      'I have experience working with Machine';

    const jdKeywords = [
      { keyword: 'Machine Learning', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(0);
    expect(result.overallScore).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
    expect(result.missingKeywords).toHaveLength(1);
  });

  it('GT-09: should match JavaScript regardless of letter case', () => {
    const cvText =
      'I have experience with JAVASCRIPT and React';

    const jdKeywords = [
      { keyword: 'JavaScript', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.matchedKeywords).toHaveLength(1);
  });

  it('GT-10: should match keywords when CV contains punctuation', () => {
    const cvText =
      'Skills: HTML, CSS, JavaScript, Git.';

    const jdKeywords = [
      { keyword: 'HTML', isRequired: true },
      { keyword: 'CSS', isRequired: true },
      { keyword: 'JavaScript', isRequired: true },
      { keyword: 'Git', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.matchedKeywords).toHaveLength(4);
  });

  it('GT-11: should match React when CV contains React.js', () => {
    const cvText =
      'I have professional experience building applications with React.js';

    const jdKeywords = [
      { keyword: 'React', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.matchedKeywords).toHaveLength(1);
  });

  it('GT-12: should not match SQL against unrelated words containing SQL-like text', () => {
    const cvText =
      'I have experience with sequel and database systems';

    const jdKeywords = [
      { keyword: 'SQL', isRequired: true },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(0);
    expect(result.overallScore).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
    expect(result.missingKeywords).toHaveLength(1);
  });

  it('GT-13: should match multiple required and preferred keywords independently', () => {
    const cvText =
      'I have experience with Python, SQL, Excel, Power BI and statistics';

    const jdKeywords = [
      { keyword: 'Python', isRequired: true },
      { keyword: 'SQL', isRequired: true },
      { keyword: 'Excel', isRequired: true },
      { keyword: 'Statistics', isRequired: true },
      { keyword: 'Power BI', isRequired: false },
      { keyword: 'Tableau', isRequired: false },
    ];

    const result = matchCVAgainstJD(cvText, jdKeywords);

    expect(result.requiredScore).toBe(100);
    expect(result.preferredScore).toBe(50);
    expect(result.overallScore).toBe(85);
    expect(result.matchedKeywords).toHaveLength(5);
    expect(result.missingKeywords).toHaveLength(1);
  });
});
