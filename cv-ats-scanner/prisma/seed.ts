import { prisma } from '../src/utils/prismaClient';
import { PRESET_TEMPLATES } from '../src/data/jdTemplates.data';

async function main() {
  console.log('Mulai seeding data preset...');

  for (const template of PRESET_TEMPLATES) {
    const existing = await prisma.jDTemplate.findFirst({
      where: { positionName: template.positionName, isPreset: true },
    });

    if (existing) {
      console.log(`Skip "${template.positionName}" (sudah ada)`);
      continue;
    }

    await prisma.jDTemplate.create({
      data: {
        positionName: template.positionName,
        jdText: template.jdText,
        isPreset: true,
      },
    });
    console.log(`Berhasil menambahkan "${template.positionName}"`);
  }

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });