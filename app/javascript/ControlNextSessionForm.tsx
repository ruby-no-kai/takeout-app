import React, { useEffect, useId, useState } from "react";
import loadable from "@loadable/component";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
// import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  HStack,
  Flex,
  Textarea,
  VStack,
  InputGroup,
  InputLeftElement,
  Center,
  Text,
  Tooltip,
  useToast,
  Select,
  UseDisclosureReturn,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Skeleton,
  Heading,
} from "@chakra-ui/react";

import { Api, TrackCard, TrackCardContent, TrackSlug } from "./Api";
import {
  ControlApi,
  ControlTrackCard,
  ConferencePresentationSlug,
  ControlGetConferenceResponse,
  ControlCreateNextSessionRequest,
  ControlCreateNextSessionResponse,
} from "./ControlApi";
import { ErrorAlert, errorToToast } from "./ErrorAlert";

const ControlTrackCardView = loadable(() => import("./ControlTrackCardView"));
const ControlChatSpotlightView = loadable(() => import("./ControlChatSpotlightView"));

type FormData = {
  tracks: {
    [key: TrackSlug]: {
      slug: ConferencePresentationSlug;
    };
  };
  timeMode: "absolute" | "relative";
  absoluteTime: string;
  relativeTimeInSeconds: number;
};

export const ControlNextSessionForm: React.FC<{}> = ({}) => {
  const toast = useToast();
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = React.useState<ControlCreateNextSessionResponse | null>(null);
  const { data: conferenceData } = Api.useConference();
  const { data: controlConferenceData } = ControlApi.useConference();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      tracks: {},
      timeMode: "absolute",
      absoluteTime: dayjs().add(10, "minute").format("YYYY-MM-DDTHH:mm:ss"),
      relativeTimeInSeconds: 600,
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    if (!conferenceData) return;
    setIsRequesting(true);
    const activationAt =
      data.timeMode === "absolute"
        ? data.absoluteTime === ""
          ? dayjs().unix()
          : dayjs(data.absoluteTime).unix()
        : dayjs()
            .add(data.relativeTimeInSeconds * 1000)
            .unix();
    /*{
  next_sessions: { track: TrackSlug; presentation: ConferencePresentationSlug }[];
  activation_at: number;
  description: string;
  }*/
    try {
      console.log("data", data);
      const payload: ControlCreateNextSessionRequest = {
        activation_at: activationAt,
        description: `ns: ${JSON.stringify(data.tracks)}`,
        next_sessions: conferenceData.conference.track_order.flatMap((trackSlug) => {
          const s = data.tracks[trackSlug];
          return s ? [{ track: trackSlug, presentation: s.slug }] : [];
        }),
      };
      console.log("nextSession payload", payload);
      const resp = await ControlApi.createNextSession(payload);
      console.log("nextSession res", resp);
      setSubmissionResult(resp);
      reset();
    } catch (e) {
      toast(errorToToast(e));
    }
    setIsRequesting(false);
  });
  const timeMode = watch("timeMode");
  const tracks = watch("tracks");

  return (
    <Box>
      <Box as="form" onSubmit={onSubmit} p={1} backgroundColor="white">
        {conferenceData ? (
          <>
            {conferenceData.conference.track_order.map((trackSlug) => {
              return (
                <FormControl key={trackSlug}>
                  <FormLabel>
                    {conferenceData.conference.tracks[trackSlug]?.name ?? ""} ({trackSlug})
                  </FormLabel>
                  <Input
                    placeholder="Presentation slug (leave empty to omit)"
                    {...register(`tracks.${trackSlug}.slug`)}
                  />
                  {tracks[trackSlug].slug ? (
                    <>
                      {controlConferenceData ? (
                        <Box minH="60px">
                          <NextSessionPreview
                            controlConferenceData={controlConferenceData}
                            presentationSlug={tracks[trackSlug].slug}
                          />
                        </Box>
                      ) : (
                        <Skeleton h="60px" />
                      )}
                    </>
                  ) : (
                    <Box h="60px" />
                  )}
                </FormControl>
              );
            })}
          </>
        ) : (
          <Skeleton />
        )}

        <FormControl>
          <FormLabel>Activate at </FormLabel>
          <InputGroup display={timeMode === "absolute" ? "block" : "none"}>
            <InputLeftElement width="4.0rem">
              <Tooltip
                label="Click to enter using relative time"
                display={timeMode === "absolute" ? "block" : "none"}
                openDelay={30}
              >
                <Button size="sm" h="1.75rem" onClick={() => setValue("timeMode", "relative")}>
                  at:
                </Button>
              </Tooltip>
            </InputLeftElement>
            <Input pl="4.5rem" type="datetime-local" step={1} {...register("absoluteTime", { valueAsDate: true })} />
          </InputGroup>
          <InputGroup display={timeMode === "relative" ? "block" : "none"}>
            <InputLeftElement width="4.0rem">
              <Tooltip
                label="Click to enter using absolute time"
                display={timeMode === "relative" ? "block" : "none"}
                openDelay={30}
              >
                <Button size="sm" h="1.75rem" onClick={() => setValue("timeMode", "absolute")}>
                  in:
                </Button>
              </Tooltip>
            </InputLeftElement>
            <Input pl="4.5rem" type="number" {...register("relativeTimeInSeconds", { valueAsNumber: true })} />
          </InputGroup>
        </FormControl>

        <FormControl>
          <Button type="submit" colorScheme="teal" isLoading={isRequesting} isDisabled={!conferenceData}>
            Send
          </Button>
        </FormControl>
      </Box>
      {submissionResult ? (
        <Box>
          <NextSessionResult result={submissionResult} />
        </Box>
      ) : null}
    </Box>
  );
};

const NextSessionPreview: React.FC<{
  controlConferenceData: ControlGetConferenceResponse;
  presentationSlug: ConferencePresentationSlug;
}> = ({ controlConferenceData, presentationSlug }) => {
  const presentation = controlConferenceData.presentations[presentationSlug];
  if (!presentation) {
    return <Text>?</Text>;
  }

  const speakers = presentation.speaker_slugs.map((ss) => {
    const speaker = controlConferenceData.speakers[ss];
    return speaker ? `${ss} (${speaker.name})` : `${ss} (UNKNOWN)`;
  });

  return (
    <>
      <Text>{presentation.title}</Text>
      <Text>{speakers.join(", ")}</Text>
    </>
  );
};

const NextSessionResult: React.FC<{ result: ControlCreateNextSessionResponse }> = ({ result }) => {
  return (
    <Box mt={2}>
      <Heading as="h4" fontSize="1.3rem">
        ✅ Submitted next session
      </Heading>
      <Flex direction="row" mt={2}>
        <Box flex={1} mr={1}>
          <Heading as="h5" fontSize="1.1rem">
            Track Cards
          </Heading>
          <>
            {result.track_cards.map((v) => {
              if (v.control_colleration?.id !== result.control_colleration.id) {
                return <React.Fragment key={v.id}></React.Fragment>;
              } else {
                return <ControlTrackCardView key={v.id} isActionable={true} card={v} />;
              }
            })}
          </>
        </Box>
        <Box flex={1}>
          <Heading as="h5" fontSize="1.1rem">
            Chat Spotlights
          </Heading>
          <>
            {result.chat_spotlights.map((v) => {
              if (v.control_colleration?.id !== result.control_colleration.id) {
                return <React.Fragment key={v.id}></React.Fragment>;
              } else {
                return <ControlChatSpotlightView key={v.id} isActionable={true} chatSpotlight={v} />;
              }
            })}
          </>
        </Box>
      </Flex>
    </Box>
  );
};

export default ControlNextSessionForm;
