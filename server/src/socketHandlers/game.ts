import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import Game, { Player, Play } from "../Game";

const handleGameRequests = (game: Game, io: Server, socket: Socket) => {
  socket.on("GET_GAME", () => {
    console.log("Getting game");
    const state = game.getState();
    console.log(state.players);
    socket.emit("GAME_CHANGED", state);
  });
  socket.on("CREATE_PLAYER", (name: string) => {
    console.log("Creating player named", name);
    socket.emit("PLAYER_CREATED", { id: uuid(), name });
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

  socket.on("SUBMIT_PLAY", (play: Play) => {
    game.rounds[game.currentRound].addPlay(play);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("JUDGE_PLAY", (playerId: string) => {
    game.rounds[game.currentRound].judgeRound(playerId);
    io.emit("GAME_CHANGED", game.getState());
  });

  socket.on("START_GAME", async () => {
    if (game.owner && game.players.length >= 1) {
      console.log("STARTING GAME");
      if (game.decks.length === 0) {
        await game.addDeck(1);
        await game.addRound();
      }
      await game.addRound();
      io.emit("GAME_CHANGED", game.getState());
    }
  });

  socket.on("RESET_GAME", () => {
    game.reset();
    io.emit("GAME_RESET");
  });
};

export default handleGameRequests;
