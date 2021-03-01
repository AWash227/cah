export interface SimpleDeck{
  name: string;
  whiteCards: number;
  blackCards: number;
  official: boolean;
}

export interface Deck {
  name: string;
  white: WhiteCard[];
  black: BlackCard[];
  official: boolean;
}

export interface Card {
  pack: number;
  text: string;
}

export interface WhiteCard extends Card{}

export interface BlackCard extends Card {
  pick: number;
}