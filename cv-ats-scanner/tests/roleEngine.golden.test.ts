import { describe, expect, it } from 'vitest';
import {
  getRoleDefinition,
  getRoleDefinitions,
} from '../src/services/roleEngine.service';

describe('Role Engine Golden Tests', () => {
  it('ROLE-01: harus memiliki 4 role awal', () => {
    expect(getRoleDefinitions()).toHaveLength(4);
  });

  it('ROLE-02: Data Analyst harus memiliki required skills yang benar', () => {
    expect(getRoleDefinition('Data Analyst')).toEqual({
      role: 'Data Analyst',
      requiredSkills: [
        'python',
        'sql',
        'excel',
        'statistics',
      ],
      preferredSkills: [
        'power bi',
        'tableau',
      ],
      experienceLevel: 'Fresher',
    });
  });

  it('ROLE-03: ML Engineer harus memiliki Machine Learning', () => {
    const role = getRoleDefinition('ML Engineer');

    expect(role?.requiredSkills).toContain('machine learning');
    expect(role?.requiredSkills).toContain('python');
  });

  it('ROLE-04: Business Analyst harus memiliki Communication', () => {
    const role = getRoleDefinition('Business Analyst');

    expect(role?.requiredSkills).toContain('communication');
    expect(role?.requiredSkills).toContain('sql');
  });

  it('ROLE-05: Data Scientist harus membutuhkan 4 required skills', () => {
    const role = getRoleDefinition('Data Scientist');

    expect(role?.requiredSkills).toEqual([
      'python',
      'machine learning',
      'statistics',
      'sql',
    ]);
  });

  it('ROLE-06: role tidak dikenal harus menghasilkan null', () => {
    expect(getRoleDefinition('Role Tidak Ada')).toBeNull();
  });

  it('ROLE-07: pencarian role harus case-insensitive', () => {
    expect(getRoleDefinition('data analyst')?.role).toBe(
      'Data Analyst'
    );
  });

  it('ROLE-08: hasil role tidak boleh membagikan reference array internal', () => {
    const first = getRoleDefinition('Data Analyst');
    const second = getRoleDefinition('Data Analyst');

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    first!.requiredSkills.push('fake-skill');

    expect(second!.requiredSkills).not.toContain(
      'fake-skill'
    );
  });
});
