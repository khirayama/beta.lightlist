/*
  Warnings:

  - You are about to drop the column `taskInsertPosition` on the `App` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "taskInsertPosition";

-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "taskInsertPosition" "TaskInsertPosition" NOT NULL DEFAULT 'BOTTOM';
