import { whitecard, blackcard } from "@prisma/client";
import CardService from "./CardService";

interface Player {
  id: number;
  name: string;
}
interface GamePlayer extends Player {
  score: number;
  hand: whitecard[];
}
interface Play {
  playerId: number;
  cards: whitecard[];
}

interface Round {
  blackCard: blackcard;
  plays: Play[];
  czar: number;
  winner?: number;
  stillPlaying: number[];
  state: "PLAYING" | "JUDGING";
}

class Game {
  cardPool: CardService;
  deckIds: number[] = [];
  players: GamePlayer[] = [];
  rounds: Round[] = [];
  currentRound: number = -1;
  status: "LOBBY" | "IN-PROGRESS" | "ENDED" = "LOBBY";
  winner: number | null = null;
  maxScore: number = 5;
  owner: Player | null = null;

  constructor(
    deckIds: number[],
    players: Player[],
    maxScore: number,
    owner: Player
  ) {
    this.deckIds = deckIds;
    this.maxScore = maxScore;
    players.forEach((player) =>
      this.players.push({
        id: player.id,
        name: player.name,
        score: 0,
        hand: [],
      })
    );
    this.owner = owner;
    this.cardPool = new CardService(this.deckIds);
  }

  getPlayer(id: number) {
    return this.players.find((player) => player.id === id);
  }

  getCurrentRound() {
    return this.rounds[this.currentRound];
  }

  async startGame() {
    this.status = "IN-PROGRESS";
    // Give everyone a hand of cards
    await Promise.all(
      this.players.map(async (player) => {
        player.hand = await this.cardPool.getRandomHand();
      })
    );
  }

  async judgeRound(playerId: number) {
    this.rounds[this.currentRound].winner = playerId;
    const playerIndex = this.players.findIndex(
      (player) => player.id === playerId
    );
    this.players[playerIndex].score += 1;

    if (this.players[playerIndex].score >= this.maxScore) {
      this.status = "ENDED";
      this.winner = playerId;
    } else {
      await this.startNewRound();
    }
  }

  async confirmPlay(playerId: number, cards: number[]) {
    if (!this.rounds[this.currentRound].stillPlaying.includes(playerId)) {
      console.log(`player: ${playerId} already played this round`);
      return;
    }
    const filledCards = await this.cardPool.getCards(cards);
    const newPlay = <Play>{ playerId, cards: filledCards };
    // Add the play to the current round
    this.rounds[this.currentRound].plays.push(newPlay);

    // Remove them from the still playing list
    this.rounds[this.currentRound].stillPlaying = this.rounds[
      this.currentRound
    ].stillPlaying.filter((id) => id !== playerId);

    // Remove cards from players hands
    const playerIndex = this.players.findIndex(
      (player) => player.id === playerId
    );
    this.players[playerIndex].hand = this.players[playerIndex].hand.filter(
      (item) => !cards.includes(item.id)
    );

    if (this.rounds[this.currentRound].stillPlaying.length === 0) {
      this.rounds[this.currentRound].state = "JUDGING";
    }

    console.log("still playing", this.rounds[this.currentRound].stillPlaying);
  }

  async givePlayersNewCards() {
    // Go through each player and if they have less than 8 cards, give them another
    this.players.map(async (player) => {
      if (player.hand.length < 8) {
        const newCards = await this.cardPool.getRandomCards(
          8 - player.hand.length
        );
        player.hand = player.hand.concat(newCards);
      }
    });
  }

  async startNewRound() {
    // Select a black card
    const blackCard = await this.cardPool.getRandomTopicCard();

    //Select a czar
    const czar = 1; //this.players[Math.round(Math.random() * this.players.length)].id;

    // Set everyone to playing unless they are czar
    const stillPlaying = this.players
      .filter((player) => player.id !== czar)
      .map((player) => player.id);

    const newRound: Round = {
      plays: [],
      blackCard,
      czar,
      stillPlaying,
      state: "PLAYING",
    };

    // Create new round
    this.rounds.push(newRound);

    // Change current round
    this.currentRound += 1;

    await this.givePlayersNewCards();
  }

  async endRound(playerId: number) {
    this.rounds[this.currentRound].winner = playerId;
  }
}
export default Game;
