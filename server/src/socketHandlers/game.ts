import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import Game, { Player, Play } from "../Game";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handleGameRequests = (game: Game, io: Server, socket: Socket) => {
  socket.on("GET_GAME", () => {
    console.log("Getting game");
    const state = game.getState();
    console.log(state.players);
    socket.emit("GAME_CHANGED", state);
    if (state.rounds.length > 0) {
      console.log(state.rounds[state.currentRound].playersLeft);
    }
  });

  socket.on("GET_HAND", (playerId: string) => {
    const hand = game.getPlayerHand(playerId);
    socket.emit("HAND_FOUND", hand);
  });

  socket.on("CREATE_PLAYER", (name: string) => {
    console.log("Creating player named", name);
    socket.emit("PLAYER_CREATED", { id: uuid(), name });
    socket.emit("GAME_CHANGED", game.getState());
  });

  socket.on("JOIN", (player: Player) => {
    game.addPlayer(player);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("LEAVE", (player: Player) => {
    game.removePlayer(player.id);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("ADD_DECK", async (deckId: number) => {
    await game.addDeck(deckId);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("REMOVE_DECK", async (deckId: number) => {
    await game.removeDeck(deckId);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("SET_OWNER", async (player: Player) => {
    game.setOwner(player);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("SET_MAX_SCORE", (score: number) => {
    game.setMaxScore(score);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on(
    "SUBMIT_PLAY",
    async (play: { playerId: string; cards: number[] }) => {
      await game.rounds[game.currentRound].addPlay(play);
      io.emit("GAME_CHANGED", game.getState());
    }
  );

  socket.on("GET_DECKS", async () => {
    const decks = await prisma.deck.findMany({ orderBy: { official: "desc" } });
    socket.emit("DECKS_FOUND", decks);
  });

  socket.on(
    "CHANGE_SETTINGS",
    async (args: { maxScore: number; decks: number[] }) => {
      await game.changeSettings(args);
      console.log("settings changed");
      const state = game.getState();
      io.emit("GAME_CHANGED", state);
    }
  );

  socket.on(
    "JUDGE_PLAY",
    async (args: { playerId: string; judgedById: string }) => {
      await game.rounds[game.currentRound].judgeRound(
        args.playerId,
        args.judgedById
      );
      io.emit("GAME_CHANGED", game.getState());
    }
  );

  socket.on("RESTART_GAME", async () => {
    if (game.winner) {
      game.reset();
      io.emit("GAME_CHANGED", game.getState());
    }
  });

  socket.on("START_GAME", async () => {
    if (game.owner && game.players.length >= 2) {
      console.log("STARTING GAME");
      if (game.decks.length === 0) {
        await game.addDeck(1);
        await game.addRound();
        io.emit("GAME_CHANGED", game.getState());
      } else {
        await game.addRound();
        io.emit("GAME_CHANGED", game.getState());
      }
    }
  });

  socket.on("RESET_GAME", () => {
    game.reset();
    io.emit("GAME_RESET");
  });
};

export default handleGameRequests;
