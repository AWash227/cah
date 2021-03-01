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
import { setSyntheticLeadingComments } from "typescript";

function App() {
  return (
    <Box className="App" position="relative" overflow="hidden">
      <SocketContext.Provider value={socket}>
        <Game />
      </SocketContext.Provider>
    </Box>
  );
}

const cards = [
  { id: 1, text: "Hi Ho", packId: 0 },
  { id: 2, text: "He Ho", packId: 0 },
  { id: 3, text: "YI YIP", packId: 0 },
  { id: 4, text: "Yeep Yoop", packId: 0 },
];

interface Round {
  blackCard: { id: number; pick: number; packId: number; text: string };
  stillPlaying: number[];
  state: "PLAYING" | "JUDGING";
  plays: any[];
  czar: number;
}

interface WhiteCard {
  id: number;
  text: string;
  packId: number;
}

const Game = () => {
  const socket = useContext(SocketContext);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [hand, setHand] = useState<WhiteCard[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  const player = getPlayerFromLocalStorage();

  const handleRoundChanged = useCallback(
    (round: Round) => {
      console.log(round);
      socket?.emit("GET_HAND", player?.id);
      setRound(round);
    },
    [socket, player]
  );

  const handleGameChanged = useCallback(
    (round) => {
      setRound(round);
    },
    [socket]
  );

  const handleCzarClick = useCallback(
    (playerId: number) => {
      console.log("SDFSDF");
      if (round) {
        if (round.czar === player?.id && round.state === "JUDGING") {
          socket?.emit("CZAR_SELECT", playerId);
        }
      }
    },
    [round, socket, player]
  );

  const handleGetHand = useCallback((hand: WhiteCard[]) => setHand(hand), []);

  const handleCardSelect = (card: WhiteCard) => {
    if (round) {
      if (round.blackCard.pick === 1) {
        setSelectedCards(
          selectedCards.includes(card.id)
            ? selectedCards.filter((id) => card.id !== id)
            : [card.id]
        );
      } else {
        const canAddCard =
          !selectedCards?.includes(card.id) &&
          selectedCards?.length < round.blackCard.pick;
        setSelectedCards(
          canAddCard
            ? [...selectedCards, card.id]
            : selectedCards?.filter((id) => card.id !== id)
        );
      }
    }
  };

  const handleGetFullPlayer = useCallback(
    (me) => {
      localStorage.setItem("player", JSON.stringify(me));
    },
    [socket]
  );

  const handleSubmitCard = useCallback(() => {
    console.log("Boi");
    if (selectedCards.length === round?.blackCard.pick) {
      console.log("Submitting");
      socket?.emit("SUBMIT_CARD", {
        playerId: player?.id,
        cards: selectedCards,
      });
      setSelectedCards([]);
    }
  }, [socket, round, round?.blackCard, selectedCards]);

  useEffect(() => {
    socket?.on("ROUND_CHANGED", handleRoundChanged);
    socket?.emit("GET_HAND", player?.id);
    socket?.on("HAND_FOUND", handleGetHand);
    socket?.on("PLAYER_ADDED", handleGetFullPlayer);
    socket?.emit("GET_GAME");
    socket?.on("GAME_FOUND", handleGameChanged);
    socket?.on("GAME_CHANGED", handleGameChanged);
    socket?.on("GAME_STARTED", handleGameChanged);
  }, [socket, handleRoundChanged]);

  if (!round) return <Lobby />;

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
                    visible={round.state === "JUDGING" ? true : false}
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
          <Box height="100%">
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
                  hand.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => handleCardSelect(card)}
                      selected={selectedCards.includes(card.id)}
                    />
                  ))}
              </Flex>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
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
