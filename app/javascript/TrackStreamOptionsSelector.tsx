import React from "react";

import { Box, HStack, Icon, Switch, FormLabel, FormControl } from "@chakra-ui/react";

import { ClosedCaptionIcon } from "./ClosedCaptionIcon";
import { TranslateIcon } from "./TranslateIcon";

import { Track, TrackStreamOptionsState } from "./Api";

export interface Props {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
}

export const TrackStreamOptionsSelector: React.FC<Props> = ({ track, streamOptionsState: [options, setOptions] }) => {
  const handleOnChange = (key: "caption" | "interpretation") => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newOptions = { ...options, [`${key}`]: e.target.checked };
      setOptions(newOptions);
    };
  };
  return (
    <Box>
      <HStack>
        <FormControl display="flex" alignItems="center" h="30px">
          <FormLabel htmlFor="TrackStreamOptions__CC" aria-hidden="true" m={0} mr={1}>
            <ClosedCaptionIcon w="24px" h="24px" />
          </FormLabel>
          <Switch
            aria-label="Closed Caption"
            id="TrackStreamOptions__CC"
            isChecked={options.caption}
            onChange={handleOnChange("caption")}
          />
        </FormControl>

        {track.interpretation && track.card?.interpretation ? (
          <FormControl display="flex" alignItems="center" h="30px">
            <FormLabel htmlFor="TrackStreamOptions__interpret" aria-hidden="true" m={0} mr={1}>
              <TranslateIcon w="24px" h="24px" />
            </FormLabel>
            <Switch
              aria-label="Japanese to English Interpretation"
              id="TrackStreamOptions__interpret"
              isChecked={options.interpretation}
              onChange={handleOnChange("interpretation")}
            />
          </FormControl>
        ) : null}
      </HStack>
    </Box>
  );
};

export default TrackStreamOptionsSelector;
