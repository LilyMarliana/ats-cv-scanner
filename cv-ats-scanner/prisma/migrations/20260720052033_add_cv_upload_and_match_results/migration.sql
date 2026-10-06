-- CreateTable
CREATE TABLE `cv_uploads` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `extractedText` TEXT NOT NULL,
    `wordCount` INTEGER NOT NULL,
    `isLikelyFailed` BOOLEAN NOT NULL DEFAULT false,
    `layoutWarning` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cv_match_results` (
    `id` VARCHAR(191) NOT NULL,
    `cvUploadId` VARCHAR(191) NOT NULL,
    `jdTemplateId` VARCHAR(191) NOT NULL,
    `overallScore` INTEGER NOT NULL,
    `requiredScore` INTEGER NOT NULL,
    `preferredScore` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cv_match_results` ADD CONSTRAINT `cv_match_results_cvUploadId_fkey` FOREIGN KEY (`cvUploadId`) REFERENCES `cv_uploads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cv_match_results` ADD CONSTRAINT `cv_match_results_jdTemplateId_fkey` FOREIGN KEY (`jdTemplateId`) REFERENCES `jd_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
