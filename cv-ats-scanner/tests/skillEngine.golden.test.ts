import { describe, expect, it } from 'vitest';
import {
  normalizeSkill,
  normalizeSkills,
} from '../src/services/skillEngine.service';

describe('Skill Engine Golden Tests', () => {
  it('SKILL-01: React.js harus menjadi React', () => {
    expect(normalizeSkill('React.js')).toBe('react');
  });

  it('SKILL-02: ReactJS harus menjadi React', () => {
    expect(normalizeSkill('ReactJS')).toBe('react');
  });

  it('SKILL-03: JS harus menjadi JavaScript', () => {
    expect(normalizeSkill('JS')).toBe('javascript');
  });

  it('SKILL-04: Postgres harus menjadi PostgreSQL', () => {
    expect(normalizeSkill('Postgres')).toBe('sql');
  });

  it('SKILL-05: ML harus menjadi Machine Learning', () => {
    expect(normalizeSkill('ML')).toBe('machine learning');
  });

  it('SKILL-06: PowerBI harus menjadi Power BI', () => {
    expect(normalizeSkill('PowerBI')).toBe('power bi');
  });

  it('SKILL-07: skill tidak dikenal tidak boleh dipaksakan', () => {
    expect(normalizeSkill('skill-yang-tidak-ada')).toBeNull();
  });

  it('SKILL-08: duplikasi alias harus menghasilkan satu skill canonical', () => {
    expect(
      normalizeSkills([
        'React',
        'React.js',
        'ReactJS',
        'JavaScript',
        'JS',
      ])
    ).toEqual([
      {
        original: 'React',
        canonical: 'react',
      },
      {
        original: 'JavaScript',
        canonical: 'javascript',
      },
    ]);
  });
});
