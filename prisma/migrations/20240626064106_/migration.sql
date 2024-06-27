/*
  Warnings:

  - You are about to drop the column `RegisterUrl` on the `upcomingevent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `upcomingevent` DROP COLUMN `RegisterUrl`,
    ADD COLUMN `registerUrl` VARCHAR(191) NULL;
