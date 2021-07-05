import { Player } from "../types";

const getPlayerFromLocalStorage = (): Player | null => {
  if (typeof window.localStorage.getItem("player") !== "undefined") {
    const possiblePlayer = window.localStorage.getItem("player");
    if (possiblePlayer) {
      return JSON.parse(possiblePlayer);
    }
  }
  return null;
};

export default getPlayerFromLocalStorage;
