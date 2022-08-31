import React, { useEffect, useId, useState } from "react";
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
} from "@chakra-ui/react";

import { Api, TrackCard, TrackCardContent, TrackSlug } from "./Api";
import { ControlApi, ControlTrackCard, ConferencePresentationSlug, ControlGetConferenceResponse } from "./ControlApi";
import { ErrorAlert, errorToToast } from "./ErrorAlert";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import ControlTrackCardView from "./ControlTrackCardView";
import { ErrorBoundary } from "react-error-boundary";

type FormData = {
  json: string;
  track: TrackSlug;
  timeMode: "absolute" | "relative";
  absoluteTime: string;
  relativeTimeInSeconds: number;
};

type CardDraft =
  | {
      card: TrackCard | null;
      error?: null;
    }
  | {
      card?: null;
      error: Error | unknown;
    };

function generateTrackCard(data: FormData): CardDraft {
  if (!data.json.match(/[^\s]/)) {
    return { card: null };
  }
  const json = ((j) => {
    try {
      return { json: JSON.parse(j) as TrackCardContent };
    } catch (e) {
      return { error: e };
    }
  })(data.json);
  if (json.error) {
    return { error: json.error };
  }
  const activationAt =
    data.timeMode === "absolute"
      ? data.absoluteTime === ""
        ? dayjs().unix()
        : dayjs(data.absoluteTime).unix()
      : dayjs()
          .add(data.relativeTimeInSeconds * 1000)
          .unix();
  const card: ControlTrackCard = {
    ...json.json,
    id: -1,
    track: data.track,
    ut: 0,
    at: activationAt,
    control_colleration: null,
  };
  return { card };
}

export const ControlTrackCardForm: React.FC<{
  trackSlug: TrackSlug;
  initialValue?: TrackCardContent;
  disclosureProps?: UseDisclosureReturn;
}> = ({ trackSlug, initialValue, disclosureProps }) => {
  const formID = useId();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = disclosureProps ?? useDisclosure();
  const [isDraftGood, setIsDraftGood] = useState<boolean | null>();
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const { data: conferenceData } = Api.useConference();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      json: initialValue ? JSON.stringify(initialValue, null, 2) : "",
      track: trackSlug,
      timeMode: "absolute",
      absoluteTime: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      relativeTimeInSeconds: 0,
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    const finalDraft = generateTrackCard(data);
    if (!finalDraft.card) return;
    if (!isDraftGood) return;
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const card = finalDraft.card;
      console.log("draft to submit", card);
      await ControlApi.createTrackCard(card);
      reset();
      onClose();
    } catch (e) {
      toast(errorToToast(e));
    }
    setIsRequesting(false);
  });
  const loadPredefined = (card: TrackCardContent) => {
    setValue("json", JSON.stringify(card, null, 2));
  };
  const timeMode = watch("timeMode");
  const cardDraft = generateTrackCard(watch());
  return (
    <>
      {disclosureProps ? null : <Button onClick={onOpen}>Compose</Button>}

      <Modal size="5xl" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compose TrackCard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack w="100%" alignItems="flex-start">
              <Box flex={1}>
                <VStack w="100%" alignItems="flex-start">
                  <CardFormPredefinedLoader onLoad={loadPredefined} />
                  <VStack as="form" w="100%" onSubmit={onSubmit} id={formID}>
                    <Textarea
                      placeholder="TrackCardContent in JSON"
                      w="100%"
                      minH="300px"
                      fontSize="12px"
                      fontFamily={[
                        "Noto Sans CJK Mono",
                        "Source Han Code JP",
                        "Source Code Pro",
                        "Consolas",
                        "Andale Mono",
                        "monospace",
                      ]}
                      {...register("json")}
                    />
                    <FormControl>
                      <FormLabel>Track</FormLabel>
                      <Select size="sm" {...register("track")} isDisabled={!conferenceData}>
                        {conferenceData ? (
                          conferenceData.conference.track_order.map((v) => {
                            const t = conferenceData.conference.tracks[v];
                            if (!t) return null;
                            return (
                              <option key={t.slug} value={t.slug}>
                                {t.name} ({t.slug})
                              </option>
                            );
                          })
                        ) : trackSlug[0] !== "_" ? (
                          <option key={trackSlug} value={trackSlug}>
                            {trackSlug}
                          </option>
                        ) : null}
                        <option value="_screen">Screen (_screen)</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Activate at (default=now)</FormLabel>
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
                        <Input
                          pl="4.5rem"
                          type="datetime-local"
                          step={1}
                          {...register("absoluteTime", { valueAsDate: true })}
                        />
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
                        <Input
                          pl="4.5rem"
                          type="number"
                          {...register("relativeTimeInSeconds", { valueAsNumber: true })}
                        />
                      </InputGroup>
                    </FormControl>
                  </VStack>
                </VStack>
              </Box>
              <Box flex={1} h="100%">
                <CardFormPreview draft={cardDraft} onFeedback={(ok) => setIsDraftGood(ok)} />
              </Box>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              form={formID}
              type="submit"
              isDisabled={!isDraftGood}
              isLoading={isRequesting}
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const CardFormPredefinedLoader: React.FC<{ onLoad: (c: TrackCardContent) => any }> = ({ onLoad }) => {
  const toast = useToast();
  const { data: controlConferenceData } = ControlApi.useConference();
  const { register, handleSubmit, reset } = useForm<{
    slug: ConferencePresentationSlug;
  }>({
    defaultValues: {
      slug: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!controlConferenceData) return;
    const card = generateTrackCardFromPresentation(controlConferenceData, data.slug);
    if (card) {
      console.log(card);
      onLoad(card);
      reset();
    } else {
      toast({
        status: "error",
        title: "Presentation not exists",
        description: `Couldn't find "${data.slug}"!`,
        duration: 10000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  });

  return (
    <Box w="100%">
      <form onSubmit={onSubmit}>
        <Flex w="100%" direction="row">
          <Input flexGrow={2} size="sm" placeholder="Presentation slug to load..." {...register("slug")} />
          <Button size="sm" type="submit" isLoading={!controlConferenceData}>
            Load
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

const CardFormPreviewFeedback: React.FC<{
  card: TrackCard;
  onFeedback: (card: TrackCard) => void;
  children: React.ReactNode;
}> = ({ card, onFeedback, children }) => {
  useEffect(() => {
    onFeedback(card);
  }, [card]);
  return <>{children}</>;
};

const CardFormPreview: React.FC<{ draft: CardDraft; onFeedback: (ok: boolean) => void }> = ({ draft, onFeedback }) => {
  const [lastKnownGoodCard, setLastKnownGoodCard] = useState(draft.card ?? null);
  let card = draft.card ?? lastKnownGoodCard;
  let onGoodState = !!(card && card === draft.card);

  useEffect(() => {
    onFeedback(onGoodState);
  }, [onGoodState]);

  if (card === null) {
    return (
      <Center w="100%" h="100%">
        <Text>Preview will appear here!</Text>
      </Center>
    );
  }

  return (
    <Box w="100%" h="100%">
      {card ? (
        <ErrorBoundary
          resetKeys={[card]}
          fallbackRender={({ error }) => {
            return (
              <>
                {lastKnownGoodCard ? <ControlTrackCardView card={{ id: -1, ...lastKnownGoodCard }} /> : null}
                <ErrorAlert error={error} />
              </>
            );
          }}
        >
          <CardFormPreviewFeedback onFeedback={(card) => setLastKnownGoodCard(card)} card={card}>
            <ControlTrackCardView card={{ id: -1, ...card }} />
          </CardFormPreviewFeedback>
        </ErrorBoundary>
      ) : null}
      {draft.error ? <ErrorAlert error={draft.error} /> : null}
    </Box>
  );
};

function generateTrackCardFromPresentation(
  controlConferenceData: ControlGetConferenceResponse,
  slug: ConferencePresentationSlug,
): TrackCardContent | null {
  const presentation = controlConferenceData.presentations[slug]!;
  if (!presentation) {
    return null;
  }

  return {
    interpretation: presentation.language !== "EN", // TODO:
    topic: {
      title: presentation.title,
      author: presentation.speaker_slugs.join(", "),
      description: presentation.description,
      labels: [presentation.kind, presentation.language], // TODO:
    },
    speakers: presentation.speaker_slugs.map((ss) => {
      const speaker = controlConferenceData.speakers[ss]!;
      return {
        name: speaker.name,
        github_id: speaker.github_id,
        twitter_id: speaker.twitter_id,
        avatar_url: speaker.avatar_url,
      };
    }),
  };
}

export default ControlTrackCardForm;
