import React from "react";
export const GAME_TITLE = import.meta.env.REACT_APP_GAME_TITLE;
import { io, Socket } from "socket.io-client";
export const socket = io("http://localhost:3001", { reconnection: true });
export const SocketContext = React.createContext<Socket | null>(null);
