import React from "react";
import loadable from "@loadable/component";

import { Link, Box, Alert, AlertIcon } from "@chakra-ui/react";

import { Api, TrackCard } from "./Api";
import { COMMIT } from "./meta";

const TrackTopic = loadable(() => import("./TrackTopic"));

export interface Props {
  card: TrackCard | null;
  nav?: JSX.Element;
}

export const TrackCardView: React.FC<Props> = ({ card, nav }) => {
  const { data: appVersion } = Api.useAppVersion();

  console.log({ COMMIT, appVersion });

  return (
    <Box>
      <TrackTopic card={card} topicNav={nav} />

      {appVersion && appVersion.commit !== COMMIT ? (
        <Alert status="info" mt={1}>
          <AlertIcon />
          New app version available;
          <Link textDecoration="underline" onClick={() => window.location.reload()} ml={1}>
            Reload?
          </Link>
        </Alert>
      ) : null}
    </Box>
  );
};
export default TrackCardView;
