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
  czar: Player;
  plays: Play[];
  winner: Player | null;
  playersLeft: string[];

  constructor(game: CAH) {
    this.game = game;
    this.game.iterateCzar();
    this.czar = {
      id: this.game.players[this.game.czarIterator].id,
      name: this.game.players[this.game.czarIterator].name,
    };
    this.blackCard = null;
    this.plays = [];
    this.winner = null;
    this.playersLeft = this.game.players
      .filter((player) => player.id !== this.czar.id)
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

  async addPlay(play: { playerId: string; cards: number[] }) {
    if (this.plays.map((play) => play.playerId).includes(play.playerId)) return;
    const newCards = await this.game.cardPool.getCards(play.cards);
    this.plays.push({
      playerId: play.playerId,
      cards: play.cards.map(
        (card, i) =>
          newCards.find((newCard) => newCard.id === card) || newCards[i]
      ),
    }); // We do this to ensure the proper sort order

    // Get player who played and remove cards played from their hand
    this.game.removeCards(play.playerId, play.cards);

    // Remove player from stillPlaying
    this.playersLeft = this.playersLeft.filter((id) => id !== play.playerId);
  }

  async judgeRound(playerId: string, judgedById: string) {
    if (this.game.winner) return;
    if (judgedById === this.czar.id) {
      console.log("judging");
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
  czarIterator: number = -1;

  constructor() {
    this.players = [];
    this.maxScore = 1;
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
      winner: this.winner,
    };
  }

  async changeSettings(settings: { maxScore: number; decks: number[] }) {
    if (settings.maxScore) {
      this.maxScore = settings.maxScore;
      console.log("Changed max score");
    }
    if (settings.decks) {
      console.log("Starting to change decks");
      await this.addDecks(settings.decks);
    }
  }

  iterateCzar() {
    this.czarIterator += 1;
    if (this.czarIterator > this.players.length - 1) {
      this.czarIterator = 0;
    }
  }

  reset() {
    this.players = [];
    this.maxScore = 1;
    this.decks = [];
    this.currentRound = -1;
    this.owner = null;
    this.rounds = [];
    this.cardPool = new CardService([]);
    this.winner = null;
  }

  getPlayerHand(playerId: string) {
    return this.players.find((player) => player.id === playerId)?.hand;
  }

  async addRound() {
    const newRound = new Round(this);
    await newRound.setup();
    this.rounds.push(newRound);
    this.currentRound += 1;
    await this.addCards();
  }

  async endGame() {
    console.log(`Game finished, winner: ${this.winner?.name}`);
  }

  findPlayer(playerId: string): GamePlayer | null {
    const playerIndex = this.players.findIndex(
      (player) => player.id === playerId
    );
    if (this.players[playerIndex]) {
      return this.players[playerIndex];
    }
    return null;
  }

  removeCards(playerId: string, cards: number[]) {
    const player = this.findPlayer(playerId);
    if (player) {
      player.hand = player.hand.filter((card) => !cards.includes(card.id));
    }
  }

  async addCards() {
    await Promise.all(
      this.players.map(async (player) => {
        const numberOfCardsToGet = this.maxCards - player.hand.length;
        console.log(`Adding ${numberOfCardsToGet} cards`);
        if (numberOfCardsToGet <= 0) return player;
        const newCards = await this.cardPool.getRandomCards(numberOfCardsToGet);
        player.hand = [...player.hand, ...newCards];
      })
    );
  }

  async addDeck(deckId: number) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId } });
    if (deck) {
      this.decks.push(deck);
      this.cardPool = new CardService(this.decks.map((deck) => deck.id));
    }
  }

  async addDecks(deckIds: number[]) {
    if (deckIds.length <= 0) return;
    const decks = await prisma.deck.findMany({
      where: { id: { in: deckIds } },
    });
    if (decks.length > 0) {
      this.decks = this.decks.concat(decks);
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
      // If they are the first user
      if (this.players.length === 1) {
        this.owner = newPlayer;
      }
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
