export interface Deck {
  id: number;
  title: string;
  official: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface whitecard {
  id: number;
  text: string;
  packId: number;
}

export interface blackcard {
  id: number;
  text: string;
  packId: string;
  pick: number;
}

export interface GamePlayer extends Player {
  score: number;
  hand: whitecard[];
}

export interface Play {
  playerId: string;
  cards: whitecard[];
}

export interface Round {
  blackCard: blackcard;
  czar: Player | null;
  plays: Play[];
  winner: Player | null;
  playersLeft: string[];
}

export interface GameState {
  players: GamePlayer[];
  maxScore: number;
  decks: Deck[];
  owner: Player | null;
  rounds: Round[];
  currentRound: number;
  winner: Player | null;
}
