import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Card from "../components/Card";
import { getPlayerFromLocalStorage } from "../helpers";
import { SocketContext } from "../service";
import { Deck, Player } from "../types";

export interface ILobby {
  decks: Deck[];
  players: Player[];
  maxScore: number;
  owner: Player;
}

const Lobby = () => {
  const socket: Socket | null = useContext(SocketContext);

  const [lobby, setLobby] = useState<ILobby>({
    decks: [],
    players: [],
    maxScore: 5,
    owner: { id: 0, name: "DefaultLobbyOwner" },
  });

  const handleStartGame = useCallback(() => {
    socket?.emit("START_GAME");
  }, [socket]);

  const handleLobbyChange = useCallback(
    (newLobby: ILobby) => setLobby(newLobby),
    [setLobby]
  );

  // After joining the lobby, get the player returned
  // and save that to localStorage so you can stay as that person
  const handleLobbyJoined = useCallback((player: Player) => {
    window.localStorage.setItem("player", JSON.stringify(player));
  }, []);

  const handlePlayerAdded = useCallback(
    (player: Player) => {
      setLobby((lobby) => ({
        ...lobby,
        players: lobby.players.concat(player),
      }));
    },
    [setLobby]
  );

  const handlePlayerRemoved = useCallback(
    (id: number) => {
      setLobby((lobby) => ({
        ...lobby,
        players: lobby.players.filter((player) => player.id !== id),
      }));
    },
    [setLobby]
  );

  useEffect(() => {
    socket?.emit("GET_LOBBY");
    socket?.on("LOBBY_FOUND", handleLobbyChange);
    socket?.on("LOBBY_CHANGED", handleLobbyChange);
    socket?.on("LOBBY_JOINED", handleLobbyJoined);
    socket?.on("PLAYER_ADDED", handlePlayerAdded);
    socket?.on("PlAYER_REMOVED", handlePlayerRemoved);
  }, [socket]);

  return (
    <Box width="100%" height="100%">
      <LobbyHeader />
      <LobbySettings lobby={lobby} />
      <Stack spacing={4} maxWidth="50rem" mx="auto">
        <LobbyJoinForm players={lobby.players} />
        <Button onClick={handleStartGame}>Start Game</Button>
        <LobbyPlayers players={lobby.players} />
      </Stack>
    </Box>
  );
};

const LobbySettings = ({ lobby }: { lobby: ILobby }) => {
  const player = getPlayerFromLocalStorage();
  const [maxScore, setMaxScore] = useState<number>(lobby.maxScore || 5);
  const [decks, setDecks] = useState<number[]>(
    lobby.decks.map((deck) => deck.id) || []
  );
  // If the player is the lobby owner, show settings
  if (player) {
    return (
      <form>
        <Select
          onChange={(e) => setMaxScore(parseInt(e.target.value))}
          value={maxScore}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
        </Select>
      </form>
    );
  }
  return null;
};

const LobbyJoinForm = ({
  players,
}: {
  players: { id: number; name: string }[];
}) => {
  const socket: Socket | null = useContext(SocketContext);

  const [name, setName] = useState("");

  const handleSignUp = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const player = getPlayerFromLocalStorage();
      e.preventDefault();
      if (
        name.length >= 0 &&
        player &&
        !players.map((p) => p.id).includes(player.id)
      ) {
        socket?.emit("ADD_PLAYER", name);
        setName("");
      }
    },
    [socket, name]
  );

  return (
    <form onSubmit={handleSignUp}>
      <HStack spacing={4}>
        <Input
          flex={3}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Insert Witty Name Here..."
        />
        <Button flex={1} colorScheme="blue" type="submit">
          Join
        </Button>
      </HStack>
    </form>
  );
};

const LobbyHeader = () => {
  return (
    <Box p={4}>
      <RandomCards />
      <Box mx="auto" maxWidth="50rem">
        <Heading>Cards Against Humanity</Heading>
        <Text>A better version I think</Text>
        <Text>Enter your name into the text box, and click join</Text>
        <Text>
          When everyone is in, anyone can click start game to start it
        </Text>
      </Box>
    </Box>
  );
};

const LobbyPlayers = ({ players }: { players: Player[] }) => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {players.length > 0 ? (
          players.map((player) => <Tr key={player.id}>{player.name}</Tr>)
        ) : (
          <Text>No one in room</Text>
        )}
      </Tbody>
    </Table>
  );
};

const RandomCards = () => {
  return (
    <>
      <Card
        position="absolute"
        left={25}
        top={25}
        card={{ id: 0, text: "Your mom, lol", packId: 0 }}
        type="white"
      />
      <Card
        position="absolute"
        right={25}
        top={25}
        card={{ id: 0, text: "That feel when _", packId: 0, pick: 1 }}
        type="black"
      />
      <Card
        position="absolute"
        right={350}
        bottom={0}
        card={{ id: 0, text: "Get Creeged", packId: 0 }}
        type="white"
      />
      <Card
        position="absolute"
        bottom={25}
        left={300}
        card={{ id: 0, text: "Who you gonna call? _.", packId: 0, pick: 1 }}
        type="black"
      />
    </>
  );
};

export default Lobby;
