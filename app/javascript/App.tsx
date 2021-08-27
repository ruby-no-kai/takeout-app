import React from "react";
import { BrowserRouter, Switch, Route, Link, NavLink } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";


import { theme } from "./theme";
import { Navbar } from "./Navbar";
import { Login } from "./Login";
import { AttendeeEdit } from "./AttendeeEdit";

export interface Props {
}


export const App: React.FC<Props> = (_props) => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
          <Navbar />
          <Container maxW={["auto", "auto", "auto", "1400px"]}>
            <Switch>
              <Route
                exact
                path="/"
                render={({ match }) => {
                  return <p>hi</p>;
                }}
              />
              <Route
                exact
                path="/attendee"
                render={({ match }) => {
                  return <AttendeeEdit />;
                }}
              />

              <Route
                exact
                path="/session/new"
                render={(_) => {
                  return <Login />;
                }}
              />
            </Switch>
          </Container>
      </BrowserRouter>
    </ChakraProvider>
  );
}

