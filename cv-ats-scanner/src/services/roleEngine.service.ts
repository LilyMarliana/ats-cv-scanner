import type { RoleDefinition } from '../types/role.types';

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
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
  },
  {
    role: 'ML Engineer',
    requiredSkills: [
      'python',
      'machine learning',
      'statistics',
    ],
    preferredSkills: [
      'deep learning',
      'natural language processing',
    ],
    experienceLevel: 'Junior',
  },
  {
    role: 'Business Analyst',
    requiredSkills: [
      'excel',
      'communication',
      'sql',
    ],
    preferredSkills: [
      'power bi',
      'statistics',
    ],
    experienceLevel: 'Fresher',
  },
  {
    role: 'Data Scientist',
    requiredSkills: [
      'python',
      'machine learning',
      'statistics',
      'sql',
    ],
    preferredSkills: [
      'deep learning',
      'natural language processing',
    ],
    experienceLevel: 'Junior',
  },
];

export function getRoleDefinitions(): RoleDefinition[] {
  return ROLE_DEFINITIONS.map((role) => ({
    ...role,
    requiredSkills: [...role.requiredSkills],
    preferredSkills: [...role.preferredSkills],
  }));
}

export function getRoleDefinition(
  roleName: string
): RoleDefinition | null {
  const normalizedRole = roleName.trim().toLowerCase();

  const role = ROLE_DEFINITIONS.find(
    (definition) =>
      definition.role.toLowerCase() === normalizedRole
  );

  if (!role) {
    return null;
  }

  return {
    ...role,
    requiredSkills: [...role.requiredSkills],
    preferredSkills: [...role.preferredSkills],
  };
}
