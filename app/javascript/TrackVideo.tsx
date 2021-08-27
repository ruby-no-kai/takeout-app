import React from "react";

import { Box } from "@chakra-ui/react";

import { Api, TrackStreamOptions } from "./Api";

export interface Props {
  slug: string;
  streamOptions: TrackStreamOptions;
}

export const TrackVideo: React.FC<Props> = ({ slug, streamOptions }) => {
  const { data: streamInfo } = Api.useStream(
    slug,
    streamOptions.interpretation
  );
  return (
    <Box>
      <p>{JSON.stringify(streamInfo)}</p>
    </Box>
  );
};
