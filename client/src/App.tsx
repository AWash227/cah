import React, { useCallback, useContext, useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import axios from "axios";
import Deck from "./components/Deck";
import Card from "./components/Card";
import { FaCheckDouble } from "react-icons/fa";
import { SocketContext, socket } from "./service";
import Lobby from "./pages/Lobby";
import { getPlayerFromLocalStorage } from "./helpers";
import { GamePlayer, GameState, Player, whitecard } from "./types";

const emptyGameState: GameState = {
  players: [],
  maxScore: 5,
  decks: [],
  owner: null,
  rounds: [],
  currentRound: -1,
  winner: null,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(emptyGameState);
  const [hand, setHand] = useState<whitecard[]>([]);

  const handleGameChanged = useCallback((gameState: GameState) => {
    console.log(gameState.players);
    setGameState(gameState);
    const player = getPlayerFromLocalStorage();
    if (player) {
      socket.emit("GET_HAND", player.id);
    }

    console.log("DECKS", gameState.decks);
  }, []);

  const handlePlayerCreated = useCallback((player: Player) => {
    window.localStorage.setItem("player", JSON.stringify(player));
  }, []);

  const handleHandFound = useCallback(
    (hand: whitecard[]) => {
      setHand(hand);
    },
    [setHand]
  );

  useEffect(() => {
    socket.on("GAME_CHANGED", handleGameChanged);
    socket.on("PLAYER_CREATED", handlePlayerCreated);
    socket.emit("GET_GAME");
    socket.on("HAND_FOUND", handleHandFound);
  }, [socket]);

  return (
    <Box className="App" position="relative" overflow="hidden">
      <SocketContext.Provider value={socket}>
        <Game gameState={gameState} hand={hand} />
      </SocketContext.Provider>
    </Box>
  );
}

const Game = ({
  gameState,
  hand,
}: {
  gameState: GameState;
  hand: whitecard[];
}) => {
  const socket = useContext(SocketContext);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);

  const [round, setRound] = useState<any>(
    gameState.rounds[gameState.currentRound]
  );
  useEffect(() => {
    if (gameState.rounds.length === 0) {
      setRound(null);
    } else {
      const newRoundState = gameState.rounds[gameState.currentRound];
      if (newRoundState) {
        setRound(newRoundState);
      }
    }
  }, [gameState, setRound]);

  useEffect(() => {
    const newPlayer = getPlayerFromLocalStorage();
    if (newPlayer) {
      setPlayer(newPlayer);
    }
  }, [setPlayer]);

  const handleCzarClick = useCallback(
    (playerId: string) => {
      if (player) {
        socket?.emit("JUDGE_PLAY", { playerId, judgedById: player.id });
      }
    },
    [socket, player]
  );

  const handleCardSelect = (card: whitecard) => {
    if (round.blackCard.pick === 1) {
      setSelectedCards(
        selectedCards.includes(card.id)
          ? selectedCards.filter((id) => card.id !== id)
          : [card.id]
      );
    } else {
      const canAddCard =
        !selectedCards?.includes(card.id) &&
        round.blackCard.pick &&
        selectedCards?.length < round.blackCard.pick;
      setSelectedCards(
        canAddCard
          ? [...selectedCards, card.id]
          : selectedCards?.filter((id) => card.id !== id)
      );
    }
  };

  const handleSubmitCard = useCallback(() => {
    if (selectedCards.length === round.blackCard.pick) {
      socket?.emit("SUBMIT_PLAY", {
        playerId: player?.id,
        cards: selectedCards,
      });
      setSelectedCards([]);
    }
  }, [socket, gameState, selectedCards]);

  const handleRestartGame = useCallback(() => {
    socket?.emit("RESTART_GAME");
  }, []);

  if (gameState.winner)
    return (
      <Modal isOpen={true} onClose={() => {}}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Flex
              width="100%"
              height="100%"
              align="center"
              justify="center"
              p={4}
            >
              <Stack spacing={6}>
                <Heading size="lg">{`${gameState.winner.name} Won!`}</Heading>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleRestartGame}
                >
                  Restart Game
                </Button>
              </Stack>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  else if (!round) return <Lobby gameState={gameState} />;

  return (
    <Box position="relative" width="100%" height="100%">
      {/* Board Area */}
      <Box width="100%">
        <Stack spacing={2}>
          <HStack spacing={2}>
            <Box px={4}>
              <Heading pb={4} size="md">
                Black Card
              </Heading>
              {round.blackCard && <Card type="black" card={round.blackCard} />}
            </Box>
            {round.plays.map((play) => (
              <HStack
                key={play.playerId}
                spacing={-50}
                p={2}
                borderRadius={5}
                transition="all 0.25s ease-in-out"
                _hover={{ outline: "3px solid", outlineColor: "blue.500" }}
                onClick={() => handleCzarClick(play.playerId)}
              >
                {play.cards.map((card: any) => (
                  <Card
                    key={card.id}
                    card={card}
                    type="white"
                    visible={round.playersLeft.length === 0}
                  />
                ))}
              </HStack>
            ))}
          </HStack>
        </Stack>
      </Box>

      {/* Hand Area */}
      <Box
        width="100%"
        maxH={300}
        h={300}
        position="absolute"
        left={0}
        bottom={0}
        p={4}
        bgColor="gray.100"
      >
        <Grid templateColumns={"1fr 3fr"}>
          <Players
            players={gameState.players}
            isStillPlaying={(playerId: string): boolean =>
              round.playersLeft.includes(playerId)
            }
            isCzar={(playerId: string): boolean => round.czar.id === playerId}
          />
          {console.log("Players Left", round.playersLeft)}
          <Box height="100%" position="relative">
            {round.czar.id === player?.id ? (
              <Flex width="100%" height="100%" justify="center" align="center">
                <Text fontWeight="bold">You are the Card Czar</Text>
              </Flex>
            ) : player && !round.playersLeft.includes(player.id) ? (
              <Flex width="100%" height="100%" justify="center" align="center">
                <Text fontWeight="bold">
                  You've already played a card this round.
                </Text>
              </Flex>
            ) : (
              <>
                <Flex justify="space-between" align="center" p={2}>
                  <Text fontWeight="bold">Your Cards</Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<Icon as={FaCheckDouble} />}
                    onClick={handleSubmitCard}
                  >
                    Confirm Move
                  </Button>
                </Flex>

                <Box height="100%">
                  <Flex height="100%" justify="center">
                    {hand &&
                      player?.id &&
                      hand.map((card, i) => (
                        <Card
                          key={card.id}
                          card={card}
                          onClick={() => handleCardSelect(card)}
                          selected={selectedCards.includes(card.id)}
                          index={
                            selectedCards.findIndex(
                              (sCard) => sCard === card.id
                            ) + 1
                          }
                        />
                      ))}
                  </Flex>
                </Box>
              </>
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

const Players = ({
  players,
  isStillPlaying,
  isCzar,
}: {
  players: GamePlayer[];
  isStillPlaying: (playerId: string) => boolean;
  isCzar: (playerId: string) => boolean;
}) => {
  return (
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Score</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {players.map((player) => (
          <Tr key={player.id}>
            <Td>{player.name}</Td>
            <Td>{player.score}</Td>
            <Td>
              {isCzar(player.id)
                ? "Card Czar"
                : isStillPlaying(player.id)
                ? "Playing"
                : "Done"}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const DeckSelection = () => {
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/decks")
      .then((res) => setDecks(res.data))
      .catch((err) => console.error(err));
  }, []);

  const [selectedDecks, setSelectedDecks] = useState<number[]>([]);

  const selectDeck = (id: number) => setSelectedDecks(selectedDecks.concat(id));
  const deselectDeck = (id: number) =>
    setSelectedDecks((selectedDecks) =>
      selectedDecks.filter((deckId) => deckId !== id)
    );
  const toggleDeck = (id: number) =>
    selectedDecks.includes(id) ? deselectDeck(id) : selectDeck(id);

  return (
    <div className="App">
      <Stack spacing={4}>
        <Heading>Cards Against Humanity</Heading>
        <Heading size="md">Packs</Heading>
        <Text>Select which packs you'd like to play with.</Text>
        <Text fontSize="sm" fontWeight="bold">{`${selectedDecks.length} deck${
          selectedDecks.length > 1 ? "s" : ""
        } selected`}</Text>
        <SimpleGrid columns={4} spacingY={4} spacingX={4}>
          {decks &&
            decks.map((deck: any) => (
              <Deck
                key={deck.id}
                selected={selectedDecks.includes(deck.id)}
                onClick={() => toggleDeck(deck.id)}
                deck={deck}
              />
            ))}
        </SimpleGrid>
      </Stack>
    </div>
  );
};

export default App;
