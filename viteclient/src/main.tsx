import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { theme, ThemeProvider, ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";

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
