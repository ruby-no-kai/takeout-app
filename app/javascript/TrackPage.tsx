import React from "react";
import { useParams, useHistory } from "react-router-dom";

import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import Api from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { ChatProvider } from "./ChatProvider";
import { TrackView } from "./TrackView";

export interface Props {}

export const TrackPage: React.FC<Props> = () => {
  const history = useHistory();
  const streamOptionState = Api.useTrackStreamOptions();
  const { slug: trackSlug } = useParams<{ slug: string }>();

  const { data: conferenceData, error: conferenceError } = Api.useConference();
  // const { data: chatSession, error: chatSessionError } = Api.useChatSession();

  if (!conferenceData) {
    return (
      <>
        {conferenceError ? (
          <Box my={2}>
            <ErrorAlert error={conferenceError} />
          </Box>
        ) : null}
        <p>Loading</p>
      </>
    );
  }
  const conference = conferenceData?.conference;

  const trackIndex = conference.track_order.indexOf(trackSlug);
  const tracks = conference.track_order
    .filter((k) => conference.tracks.hasOwnProperty(k))
    .map((k) => conference.tracks[k]);
  const onTabChange = (index: number) => {
    const slug = conference.track_order[index];
    history.push(`/tracks/${slug}`);
  };

  return (
    <>
      <ChatProvider>
        <Tabs isLazy index={trackIndex} onChange={onTabChange}>
          <TabList>
            {tracks.map((t) => (
              <Tab key={t.slug}>{t.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {tracks.map((t) => {
              return (
                <TabPanel key={t.slug}>
                  <TrackView track={t} streamOptionsState={streamOptionState} />
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>
      </ChatProvider>
    </>
  );
};
