import React from "react";

import { Box } from "@chakra-ui/react";

import { Api, Track, TrackStreamOptions } from "./Api";

export interface Props {
  track: Track;
  streamOptions: TrackStreamOptions;
}

export const TrackVideo: React.FC<Props> = ({ track, streamOptions }) => {
  const { data: streamInfo } = Api.useStream(
    track.slug,
    streamOptions.interpretation && track.interpretation
  );
  return (
    <Box>
      <p>{JSON.stringify(streamInfo)}</p>
    </Box>
  );
};
