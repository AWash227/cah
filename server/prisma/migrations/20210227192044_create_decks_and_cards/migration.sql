-- CreateTable
CREATE TABLE "Deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlackCard" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "packId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteCard" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "packId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlackCard" ADD FOREIGN KEY ("packId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteCard" ADD FOREIGN KEY ("packId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
