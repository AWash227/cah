import { Box, Button, Flex, Heading, HStack, Icon } from "@chakra-ui/react";
import React from "react";
import { FaBong } from "react-icons/fa";
import { default as getPlayerFromLocalStorage } from "../utils/getPlayer";
import { GAME_TITLE } from "../../config";
import { GamePlayer } from "../types";
import Toggle from "./Toggle";

const Topbar = ({
  inGame,
  players,
}: {
  inGame: boolean;
  players: GamePlayer[];
}) => {
  const handleNewAccount = () => {
    const potentialPlayer = getPlayerFromLocalStorage();
    if (
      inGame ||
      (potentialPlayer &&
        players.map((player) => player.id).includes(potentialPlayer.id))
    ) {
      alert(
        "There's a time and place for everything, but not now. (Either the game is running, or you are already in a lobby)."
      );
    } else {
      localStorage.removeItem("player");
      window.location.reload();
    }
  };

  return (
    <Box width="100%" p={2} boxShadow="md">
      <Flex justify="space-between" align="center">
        <Heading size="sm">{GAME_TITLE}</Heading>
        <HStack spacing={2} align="center">
          <Button
            size="sm"
            leftIcon={<Icon as={FaBong} />}
            onClick={handleNewAccount}
          >
            New Account
          </Button>
          <Toggle />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Topbar;
