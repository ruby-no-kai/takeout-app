import React from "react";

import { Box, Container } from "@chakra-ui/react";
import { Text, Badge, Tooltip, Center, Circle, Image } from "@chakra-ui/react";

import { Api } from "./Api";
import { ChatStatus } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";

export interface Props {
  status: ChatStatus | undefined;
  loading: boolean;
  error: Error | null | undefined;
}

export const ChatStatusView: React.FC<Props> = ({ status, loading, error }) => {
  if (status === "CONNECTED" && !loading && !error) return <></>;

  let statusHuman = "Doing something (unknown state!?)";

  if (status === "INIT" || status === undefined) {
    statusHuman = "Obtaining session";
  } else if (status === "READY" || status === "CONNECTING" || status == "CONNECT_ERROR") {
    statusHuman = "Connecting";
  } else if (loading) {
    statusHuman = "Loading history";
  } else if (status === "CONNECTED") {
    statusHuman = "Connected";
  } else if (status === "SHUTTING_DOWN") {
    statusHuman = "Disconnecting";
  }

  // TODO: (refactor) move minH/w/flexBasis to TrackChat
  return (
    <Box minH="16px" w="100%" flexBasis={0}>
      <Box textAlign="center" py={1} mb={2}>
        <Text fontSize="14px">{statusHuman}</Text>
      </Box>
      {error ? <ErrorAlert error={error} /> : null}
    </Box>
  );
};