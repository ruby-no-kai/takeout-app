import React from "react";
import loadable from "@loadable/component";

import { Flex, Box } from "@chakra-ui/react";

import { Api, Track, TrackCard } from "./Api";

import { ControlNextSessionForm } from "./ControlNextSessionForm";

export const ControlNextSessionPage: React.FC = () => {
  return (
    <Box mx="50px">
      <ControlNextSessionForm />
    </Box>
  );
};

export default ControlNextSessionPage;
