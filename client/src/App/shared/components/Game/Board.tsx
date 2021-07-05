import React, { useState } from "react";
import { Box, Stack, HStack, Heading, Button, Icon } from "@chakra-ui/react";
import RoundWinnerModal from "../RoundWInnerModal";
import { Round } from "../../types";
import Card from "../Card";
import { FaCheckDouble } from "react-icons/fa";
import { default as getPlayerFromLocalStorage } from "../../utils/getPlayer";

const Board = ({
  round,
  handleCzarClick,
}: {
  round: Round;
  handleCzarClick: (playerId: string) => void;
}) => {
  const [selectedPlay, setSelectedPlay] = useState<string | null>(null);
  const player = getPlayerFromLocalStorage();

  const handleClick = (playerId: string) => {
    setSelectedPlay(null);
    handleCzarClick(playerId);
  };

  return (
    <Box width="100%">
      <RoundWinnerModal />
      <Stack spacing={2}>
        <HStack spacing={2}>
          <Box px={4}>
            <Stack spacing={4}>
              <Heading size="md">Black Card</Heading>
              {round.blackCard && <Card type="black" card={round.blackCard} />}
              {player?.id === round.czar.id && round.plays.length > 0 && (
                <Button
                  size="sm"
                  leftIcon={<Icon as={FaCheckDouble} />}
                  colorScheme="blue"
                  disabled={!selectedPlay}
                  onClick={() =>
                    selectedPlay ? handleClick(selectedPlay) : null
                  }
                >
                  Confirm Selection
                </Button>
              )}
            </Stack>
          </Box>
          {round.plays.map((play: any) => (
            <HStack
              key={play.playerId}
              spacing={-50}
              p={2}
              borderRadius={5}
              transition="all 0.25s ease-in-out"
              outline={selectedPlay === play.playerId ? "3px solid" : ""}
              outlineColor="blue.500"
              _hover={{ outline: "3px solid", outlineColor: "blue.500" }}
              onClick={() => setSelectedPlay(play.playerId)}
              flexWrap="wrap"
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
  );
};

export default Board;
