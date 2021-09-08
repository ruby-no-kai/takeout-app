import React from "react";
import loadable from "@loadable/component";

import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "./theme";

const Navbar = loadable(() => import(/* webpackPrefetch: true */ "./Navbar"));
const Login = loadable(() => import("./Login"));
const AttendeeEdit = loadable(() => import("./AttendeeEdit"));
const TrackPage = loadable(() => import(/* webpackPrefetch: true */ "./TrackPage"));

const ControlRoot = loadable(() => import("./ControlRoot"));
const ControlLogin = loadable(() => import("./ControlLogin"));
const ControlTrackCardsPage = loadable(() => import("./ControlTrackCardsPage"));
const ControlAttendeesPage = loadable(() => import("./ControlAttendeesPage"));
const ControlAttendeeEdit = loadable(() => import("./ControlAttendeeEdit"));

const IntermissionScreen = loadable(() => import("./IntermissionScreen"));

export interface Props {}

export const App: React.FC<Props> = (_props) => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Redirect to="/tracks/a" />
          </Route>

          <Route exact path="/session/new">
            {(() => {
              AttendeeEdit.preload();
              TrackPage.preload();
            })()}
            <Login />
          </Route>

          <Route exact path="/screen">
            <IntermissionScreen />
          </Route>

          <>
            <Navbar />
            <Route exact path="/attendee">
              {(() => {
                TrackPage.preload();
              })()}
              <AttendeeEdit />
            </Route>
            <Route exact path="/tracks/:slug">
              <TrackPage />
            </Route>

            <Route exact path="/control">
              <ControlRoot />
            </Route>
            <Route exact path="/control/attendees">
              <ControlAttendeesPage />
            </Route>
            <Route exact path="/control/attendees/:id">
              <ControlAttendeeEdit />
            </Route>
            <Route exact path="/control/track_cards">
              <ControlTrackCardsPage />
            </Route>
            <Route exact path="/control/session/new">
              <ControlLogin />
            </Route>
          </>
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};
