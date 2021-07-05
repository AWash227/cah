import React from "react";
import { Box, BoxProps, HStack, Text, Icon } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { Deck as IDeck } from "../types";

interface DeckProps extends BoxProps {
  deck: IDeck;
  selected?: boolean;
}

const Deck = (props: DeckProps) => {
  const { deck, selected } = props;
  return (
    <Box
      p={6}
      m={4}
      boxShadow="md"
      w={175 / 2}
      h={225 / 2}
      borderRadius={5}
      textAlign="center"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgColor="gray.600"
      color="white"
      position="relative"
      cursor="pointer"
      transition="all 0.25s ease-in-out"
      {...props}
      _hover={{
        opacity: 0.9,
      }}
    >
      <Box
        borderRadius={5}
        border="5px solid"
        borderColor="blue.500"
        top={0}
        right={0}
        bottom={0}
        left={0}
        position="absolute"
        width="100%"
        height="100%"
        opacity={selected ? 1 : 0}
        transition="opacity 0.15s"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          px={2}
          py={1}
          borderBottomRightRadius={5}
          bgColor="blue.500"
          color="white"
          fontSize="xx-small"
          fontWeight="bold"
        >
          <HStack>
            <Icon fontSize="xx-small" color="white" as={FaCheck} />
            <Text>Selected</Text>
          </HStack>
        </Box>
      </Box>
      <Text fontSize="xx-small" fontWeight="bold">
        {deck.name}
      </Text>
      {deck.official && (
        <Text
          _groupHover={{ right: 2, bottom: 2 }}
          fontSize="xx-small"
          position="absolute"
          right={4}
          bottom={4}
        >
          Official
        </Text>
      )}
    </Box>
  );
};

export default Deck;
