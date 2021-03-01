import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
//@ts-ignore
import Game from "./Game";
import cors from "cors";
import Lobby from "./Lobby";
import { stringify } from "querystring";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.get("/api/decks", async (req, res, next) => {
  const decks = await prisma.deck.findMany({ orderBy: { official: "desc" } });
  if (decks) {
    res.json(decks);
  }
});

app.get("/api/decks/:id", async (req, res, next) => {
  const deck = await prisma.deck.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { whiteCards: true, blackCards: true },
  });
  if (deck) {
    res.json(deck);
  }
});

// Each Player gets a hand of 5 cards up to 8

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let game: Game | null;
let lobby: Lobby | null = new Lobby();
io.on("connection", (socket: Socket) => {
  console.log("Client connected");
  socket.emit("ROUND_CHANGED", game?.getCurrentRound());
  handleLobbyRequests(io, socket);
  handleGameRequests(io, socket);
});

const handleLobbyRequests = (io: Server, socket: Socket) => {
  socket.on("CREATE_LOBBY", (name: string) => {
    lobby = new Lobby(name);
    io.emit("LOBBY_CREATED", lobby);
    console.log("Creating Lobby");
  });

  socket.on("GET_LOBBY", () => {
    console.log("Getting Lobby");
    io.emit("LOBBY_FOUND", lobby);
  });

  socket.on("ADD_PLAYER", (name: string) => {
    const player = lobby?.addPlayer(name);
    if (player) {
      socket.emit("LOBBY_JOINED", player);
      io.emit("PLAYER_ADDED", player);
      io.emit("LOBBY_CHANGED", lobby);
      console.log(`Player: ${name} added to lobby`);
    }
  });

  socket.on("REMOVE_PLAYER", (id: number) => {
    io.emit("PLAYER_REMOVED", lobby?.removePlayer(id));
  });

  socket.on("ADD_DECK", (id: number) => {
    io.emit("DECK_ADDED", lobby?.addDeck(id));
  });

  socket.on("REMOVE_DECK", (id: number) => {
    io.emit("DECK_REMOVED", lobby?.removeDeck(id));
  });

  socket.on("CHANGE_MAX_SCORE", (score: number) => {
    io.emit("MAX_SCORE_CHANGED", lobby?.changeMaxScore(score));
  });

  socket.on("CHANGE_OWNER", (args: { id: number; name: string }) => {
    io.emit("OWNER_CHANGED", lobby?.changeOwner(args));
  });
};

const handleGameRequests = (io: Server, socket: Socket) => {
  socket.on("GET_HAND", (id: number) => {
    socket.emit("HAND_FOUND", game?.getPlayer(id)?.hand);
  });

  socket.on("CZAR_SELECT", (winnerId: number) => {
    io.emit("ROUND_CHANGED", game?.getCurrentRound().winner);
  });

  socket.on("START_GAME", async () => {
    const newGame = lobby?.convertToGame();
    if (newGame) game = newGame;
    await game?.startGame();
    await game?.startNewRound();
    io.emit("ROUND_CHANGED", game?.getCurrentRound());
    console.log("starting game");
  });

  socket.on("GET_GAME", () => {
    socket.emit("GAME_FOUND", game);
  });

  socket.on(
    "SUBMIT_CARD",
    async (args: { playerId: number; cards: number[] }) => {
      await game?.confirmPlay(args.playerId, args.cards);
      io.emit("ROUND_CHANGED", game?.getCurrentRound());
    }
  );
};

httpServer.listen(5000);
