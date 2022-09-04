import React, { useEffect, useState } from "react";
import loadable, { lazy } from "@loadable/component";

import { Box, Flex, Heading, VStack } from "@chakra-ui/react";
import { Grid, GridItem, Skeleton, AspectRatio } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Api, Track, TrackSlug } from "./Api";
import { ControlApi, ControlTrackCard } from "./ControlApi";

import { ChatProvider } from "./ChatProvider";
import { useParams } from "react-router-dom";

const AppVersionAlert = loadable(() => import("./AppVersionAlert"));
const ControlChatSpotlightView = loadable(() => import("./ControlStreamPresence"));
const ControlStreamPresence = loadable(() => import("./ControlStreamPresence"));
const ControlTrackCardForm = loadable(() => import("./ControlTrackCardForm"));
const ControlTrackCardView = loadable(() => import("./ControlTrackCardView"));
const TrackCaption = lazy(() => import("./TrackCaption"));
const TrackChat = lazy(() => import("./TrackChat"));
const TrackVideo = lazy(() => import(/* webpackPrefetch: true */ "./TrackVideo"));
const TrackViewerCount = loadable(() => import(/* webpackPrefetch: true */ "./TrackViewerCount"));

export const ControlTrackPage: React.FC = () => {
  const { slug: trackSlug }: Readonly<Partial<{ slug: TrackSlug }>> = useParams();
  const { data } = Api.useConference();

  if (!data) return <p>Loading..</p>;
  const track = data.conference.tracks[trackSlug ?? ""];
  if (!track) return <p>four-oh-four, track not exists</p>;

  return (
    <ChatProvider>
      <Grid
        w="100%"
        h="100%"
        minH="92vh"
        templateAreas={`"preview infopane chatpane"
         "trackcard infopane chatpane"`}
        templateColumns="1fr 20%  20%"
        templateRows="75% 25% "
        gap={4}
      >
        <GridItem area={"preview"}>
          <VideoPane track={track} />
        </GridItem>

        <GridItem area={"trackcard"} overflowY="hidden" overflowX="scroll">
          <InfoPane track={track} />
        </GridItem>

        <GridItem area={"infopane"}>
          <Box h="98%" w="100%">
            <ControlStreamPresence track={track} />
            <TrackCaption h="200px" track={track} onUnsubscribe={() => {}} />
            <AppVersionAlert />
            {track.viewerCount ? <TrackViewerCount count={track.viewerCount} /> : null}
          </Box>
        </GridItem>

        <GridItem area={"chatpane"} h="100%">
          {track.chat ? (
            <Box w="100%" h="98%">
              <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
                <TrackChat track={track} />
              </React.Suspense>
            </Box>
          ) : null}
        </GridItem>
      </Grid>
    </ChatProvider>
  );
};

export const VideoPane: React.FC<{ track: Track }> = ({ track }) => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data: presences } = ControlApi.useTrackStreamPresence(track.slug);
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box>
      <Tabs isLazy index={currentTab} onChange={setCurrentTab} variant="soft-rounded">
        <Flex direction="row" justify="space-between" alignItems="center">
          <Box>
            <Heading as="p" fontSize="1.1rem">
              {track.name} ({track.slug})
            </Heading>
          </Box>

          <TabList>
            <Tab>Main</Tab>
            <Tab>Interpretation</Tab>
          </TabList>
        </Flex>
        <TabPanels>
          <TabPanel p={0}>
            <React.Suspense
              fallback={
                <AspectRatio ratio={16 / 9}>
                  <Skeleton w="100%" h="100%" />
                </AspectRatio>
              }
            >
              <TrackVideo
                track={track}
                streamOptions={{ interpretation: false }}
                ignoreStreamPresence={presences?.stream_statuses.main?.state === "LIVE"}
              />
            </React.Suspense>
          </TabPanel>
          <TabPanel p={0}>
            <React.Suspense
              fallback={
                <AspectRatio ratio={16 / 9}>
                  <Skeleton w="100%" h="100%" />
                </AspectRatio>
              }
            >
              <TrackVideo
                track={track}
                streamOptions={{ interpretation: true }}
                ignoreStreamPresence={presences?.stream_statuses.interpretation?.state === "LIVE"}
              />
            </React.Suspense>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export const InfoPane: React.FC<{ track: Track }> = ({ track }) => {
  const { data: cardsData, mutate: mutateCards } = ControlApi.useTrackCards(track.slug);

  useEffect(() => {
    mutateCards();
  }, [track.card?.id, track.card?.ut, track.card_candidate?.id, track.card_candidate?.ut]);

  return (
    <Box>
      <Flex direction="row">
        {cardsData?.track_cards ? (
          <>
            {cardsData.track_cards[0] ? (
              <TrackCardBox heading="Current card" card={cardsData.track_cards[0]} />
            ) : (
              <Box flex={1} />
            )}
            {cardsData.track_cards[1] ? (
              <TrackCardBox heading="Up next" card={cardsData.track_cards[1]} />
            ) : (
              <Box flex={1} />
            )}
          </>
        ) : null}
        <Box flex={1}>
          <VStack>
            <ControlTrackCardForm trackSlug={track.slug} />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

const TrackCardBox: React.FC<{ heading: string; card: ControlTrackCard }> = ({ heading, card }) => {
  return (
    <Box mr={3} flex={1}>
      <Heading as="h5" fontSize="1.1rem">
        {heading}
      </Heading>
      <ControlTrackCardView card={card} />
    </Box>
  );
};

export default ControlTrackPage;
