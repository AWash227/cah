import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import { GamePlayer } from "../types";

const PlayerTable = ({
  players,
  isStillPlaying,
  isCzar,
}: {
  players: GamePlayer[];
  isStillPlaying: (playerId: string) => boolean;
  isCzar: (playerId: string) => boolean;
}) => {
  return (
    <Box maxH="100%" width="100%">
      <Table variant="simple" size="sm" width="100%">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th isNumeric>Score</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isCzar={isCzar}
              isStillPlaying={isStillPlaying}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PlayerTable;

const PlayerRow = ({
  player,
  isStillPlaying,
  isCzar,
}: {
  player: GamePlayer;
  isStillPlaying: (playerId: string) => boolean;
  isCzar: (playerId: string) => boolean;
}) => {
  const status = isCzar(player.id)
    ? "Czar"
    : isStillPlaying(player.id)
    ? "Playing"
    : "Done";
  return (
    <Tr>
      <Td>{player.name}</Td>
      <Td>{player.score}</Td>
      <Td>{status}</Td>
      <Td></Td>
    </Tr>
  );
};
