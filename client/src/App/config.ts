import React from "react";
export const GAME_TITLE = import.meta.env.VITE_GAME_TITLE;
import { io, Socket } from "socket.io-client";
export const socket = io("http://45.56.109.180:3005", { reconnection: true });
export const SocketContext = React.createContext<Socket | null>(null);
