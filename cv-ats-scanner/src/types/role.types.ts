export interface RoleDefinition {
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel?: string;
}

export interface RoleMatchResult {
  role: string;
  experienceLevel?: string;
  matchScore: number;
  requiredScore: number;
  preferredScore: number;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
}
