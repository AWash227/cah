/*
  Warnings:

  - You are about to drop the `BlackCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhiteCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlackCard" DROP CONSTRAINT "BlackCard_packId_fkey";

-- DropForeignKey
ALTER TABLE "WhiteCard" DROP CONSTRAINT "WhiteCard_packId_fkey";

-- CreateTable
CREATE TABLE "deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blackcard" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "packId" INTEGER NOT NULL,
    "pick" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whitecard" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "packId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "BlackCard";

-- DropTable
DROP TABLE "Deck";

-- DropTable
DROP TABLE "WhiteCard";

-- AddForeignKey
ALTER TABLE "blackcard" ADD FOREIGN KEY ("packId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whitecard" ADD FOREIGN KEY ("packId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
