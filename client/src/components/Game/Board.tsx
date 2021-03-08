import React from "react";
import { Box, Stack, HStack, Heading } from "@chakra-ui/react";
import RoundWinnerModal from "../RoundWInnerModal";
import { Round } from "../../types";
import Card from "../Card";

const Board = ({
  round,
  handleCzarClick,
}: {
  round: Round;
  handleCzarClick: (playerId: string) => void;
}) => {
  return (
    <Box width="100%">
      <RoundWinnerModal />
      <Stack spacing={2}>
        <HStack spacing={2}>
          <Box px={4}>
            <Heading pb={4} size="md">
              Black Card
            </Heading>
            {round.blackCard && <Card type="black" card={round.blackCard} />}
          </Box>
          {round.plays.map((play: any) => (
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
  );
};

export default Board;
