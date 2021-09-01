import React from "react";
import loadable from "@loadable/component";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "./theme";

const Navbar = loadable(() => import("./Navbar"));
const Login = loadable(() => import("./Login"));
const AttendeeEdit = loadable(() => import("./AttendeeEdit"));
const TrackPage = loadable(() => import("./TrackPage"));

export interface Props {}

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
              return 100;
              ////////////////return <p>hi</p>;
            }}
          />
          <Route exact path="/attendee">
            <AttendeeEdit />
          </Route>
          <Route exact path="/session/new">
            <Login />
          </Route>
          <Route exact path="/tracks/:slug">
            <TrackPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};
