import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { GAME_TITLE } from "../meta";
import Toggle from "./Toggle";

const Topbar = () => {
  return (
    <Box width="100%" p={2} boxShadow="md">
      <Flex justify="space-between" align="center">
        <Heading size="sm">{GAME_TITLE}</Heading>
        <Toggle />
      </Flex>
    </Box>
  );
};

export default Topbar;
