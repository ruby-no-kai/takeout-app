import React from "react";

import { AspectRatio, Image, Box } from "@chakra-ui/react";

import type { Speaker } from "./Api";
import { DEFAULT_AVATAR_URL } from "./meta";

export interface Props {
  speakers: Speaker[];
}

export const SpeakerAvatar: React.FC<Props> = ({ speakers }) => {
  if (speakers.length == 0) return <></>;
  if (speakers.length == 1) {
    const speaker = speakers[0];
    return (
      <AspectRatio ratio={1}>
        <Box w="100%" h="100%">
          <Image w="100%" h="100%" alt="" src={speaker.avatar_url} fallbackSrc={DEFAULT_AVATAR_URL} />
        </Box>
      </AspectRatio>
    );
  } else {
    const speakerA = speakers[0];
    const speakerB = speakers[1];

    return (
      <AspectRatio ratio={1}>
        <Box w="100%" h="100%">
          <Box w="100%" h="100%">
            <Image
              w="60%"
              h="60%"
              position="absolute"
              bottom={0}
              right={0}
              alt=""
              src={speakerB.avatar_url}
              fallbackSrc={DEFAULT_AVATAR_URL}
            />
            <Image
              w="60%"
              position="absolute"
              top={0}
              left={0}
              h="60%"
              alt=""
              src={speakerA.avatar_url}
              fallbackSrc={DEFAULT_AVATAR_URL}
            />
          </Box>
        </Box>
      </AspectRatio>
    );
  }
};
