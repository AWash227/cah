import { Player } from "./types";

export const getPlayerFromLocalStorage = (): Player | null => {
  if (typeof localStorage.getItem("player") !== "undefined") {
    const possiblePlayer = localStorage.getItem("player");
    if (possiblePlayer) {
      return JSON.parse(possiblePlayer);
    }
  }
  return null;
};
