/*
  Warnings:

  - You are about to drop the `partnercategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `partner` DROP FOREIGN KEY `Partner_partnerCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `partnercategory` DROP FOREIGN KEY `PartnerCategory_createdById_fkey`;

-- DropTable
DROP TABLE `partnercategory`;

-- CreateTable
CREATE TABLE `PartnerGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,

    INDEX `PartnerGroup_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_partnerCategoryId_fkey` FOREIGN KEY (`partnerCategoryId`) REFERENCES `PartnerGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerGroup` ADD CONSTRAINT `PartnerGroup_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
