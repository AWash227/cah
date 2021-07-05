import React, { useCallback, useContext, useEffect, useState } from "react";
import "./index.css";
import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { SocketContext, socket } from "./config";
import Lobby from "./pages/Lobby";
import { default as getPlayerFromLocalStorage } from "./shared/utils/getPlayer";
import { GameState, Player, whitecard } from "./shared/types";
import Board from "./shared/components/Game/Board";
import InteractionArea from "./shared/components/Game/InteractionArea";
import Topbar from "./shared/components/Topbar";

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
        <Topbar
          inGame={gameState.rounds.length > 0}
          players={gameState.players}
        />
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
  else if (!round) return <Lobby gameState={gameState} player={player} />;

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
