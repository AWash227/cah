import React, { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, HStack, Text, Icon } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { blackcard, whitecard } from "../types";

interface CardProps extends BoxProps {
  card: whitecard & blackcard;
  selected?: boolean;
  type?: "white" | "black";
  visible?: boolean;
  index?: number;
}

const Card = (props: CardProps) => {
  const { card, selected, type = "white", visible = true } = props;
  const [random, setRandom] = useState(0);

  useEffect(() => {
    setRandom(Math.random() * 5 * (Math.round(Math.random()) === 0 ? -1 : 1));
  }, []);

  return (
    <Box
      px={6}
      py={8}
      boxShadow="md"
      w={175}
      h={225}
      borderRadius={5}
      bgColor={type === "white" ? "white" : "gray.600"}
      color={type === "white" ? "gray.800" : "white"}
      position="relative"
      cursor="pointer"
      transform={`rotate(${random}deg)`}
      transition="all 0.25s ease-in-out"
      {...(selected ? { zIndex: 200 } : {})}
      {...props}
      _hover={{
        zIndex: 200,
        transform: "scale(1.1)",
        boxShadow: "xl",
        opacity: 0.98,
        ...props._hover,
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
        {props.index && (
          <Box
            position="absolute"
            bottom={0}
            right={0}
            px={2}
            py={1}
            bgColor="blue.500"
            color="white"
            fontSize="md"
            fontWeight="bold"
            borderTopLeftRadius={5}
            borderColor="blue.500"
          >
            <HStack>
              <Text fontSize="xs">{props.index}</Text>
            </HStack>
          </Box>
        )}
      </Box>
      {visible && (
        <Text
          width="100%"
          height="100%"
          overflowY="auto"
          fontSize="sm"
          fontWeight="bold"
          pb={card.pick ? 8 : 0}
        >
          {card.text}
        </Text>
      )}
      {card && card.pick && type === "black" && (
        <Text
          position="absolute"
          right={4}
          bottom={4}
          fontSize="xl"
          fontWeight="bold"
          opacity="0.5"
        >
          Pick {card.pick}
        </Text>
      )}
    </Box>
  );
};

export default Card;
