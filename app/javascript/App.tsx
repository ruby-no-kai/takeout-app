import React from "react";
import loadable from "@loadable/component";

import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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

const WithNavbar: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export const App: React.FC<Props> = (_props) => {
  AttendeeEdit.preload();
  TrackPage.preload();

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/tracks/a" />} />

          <Route path="/session/new" element={<Login />} />

          <Route path="/screen" element={<IntermissionScreen />} />

          <Route path="/*" element={<WithNavbar />}>
            <Route path="attendee" element={<AttendeeEdit />} />
            <Route path="tracks/:slug" element={<TrackPage />} />
            <Route path="control/attendees" element={<ControlAttendeesPage />} />
            <Route path="control/attendees/:id" element={<ControlAttendeeEdit />} />
            <Route path="control/track_cards" element={<ControlTrackCardsPage />} />
            <Route path="control/session/new" element={<ControlLogin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};
