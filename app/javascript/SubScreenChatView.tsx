import React from "react";
import loadable, { lazy } from "@loadable/component";

import { Track } from "./Api";

import { Box, Skeleton } from "@chakra-ui/react";

const TrackChat = lazy(() => import(/* webpackPrefetch: true */ "./TrackChat"));

export const SubScreenChatView: React.FC<{ track: Track }> = ({ track }) => {
  return (
    <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
      {/* Adjust to w="47.5vw" h="51vw"  w=912 h=979 */}
      {/*
      <Box w={`${47.5 * 0.4}vw`} h={`${51 * 0.4}vw`} css={{ transform: `scale(${1 / 0.4})`, transformOrigin: "0 0" }}>
        */}
      <Box w={`30%`} h={`30%`} css={{ transform: `scale(${1 / 0.3})`, transformOrigin: "0 0" }}>
        <TrackChat track={track} hideForm={true} disableSponsorPromo={true} />
      </Box>
    </React.Suspense>
  );
};
