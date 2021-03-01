const { PrismaClient } = require("@prisma/client");
const allDecks = require("../src/cah-cards-full.json");

//@ts-ignore
const decks = Object.keys(allDecks).map((key) => ({
  id: parseInt(key),
  name: allDecks[key].name,
  official: allDecks[key].official,
}));

//@ts-ignore
const whiteCards = Object.keys(allDecks).flatMap((key) =>
  allDecks[key].white.map((card) => ({
    text: card.text,
    packId: card.pack,
  }))
);

//@ts-ignore
const blackCards = Object.keys(allDecks).flatMap((key) =>
  allDecks[key].black.map((card) => ({
    text: card.text,
    pick: card.pick,
    packId: card.pack,
  }))
);

const prisma = new PrismaClient();

async function main() {
  const decksCreated = await prisma.deck.createMany({
    data: decks,
    skipDuplicates: true,
  });
  const whitesCreated = await prisma.whitecard.createMany({
    data: whiteCards,
    skipDuplicates: true,
  });
  const blacksCreated = await prisma.blackcard.createMany({
    data: blackCards,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
