import React from "react";

import { Box, VStack, HStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Collapse, CircularProgress } from "@chakra-ui/react";

import { Colors } from "./theme";

import { ChatStatus } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";

export interface Props {
  status: ChatStatus | undefined;
  loading: boolean;
  error: Error | null | undefined;
}

export const ChatStatusView: React.FC<Props> = ({ status, loading, error }) => {
  const shouldClose = status === "CONNECTED" && !loading && !error;
  const [shouldCloseState, setShouldCloseState] = React.useState(shouldClose);

  React.useEffect(() => {
    const timer = setTimeout(() => setShouldCloseState(shouldClose), 1500);
    return () => clearTimeout(timer);
  }, [shouldClose]);

  let statusHuman = "Doing something (unknown state!?)";
  let progress = -1;

  if (status === "INIT" || status === undefined) {
    statusHuman = "Obtaining chat session";
    progress = 25;
  } else if (status === "READY" || status === "CONNECTING" || status == "CONNECT_ERROR") {
    statusHuman = "Connecting to chat";
    progress = 50;
  } else if (loading) {
    statusHuman = "Loading chat history";
    progress = 75;
  } else if (status === "CONNECTED") {
    statusHuman = "Connected to chat";
    progress = 100;
  } else if (status === "SHUTTING_DOWN") {
    statusHuman = "Disconnecting";
    progress = -1;
  }

  // TODO: (refactor) move minH/w/flexBasis to TrackChat
  return (
    <Box w="100%" flexBasis={0}>
      <Collapse in={!shouldCloseState} animateOpacity>
        <VStack py={1} w="100%" bgColor="#ffffff" borderBottom="1px solid" borderColor={Colors.chatBorder}>
          <HStack>
            <CircularProgress
              aria-label={`${statusHuman}`}
              value={progress}
              isIndeterminate={progress === -1}
              size="15px"
            />
            <Text aria-hidden="true" fontSize="14px">
              {statusHuman}
            </Text>
          </HStack>
        </VStack>
      </Collapse>
      {error ? <ErrorAlert error={error} /> : null}
    </Box>
  );
};
