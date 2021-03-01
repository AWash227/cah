import { PrismaClient } from "@prisma/client";
import { Router } from "express";
const router = Router();
const prisma = new PrismaClient();

router.get("/decks", async (req, res, next) => {
  const decks = await prisma.deck.findMany({ orderBy: { official: "desc" } });
  if (decks) {
    res.json(decks);
  }
});

router.get("/decks/:id", async (req, res, next) => {
  const deck = await prisma.deck.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { whiteCards: true, blackCards: true },
  });
  if (deck) {
    res.json(deck);
  }
});

export default router;
