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
  ModalCloseButton,
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
  useTimeout,
} from "@chakra-ui/react";
import axios from "axios";
import Deck from "./components/Deck";
import Card from "./components/Card";
import { FaCheckDouble } from "react-icons/fa";
import { SocketContext, socket } from "./service";
import Lobby from "./pages/Lobby";
import { getPlayerFromLocalStorage } from "./helpers";
import { GamePlayer, GameState, Player, whitecard } from "./types";
import { Socket } from "socket.io-client";
import Toggle from "./components/Toggle";
import RoundWinnerModal from "./components/RoundWInnerModal";
import PlayerTable from "./components/PlayerTable";
import Board from "./components/Game/Board";
import InteractionArea from "./components/Game/InteractionArea";
import Topbar from "./components/Topbar";

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
        <Topbar />
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
  const [player, setPlayer] = useState<Player | null>(null);
  const [roundWinModalOpen, setRoundWinModalOpen] = useState(false);

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

  const handleRoundWin = useCallback(() => {
    setRoundWinModalOpen(true);
    const timeout = setTimeout(() => {
      setRoundWinModalOpen(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    socket?.on("ROUND_WIN", handleRoundWin);
  }, [socket]);

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
                <Heading size="lg">{`${
                  gameState.rounds[gameState.currentRound].winner?.name
                } Won!`}</Heading>
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
    <Box position="relative" width="100%" height="100%" pt={4}>
      <Flex direction="column">
        {/* Board Area */}
        <Box flex={4}>
          <Board round={round} handleCzarClick={handleCzarClick} />
        </Box>

        {/* Hand Area */}
        <Box flex={1}>
          <InteractionArea
            players={gameState.players}
            player={player}
            round={round}
            hand={hand}
            roundNumber={gameState.currentRound}
            maxScore={gameState.maxScore}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default App;
