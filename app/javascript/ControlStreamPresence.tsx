import React from "react";
import loadable from "@loadable/component";
import dayjs from "dayjs";

import {
  Flex,
  Box,
  Skeleton,
  SkeletonText,
  Text,
  HStack,
  Button,
  useToast,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { Api, StreamPresence, Track, TrackCard, TrackStreamKind } from "./Api";
import { ControlApi, ControlIvsStream } from "./ControlApi";
import { Colors } from "./theme";
import { ErrorAlert, errorToToast } from "./ErrorAlert";
import { RepeatIcon } from "@chakra-ui/icons";

export type Props = {
  track: Track;
};

export const ControlStreamPresence: React.FC<Props> = ({ track }) => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data, error, mutate } = ControlApi.useTrackStreamPresence(track.slug);

  if (!data) {
    return (
      <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
        <Skeleton w="100%" h="160px" />
        {error ? <ErrorAlert error={error} /> : null}
      </Box>
    );
  }

  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      {error ? <ErrorAlert error={error} /> : null}

      <Flex direction="row" justifyContent="space-between">
        <Text as="p">
          <>as of {dayjs.unix(data.at).format()}</>
        </Text>
        <Box>
          <IconButton
            background="transparent"
            icon={<RepeatIcon boxSize="14px" />}
            minW="30px"
            w="30px"
            h="30px"
            aria-label="Reload"
            onClick={() => {
              mutate();
            }}
          />
        </Box>
      </Flex>

      <StreamPresenceBox
        track={track}
        kind="main"
        presence={data.stream_presences["main"]}
        status={data.stream_statuses["main"]}
      />
      <StreamPresenceBox
        track={track}
        kind="interpretation"
        presence={data.stream_presences["interpretation"]}
        status={data.stream_statuses["interpretation"]}
      />
    </Box>
  );
};

export const StreamPresenceBox: React.FC<{
  track: Track;
  kind: TrackStreamKind;
  presence: StreamPresence | null;
  status: ControlIvsStream | null;
}> = ({ track, kind, presence, status }) => {
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const toast = useToast();

  if (presence === null) return <></>;

  const buttonAction = (() => {
    if (presence.online) {
      return "shutdown";
    } else if (status?.state === "LIVE") {
      return "golive";
    } else {
      return "notready";
    }
  })();

  const buttonLabel = {
    notready: "Unavailable; the live stream is not active",
    golive: "Reveal the stream pane to users",
    shutdown: "Hide the stream pane from users",
  }[buttonAction];

  const onPresenceUpdateButton = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    ControlApi.updateTrackStreamPresence(track.slug, kind, !presence.online)
      .then(() => {
        setIsRequesting(false);
      })
      .catch((e) => {
        setIsRequesting(false);
        toast(errorToToast(e));
      });
  };

  return (
    <Box mt={3} px={2}>
      <Flex direction="row" alignItems="center" justifyContent="space-between">
        <Heading as="h4" fontSize="1.1rem">
          {kind}
        </Heading>

        <Box>
          <Tooltip label={buttonLabel} shouldWrapChildren={buttonAction === "notready"}>
            <Button
              size="sm"
              minWidth="120px"
              colorScheme={{ notready: "gray", golive: "teal", shutdown: "red" }[buttonAction]}
              isLoading={isRequesting}
              isDisabled={buttonAction === "notready"}
              onClick={onPresenceUpdateButton}
            >
              {{ notready: "Go Live", golive: "Go Live", shutdown: "End Stream" }[buttonAction]}
            </Button>
          </Tooltip>
        </Box>
      </Flex>

      <HStack w="100%" justifyContent="space-between">
        <Box>
          <Text fontWeight="bold">Status</Text>
          {presence.online ? "Live" : "Disabled"}
        </Box>

        {status ? (
          <>
            <Box>
              <Text fontWeight="bold">Ingest</Text>
              {status.state === "LIVE" ? "Up" : "Down"}
            </Box>
            <Box>
              <Text fontWeight="bold">Health</Text>
              {status.health}
            </Box>
            <Box>
              <Text fontWeight="bold">Viewers</Text>
              {status.viewer_count}
            </Box>
          </>
        ) : (
          <Box>
            <Text fontWeight="bold">Ingest</Text>
            Down
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default ControlStreamPresence;
