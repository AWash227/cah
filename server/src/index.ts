import express from "express";
import Game from "./Game";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import api from "./routes/api";
import handleGameRequests from "./socketHandlers/game";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", api);
app.use(express.static('build'));

// Each Player gets a hand of 5 cards up to 8

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const game = new Game();
io.on("connection", (socket: Socket) => {
  console.log("Client connected");
  handleGameRequests(game, io, socket);
});


httpServer.listen(80);
