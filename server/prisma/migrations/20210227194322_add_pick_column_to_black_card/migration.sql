/*
  Warnings:

  - Added the required column `pick` to the `BlackCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlackCard" ADD COLUMN     "pick" INTEGER NOT NULL;
