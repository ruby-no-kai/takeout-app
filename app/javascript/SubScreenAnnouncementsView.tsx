import React, { useState, useEffect } from "react";
import loadable, { lazy } from "@loadable/component";

import { Track } from "./Api";
import { Api } from "./Api";

import { Box, Flex, Skeleton } from "@chakra-ui/react";

import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";

const TICK_INTERVAL = 1;
const ROTATE_INTERVAL = 12;
export const SubScreenAnnouncementsView: React.FC<{ track: Track }> = ({ track }) => {
  const [tick, setTick] = useState(dayjs().unix());
  const { data } = Api.useVenueAnnouncements();
  useEffect(() => {
    setTick(dayjs().unix());
    const timer = setInterval(() => {
      setTick(dayjs().unix());
    }, TICK_INTERVAL * 1000);
    return () => clearInterval(timer);
  }, []);
  if (!data) return <></>;

  console.log("useVenueAnnouncements", data);

  const entries = data.venue_announcements.filter(
    (v) => !v.only_signage && (track.card?.intermission ? !v.only_intermission : true),
  );
  console.log("useVenueAnnouncements/entries", entries);
  if (entries.length == 0) return <></>;

  const now = tick === -1 ? dayjs().unix() : tick;
  const ann = entries[Math.floor(now / ROTATE_INTERVAL) % entries.length];

  console.log("ann", ann);
  return (
    <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
      <Flex w="100%" h="100%" direction="row" justify="space-between">
        <Box fontSize="3.6vw" w="100%" h="100%">
          {returnToBr(ann.content)}
        </Box>
        {ann.url ? (
          <>
            <Box css={{ "& svg": { height: "100%", width: "auto" } }} bgColor="white">
              <QRCodeSVG value={ann.url} level={"M"} includeMargin={true} size={300} />
            </Box>
          </>
        ) : null}
      </Flex>
    </React.Suspense>
  );
};

// XXX: returnToBr dupe
function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}
