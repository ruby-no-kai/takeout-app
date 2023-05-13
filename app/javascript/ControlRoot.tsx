import { Box, Container, Heading, Link } from "@chakra-ui/react";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import Api from "./Api";

export const ControlRoot: React.FC = () => {
  const { data: conference } = Api.useConference();

  return (
    <Container>
      <Heading>Live control room</Heading>

      <Box as="nav">
        <ul>
          <li>
            Track live control:
            <ul>
              {conference?.conference.track_order.map((slug) => {
                return (
                  <li key={slug}>
                    <Link as={RouterLink} to={`/control/tracks/${slug}`}>
                      {slug} ({conference.conference.tracks[slug]?.name ?? slug})
                    </Link>
                  </li>
                );
              }) ?? (
                <li>
                  <i>Loading</i>
                </li>
              )}
            </ul>
          </li>
          <li>
            <Link as={RouterLink} to="/control/track_cards">
              Track cards
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/screen">
              Screen & Signage
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/next_session">
              Next Session
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/venue_announcements">
              Venue announcements
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/attendees">
              Attendees
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/stream_presences">
              Stream presences
            </Link>
          </li>
          <li>
            <Link as={RouterLink} to="/control/chat_spotlights">
              Chat spotlights
            </Link>
          </li>
        </ul>
      </Box>
    </Container>
  );
};
export default ControlRoot;
