import React, { useCallback, useContext, useState } from "react";
import {
  Box,
  Grid,
  Flex,
  Text,
  Button,
  Icon,
  useColorMode,
  Heading,
  Stack,
} from "@chakra-ui/react";
import PlayerTable from "../PlayerTable";
import { GamePlayer, Player, Round, whitecard } from "../../types";
import { FaCheckDouble } from "react-icons/fa";
import { SocketContext } from "../../service";
import Card from "../Card";

export interface InteractionAreaProps {
  player: Player | null;
  players: GamePlayer[];
  round: Round;
  hand: whitecard[];
  roundNumber: number;
  maxScore: number;
}

const InteractionArea = (props: InteractionAreaProps) => {
  const { players, round, roundNumber, maxScore } = props;
  const { colorMode } = useColorMode();

  return (
    <Box
      width="100%"
      maxH={350}
      h={300}
      position="absolute"
      left={0}
      bottom={0}
      mb={12}
      p={4}
      bgColor={colorMode === "light" ? "gray.200" : "gray.900"}
    >
      <Box position="absolute" left={0} top={-120} p={4}>
        <Stack justify="center" align="center" spacing={2}>
          <Text fontSize="xs">Round</Text>
          <Heading size="lg">{roundNumber}</Heading>
          <Text fontSize="xs">
            Score to Win: <strong>{maxScore}</strong>
          </Text>
        </Stack>
      </Box>
      <Grid templateColumns={"1fr 3fr"}>
        <PlayerTable
          players={players}
          isStillPlaying={(playerId: string): boolean =>
            round.playersLeft.includes(playerId)
          }
          isCzar={(playerId: string): boolean => round.czar.id === playerId}
        />
        <Hand {...props} />
      </Grid>
    </Box>
  );
};

const Hand = (props: InteractionAreaProps) => {
  const { player, players, round, hand } = props;
  const socket = useContext(SocketContext);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

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
  }, [socket, selectedCards]);
  return (
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
          <Flex
            justify="space-between"
            align="center"
            width="100%"
            p={2}
            position="absolute"
            top={0}
            left={0}
          >
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

          <Flex height="100%" justify="center" mt={10} p={4}>
            {hand &&
              player?.id &&
              hand.map((card, i) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardSelect(card)}
                  selected={selectedCards.includes(card.id)}
                  index={
                    selectedCards.findIndex((sCard) => sCard === card.id) + 1
                  }
                />
              ))}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default InteractionArea;
