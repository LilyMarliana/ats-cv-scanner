export interface SkillDefinition {
  canonical: string;
  aliases: string[];
}

export interface NormalizedSkill {
  original: string;
  canonical: string;
}

const SKILL_DEFINITIONS: SkillDefinition[] = [
  {
    canonical: 'python',
    aliases: ['python', 'python programming', 'py'],
  },
  {
    canonical: 'sql',
    aliases: ['sql', 'structured query language', 'mysql', 'postgres', 'postgresql'],
  },
  {
    canonical: 'machine learning',
    aliases: ['machine learning', 'machine-learning', 'ml'],
  },
  {
    canonical: 'deep learning',
    aliases: ['deep learning', 'dl', 'neural networks'],
  },
  {
    canonical: 'natural language processing',
    aliases: ['natural language processing', 'nlp'],
  },
  {
    canonical: 'javascript',
    aliases: ['javascript', 'js'],
  },
  {
    canonical: 'typescript',
    aliases: ['typescript', 'ts'],
  },
  {
    canonical: 'react',
    aliases: ['react', 'reactjs', 'react.js'],
  },
  {
    canonical: 'node.js',
    aliases: ['node.js', 'nodejs', 'node'],
  },
  {
    canonical: 'html',
    aliases: ['html', 'html5'],
  },
  {
    canonical: 'css',
    aliases: ['css', 'css3'],
  },
  {
    canonical: 'git',
    aliases: ['git', 'git version control'],
  },
  {
    canonical: 'excel',
    aliases: ['excel', 'microsoft excel', 'ms excel'],
  },
  {
    canonical: 'power bi',
    aliases: ['power bi', 'powerbi', 'power-bi'],
  },
  {
    canonical: 'tableau',
    aliases: ['tableau'],
  },
  {
    canonical: 'statistics',
    aliases: ['statistics', 'statistical analysis', 'stats'],
  },
  {
    canonical: 'data analysis',
    aliases: ['data analysis', 'data analytics', 'data analyst'],
  },
  {
    canonical: 'data science',
    aliases: ['data science', 'data scientist'],
  },
  {
    canonical: 'database',
    aliases: ['database', 'databases', 'basis data'],
  },
  {
    canonical: 'api',
    aliases: ['api', 'application programming interface'],
  },
  {
    canonical: 'rest api',
    aliases: ['rest api', 'restful api', 'rest'],
  },
  {
    canonical: 'programming',
    aliases: ['programming', 'pemrograman'],
  },
  {
    canonical: 'communication',
    aliases: ['communication', 'verbal communication', 'presentation'],
  },
  {
    canonical: 'ui design',
    aliases: ['ui design', 'user interface design'],
  },
  {
    canonical: 'ux design',
    aliases: ['ux design', 'user experience design'],
  },
  {
    canonical: 'figma',
    aliases: ['figma'],
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

const ALIAS_TO_CANONICAL = new Map<string, string>();

for (const definition of SKILL_DEFINITIONS) {
  ALIAS_TO_CANONICAL.set(
    normalizeText(definition.canonical),
    definition.canonical
  );

  for (const alias of definition.aliases) {
    ALIAS_TO_CANONICAL.set(
      normalizeText(alias),
      definition.canonical
    );
  }
}

export function normalizeSkill(skill: string): string | null {
  const normalized = normalizeText(skill);

  if (!normalized) {
    return null;
  }

  return ALIAS_TO_CANONICAL.get(normalized) ?? null;
}

export function normalizeSkills(skills: string[]): NormalizedSkill[] {
  const results: NormalizedSkill[] = [];
  const seen = new Set<string>();

  for (const skill of skills) {
    const canonical = normalizeSkill(skill);

    if (!canonical || seen.has(canonical)) {
      continue;
    }

    seen.add(canonical);

    results.push({
      original: skill,
      canonical,
    });
  }

  return results;
}

export function getSupportedSkills(): SkillDefinition[] {
  return SKILL_DEFINITIONS.map((definition) => ({
    canonical: definition.canonical,
    aliases: [...definition.aliases],
  }));
}
