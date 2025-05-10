/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "displayName" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Profile";
