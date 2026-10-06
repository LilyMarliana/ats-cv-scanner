import { describe, expect, it } from 'vitest';
import { matchSkillsToRole } from '../src/services/roleMatcher.service';

const dataAnalystCvSkills = [
  'Python',
  'SQL',
  'Excel',
  'Statistics',
  'Power BI',
];

describe('Role Matcher Golden Tests', () => {
  it('MATCH-01: Data Analyst harus menghasilkan 90%', () => {
    const result = matchSkillsToRole(
      dataAnalystCvSkills,
      'Data Analyst'
    );

    expect(result).not.toBeNull();
    expect(result?.matchScore).toBe(90);
    expect(result?.requiredScore).toBe(100);
    expect(result?.preferredScore).toBe(50);
  });

  it('MATCH-02: ML Engineer harus menghasilkan 54%', () => {
    const result = matchSkillsToRole(
      dataAnalystCvSkills,
      'ML Engineer'
    );

    expect(result).not.toBeNull();
    expect(result?.matchScore).toBe(54);
    expect(result?.requiredScore).toBe(67);
    expect(result?.preferredScore).toBe(0);
    expect(result?.matchedRequired).toEqual([
      'python',
      'statistics',
    ]);
    expect(result?.missingRequired).toEqual([
      'machine learning',
    ]);
  });

  it('MATCH-03: Business Analyst harus menghasilkan 74%', () => {
    const result = matchSkillsToRole(
      dataAnalystCvSkills,
      'Business Analyst'
    );

    expect(result).not.toBeNull();
    expect(result?.matchScore).toBe(74);
    expect(result?.requiredScore).toBe(67);
    expect(result?.preferredScore).toBe(100);
    expect(result?.matchedRequired).toEqual([
      'excel',
      'sql',
    ]);
    expect(result?.missingRequired).toEqual([
      'communication',
    ]);
  });

  it('MATCH-04: Data Scientist harus menghasilkan 60%', () => {
    const result = matchSkillsToRole(
      dataAnalystCvSkills,
      'Data Scientist'
    );

    expect(result).not.toBeNull();
    expect(result?.matchScore).toBe(60);
    expect(result?.requiredScore).toBe(75);
    expect(result?.preferredScore).toBe(0);
  });

  it('MATCH-05: ML harus dikenali sebagai Machine Learning', () => {
    const result = matchSkillsToRole(
      [
        'Python',
        'ML',
        'Statistics',
      ],
      'ML Engineer'
    );

    expect(result?.matchedRequired).toEqual([
      'machine learning',
      'python',
      'statistics',
    ]);

    expect(result?.missingRequired).toEqual([]);
  });

  it('MATCH-06: role yang tidak dikenal harus menghasilkan null', () => {
    expect(
      matchSkillsToRole(
        dataAnalystCvSkills,
        'Role Tidak Ada'
      )
    ).toBeNull();
  });

  it('MATCH-07: skill yang tidak dikenal tidak boleh dihitung', () => {
    const result = matchSkillsToRole(
      [
        'Python',
        'SQL',
        'Excel',
        'Statistics',
        'Power BI',
        'Skill Tidak Dikenal',
      ],
      'Data Analyst'
    );

    expect(result?.matchScore).toBe(90);
  });
});
