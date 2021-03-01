import { PrismaClient, whitecard, blackcard } from "@prisma/client";
import { join } from "@prisma/client/runtime";

const prisma = new PrismaClient();

class CardService {
  deckIds: number[] = [];

  constructor(deckIds: number[]) {
    this.deckIds = deckIds;
  }

  async getCards(cards: number[]): Promise<whitecard[]> {
    const filledCards = await prisma.whitecard.findMany({
      where: { id: { in: cards } },
    });
    return filledCards;
  }

  // Give Each Player a Hand of Random Cards based on the decks
  async getRandomCard(): Promise<whitecard> {
    const result = await prisma.$queryRaw`SELECT * FROM whitecard WHERE "packId" IN (${join(
      this.deckIds
    )}) ORDER BY RANDOM() LIMIT 1;`;
    return result[0];
  }

  async getRandomHand(): Promise<whitecard[]> {
    const result = await prisma.$queryRaw`SELECT * FROM whitecard WHERE "packId" IN (${join(
      this.deckIds
    )}) ORDER BY RANDOM() LIMIT 5;`;
    return result;
  }

  async getRandomCards(num: number): Promise<whitecard[]> {
    const result = await prisma.$queryRaw`SELECT * FROM whitecard WHERE "packId" IN (${join(
      this.deckIds
    )}) ORDER BY RANDOM() LIMIT ${num};`;
    return result;
  }

  async getRandomTopicCard(): Promise<blackcard> {
    const result = await prisma.$queryRaw`SELECT * FROM blackcard WHERE "packId" IN (${join(
      this.deckIds
    )}) ORDER BY RANDOM() LIMIT 1;`;
    return result[0];
  }
}

export default CardService;
