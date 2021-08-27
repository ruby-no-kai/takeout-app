import React from "react";
import { BrowserRouter, Switch, Route, Link, NavLink } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";


import { theme } from "./theme";
import { Navbar } from "./Navbar";
import { Login } from "./Login";
import { AttendeeEdit } from "./AttendeeEdit";
import { TrackPage } from "./TrackPage";

export interface Props {
}


export const App: React.FC<Props> = (_props) => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
          <Navbar />
            <Switch>
              <Route
                exact
                path="/"
                render={({ match }) => {
                  return <p>hi</p>;
                }}
              />
              <Route exact path="/attendee"><AttendeeEdit /></Route>
              <Route exact path="/session/new"><Login /></Route>
              <Route exact path="/tracks/:slug"><TrackPage /></Route>
            </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
}

