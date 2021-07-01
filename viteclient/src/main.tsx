import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { theme, ThemeProvider, ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { GAME_TITLE } from "./App/config";

const title: string = String(GAME_TITLE);
document.title = title ?? "Cards";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ChakraProvider>
        <Router>
          <App />
        </Router>
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
