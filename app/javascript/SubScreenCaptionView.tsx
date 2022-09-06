import React from "react";
import loadable, { lazy } from "@loadable/component";

import { Track } from "./Api";

import { Box, Skeleton } from "@chakra-ui/react";

const TrackCaption = loadable(() => import(/* webpackPrefetch: true */ "./TrackCaption"));

export const SubScreenCaptionView: React.FC<{ track: Track }> = ({ track }) => {
  return (
    <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
      <Box fontSize="3.6vw" w="100%" h="100%">
        <TrackCaption track={track} onUnsubscribe={() => {}} h="100%" />
      </Box>
    </React.Suspense>
  );
};
