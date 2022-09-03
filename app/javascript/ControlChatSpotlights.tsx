import React from "react";
import loadable from "@loadable/component";

import { Box } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

import { Track } from "./Api";
import { ControlApi, ControlChatSpotlight } from "./ControlApi";

//const ControlTrackCardForm = loadable(() => import("./ControlTrackCardForm"));
const ControlChatSpotlightView = loadable(() => import("./ControlChatSpotlightView"));

export type Props = {
  track: Track;
};

export const ControlChatSpotlights: React.FC<Props> = ({ track }) => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data } = ControlApi.useChatSpotlights(track.slug);

  return (
    <Box>
      <Heading>
        {track.name} ({track.slug})
      </Heading>
      {/*      <ControlTrackCardForm trackSlug={track.slug} />*/}
      {data?.chat_spotlights.map((csl) => (
        <ChatSpotlightBox key={`${track.slug}-${csl.id}`} chatSpotlight={csl} />
      ))}
    </Box>
  );
};

const ChatSpotlightBox: React.FC<{ chatSpotlight: ControlChatSpotlight }> = ({ chatSpotlight }) => {
  return (
    <Box mt={3}>
      <ControlChatSpotlightView chatSpotlight={chatSpotlight} />
    </Box>
  );
};

export default ControlChatSpotlights;
