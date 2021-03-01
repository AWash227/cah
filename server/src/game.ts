// Each Player gets a hand of 5 cards up to 8

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Game from "./Game";

const gameEvents = {
  req: {
    createGame: "CREATE_GAME",
    startGame: "START_GAME",
    endGame: "END_GAME",
    confirmMove: "CONFIRM_MOVE",
    getHand: "GET_HAND",
  },
  res: {
    gameCreated: "GAME_CREATED",
    gameStarted: "GAME_STARTED",
    gameEnded: "GAME_ENDED",
    moveConfirmed: "MOVE_CONFIRMED",
    roundStarted: "ROUND_STARTED",
    gotHand: "GOT_HAND",
  },
};

const httpServer = createServer();
const io = new Server(httpServer, {});

let runningGame = new Game([], [0, 2, 3, 4, 5, 6]);
runningGame.startGame();

io.on("connection", (socket: Socket) => {
  socket.emit("connected", runningGame.rounds[runningGame.currentRound]);
  /*
  socket.on(
    gameEvents.req.createGame,
    (args: { playerIds: number[]; packIds: number[] }) => {
      //Create a game
      runningGame = new Game([], args.packIds);
      runningGame.startGame();
      runningGame.startNewRound();
      io.emit("GAME_CREATED", runningGame.rounds[runningGame.currentRound]);
    }
  );

  socket.on(gameEvents.req.getHand, (args: { playerId: number }) => {
    const foundPlayer = runningGame?.players.find(
      (player) => player.id === args.playerId
    );
    if (foundPlayer) {
      socket.emit(gameEvents.res.gotHand, foundPlayer.hand);
    }
  });

  socket.on("CONFIRM_PLAY", (args: { playerId: number; cards: number[] }) => {
    runningGame?.confirmPlay(args.playerId, args.cards);
    io.emit(
      "PLAY_CONFIRMED",
      runningGame?.rounds[runningGame.currentRound].plays[
        runningGame.rounds[runningGame.currentRound].plays.length - 1
      ]
    );
  });

  socket.on("END_ROUND", (args: { winnerId: number }) => {
    runningGame?.endRound(args.winnerId);
    socket.emit("ROUND_ENDED", args.winnerId);
    runningGame?.startNewRound();
    socket.emit("NEW_ROUND", runningGame?.rounds[runningGame.currentRound]);
  });
  */
});
httpServer.listen(5000);
