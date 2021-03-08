import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  Stack,
  Heading,
} from "@chakra-ui/react";
import Card from "./Card";
import { Socket } from "socket.io-client";
import { SocketContext } from "../service";

const RoundWinnerModal = () => {
  const socket: Socket | null = useContext(SocketContext);
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);

  const handleRoundWin = useCallback(
    (args: { winner: any; cards: any[] }) => {
      setWinner(args.winner);
      setOpen(true);
      setCards(args.cards);
    },
    [setWinner]
  );

  useEffect(() => {
    socket?.on("ROUND_WIN", handleRoundWin);
  }, [socket]);

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Flex
            width="100%"
            height="100%"
            align="center"
            justify="center"
            p={4}
          >
            <Stack spacing={6}>
              <Heading size="md">{`${winner?.name} Won!`}</Heading>
              {cards && cards.map((card) => <Card type="white" card={card} />)}
            </Stack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RoundWinnerModal;
