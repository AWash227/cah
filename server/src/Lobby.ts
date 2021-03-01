import Game from "./Game";

interface Player {
  id: number;
  name: string;
}
class Lobby {
  name: string = "New Lobby";
  decks: number[] = [];
  players: Player[] = [];
  maxScore: number = 5;
  owner: Player | null = null;

  constructor(
    name: string = "New Lobby",
    decks: number[] = [],
    players: Player[] = [],
    maxScore: number = 5,
    owner: Player | null = null
  ) {
    this.name = name;
    this.decks = decks;
    this.players = players;
    this.maxScore = maxScore;
    this.owner = owner;
  }

  addPlayer(name: string) {
    const newPlayer = { id: this.players.length, name };
    this.players.push(newPlayer);
    return newPlayer;
  }

  removePlayer(id: number) {
    this.players = this.players.filter((player) => player.id === id);
    return id;
  }

  addDeck(id: number) {
    this.decks.push(id);
    return id;
  }

  removeDeck(id: number) {
    this.decks = this.decks.filter((deckId) => deckId !== id);
    return id;
  }

  changeMaxScore(score: number) {
    this.maxScore = score;
    return score;
  }

  changeOwner(player: Player) {
    this.owner = player;
    return player;
  }

  convertToGame(): Game | null {
    if (this.owner) {
      return new Game(this.decks, this.players, this.maxScore, this.owner);
    }
    return null;
  }
}

export default Lobby;
