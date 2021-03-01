import { PrismaClient, deck, whitecard, blackcard } from "@prisma/client";
import CardService from "./CardService";

export interface Player {
  id: string;
  name: string;
}

export interface GamePlayer extends Player {
  score: number;
  hand: whitecard[];
}

export interface Play {
  playerId: string;
  cards: whitecard[];
}

class Round {
  game: CAH;
  blackCard: blackcard | null;
  czar: Player | null;
  plays: Play[];
  winner: Player | null;
  playersLeft: string[];

  constructor(game: CAH) {
    this.game = game;
    this.czar = this.game.players[
      Math.round(Math.random() * this.game.players.length)
    ];
    this.blackCard = null;
    this.plays = [];
    this.winner = null;
    this.playersLeft = this.game.players
      .filter((player) => player.id !== this.czar?.id)
      .map((player) => player.id);
  }

  getState() {
    return {
      blackCard: this.blackCard,
      czar: this.czar,
      plays: this.plays,
      winner: this.winner,
      playersLeft: this.playersLeft,
    };
  }

  async setup() {
    const topicCard = await this.game.cardPool.getRandomTopicCard();
    this.blackCard = topicCard;
  }

  addPlay(play: Play) {
    if (this.plays.map((play) => play.playerId).includes(play.playerId)) return;
    this.plays.push(play);
    this.playersLeft = this.playersLeft.filter((id) => id !== play.playerId);
  }

  async judgeRound(playerId: string) {
    const winner = this.game.players.find((player) => player.id === playerId);
    if (winner) {
      this.winner = winner;
      winner.score += 1;
      if (winner.score >= this.game.maxScore) {
        const potentialWinner = this.game.players.find(
          (player) => player.id === playerId
        );
        if (potentialWinner) {
          this.game.winner = potentialWinner;
        }
        this.game.endGame();
      } else {
        await this.game.addRound();
      }
    }
  }
}

const prisma = new PrismaClient();

class CAH {
  decks: deck[];
  players: GamePlayer[];
  owner: Player | null; //first person to connect becomes owner
  maxScore: number;
  rounds: Round[];
  cardPool: CardService;
  currentRound: number;
  winner: Player | null;

  maxCards: number = 7;

  constructor() {
    this.players = [];
    this.maxScore = 5;
    this.decks = [];
    this.owner = null;
    this.rounds = [];
    this.currentRound = -1;
    this.cardPool = new CardService(this.decks.map((deck) => deck.id));
    this.winner = null;
  }

  getState() {
    return {
      players: this.players,
      maxScore: this.maxScore,
      decks: this.decks,
      owner: this.owner,
      rounds: this.rounds.map((round) => round.getState()),
      currentRound: this.currentRound,
      winner: null,
    };
  }

  reset() {
    this.players = [];
    this.maxScore = 5;
    this.decks = [];
    this.currentRound = -1;
    this.owner = null;
    this.rounds = [];
    this.cardPool = new CardService(this.decks.map((deck) => deck.id));
    this.winner = null;
  }

  async addRound() {
    const newRound = new Round(this);
    await newRound.setup();
    this.rounds.push(newRound);
    this.currentRound += 1;
    await this.addCards();
  }

  async endGame() {
    this.reset();
  }

  async addCards() {
    this.players.map(async (player) => {
      const numberOfCardsToGet = this.maxCards - player.hand.length;
      if (numberOfCardsToGet <= 0) return;
      const newCards = await this.cardPool.getRandomCards(numberOfCardsToGet);
      player.hand = [...player.hand, ...newCards];
    });
  }

  async addDeck(deckId: number) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId } });
    if (deck) {
      this.decks.push(deck);
      this.cardPool = new CardService(this.decks.map((deck) => deck.id));
    }
  }

  removeDeck(deckId: number) {
    this.decks = this.decks.filter((deck) => deck.id !== deckId);
    this.cardPool = new CardService(this.decks.map((deck) => deck.id));
  }

  addPlayer(player: Player) {
    if (!this.players.map((player) => player.id).includes(player.id)) {
      const newPlayer = {
        id: player.id,
        name: player.name,
        score: 0,
        hand: [],
      };
      this.players = this.players.concat(newPlayer);
      this.owner = newPlayer;
    }
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((player) => player.id === playerId);
  }

  setOwner(player: Player) {
    this.owner = player;
  }

  setMaxScore(score: number) {
    this.maxScore = score;
  }
}

export default CAH;
