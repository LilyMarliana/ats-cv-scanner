import type { RoleMatchResult } from '../types/role.types';
import { normalizeSkill } from './skillEngine.service';
import { getRoleDefinition } from './roleEngine.service';

function normalizeSkillSet(skills: string[]): Set<string> {
  const normalizedSkills = new Set<string>();

  for (const skill of skills) {
    const canonical = normalizeSkill(skill);

    if (canonical) {
      normalizedSkills.add(canonical);
    }
  }

  return normalizedSkills;
}

export function matchSkillsToRole(
  cvSkills: string[],
  roleName: string
): RoleMatchResult | null {
  const role = getRoleDefinition(roleName);

  if (!role) {
    return null;
  }

  const cvSkillSet = normalizeSkillSet(cvSkills);

  const requiredSkills = normalizeSkillSet(
    role.requiredSkills
  );

  const preferredSkills = normalizeSkillSet(
    role.preferredSkills
  );

  const matchedRequired = [...requiredSkills].filter(
    (skill) => cvSkillSet.has(skill)
  );

  const missingRequired = [...requiredSkills].filter(
    (skill) => !cvSkillSet.has(skill)
  );

  const matchedPreferred = [...preferredSkills].filter(
    (skill) => cvSkillSet.has(skill)
  );

  const missingPreferred = [...preferredSkills].filter(
    (skill) => !cvSkillSet.has(skill)
  );

  const requiredScore =
    requiredSkills.size > 0
      ? Math.round(
          (matchedRequired.length / requiredSkills.size) * 100
        )
      : 100;

  const preferredScore =
    preferredSkills.size > 0
      ? Math.round(
          (matchedPreferred.length / preferredSkills.size) * 100
        )
      : 0;

  const matchScore =
    preferredSkills.size > 0
      ? Math.round(
          requiredScore * 0.8 +
            preferredScore * 0.2
        )
      : requiredScore;

  return {
    role: role.role,
    ...(role.experienceLevel !== undefined && {
      experienceLevel: role.experienceLevel,
    }),
    matchScore,
    requiredScore,
    preferredScore,
    matchedRequired: matchedRequired.sort(),
    missingRequired: missingRequired.sort(),
    matchedPreferred: matchedPreferred.sort(),
    missingPreferred: missingPreferred.sort(),
  };
}
