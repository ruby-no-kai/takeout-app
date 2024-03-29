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
const ControlChatSpotlightsPage = loadable(() => import("./ControlChatSpotlightsPage"));
const ControlAttendeesPage = loadable(() => import("./ControlAttendeesPage"));
const ControlAttendeeEdit = loadable(() => import("./ControlAttendeeEdit"));
const ControlStreamPresencesPage = loadable(() => import("./ControlStreamPresencesPage"));
const ControlScreenPage = loadable(() => import("./ControlScreenPage"));
const ControlNextSessionPage = loadable(() => import("./ControlNextSessionPage"));
const ControlTrackPage = loadable(() => import("./ControlTrackPage"));
const ControlVenueAnnouncementsPage = loadable(() => import("./ControlVenueAnnouncementsPage"));
const ControlKiosksPage = loadable(() => import("./ControlKiosksPage"));

const IntermissionScreen = loadable(() => import("./IntermissionScreen"));
const SubScreen = loadable(() => import("./SubScreen"));

export type Props = {};

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
          <Route path="/subscreen/:slug" element={<SubScreen />} />

          <Route element={<WithNavbar />}>
            <Route path="/attendee" element={<AttendeeEdit />} />
            <Route path="/tracks/:slug" element={<TrackPage />} />

            <Route path="/control">
              <Route index element={<ControlRoot />} />

              <Route path="tracks/:slug" element={<ControlTrackPage />} />

              <Route path="attendees" element={<ControlAttendeesPage />} />
              <Route path="attendees/:id" element={<ControlAttendeeEdit />} />

              <Route path="screen" element={<ControlScreenPage />} />
              <Route path="track_cards" element={<ControlTrackCardsPage />} />
              <Route path="chat_spotlights" element={<ControlChatSpotlightsPage />} />
              <Route path="stream_presences" element={<ControlStreamPresencesPage />} />
              <Route path="venue_announcements" element={<ControlVenueAnnouncementsPage />} />

              <Route path="next_session" element={<ControlNextSessionPage />} />

              <Route path="kiosks" element={<ControlKiosksPage />} />

              <Route path="session/new" element={<ControlLogin />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};
