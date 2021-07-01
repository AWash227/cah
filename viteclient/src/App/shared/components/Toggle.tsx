import { Box, Button, Icon, useColorMode } from "@chakra-ui/react";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const Toggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  console.log("COLOR MODE", colorMode);
  return (
    <Box>
      <Button
        size="sm"
        onClick={() => toggleColorMode()}
        leftIcon={<Icon as={colorMode === "light" ? FaMoon : FaSun} />}
      >
        {colorMode === "light" ? "Dark Mode" : "Light Mode"}
      </Button>
    </Box>
  );
};

export default Toggle;
