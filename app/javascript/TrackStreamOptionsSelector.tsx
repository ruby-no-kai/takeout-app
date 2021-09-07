import React from "react";

import { Box, Stack, Switch, FormLabel, FormControl, Tooltip } from "@chakra-ui/react";

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
      <Stack direction={["row", "row", "row", "column"]} spacing={0}>
        <FormControl display="flex" alignItems="center" h="30px">
          <FormLabel htmlFor="TrackStreamOptions__CC" aria-hidden="true" m={0} mr={1}>
            <Tooltip label="Caption (English only)">
              <ClosedCaptionIcon w="24px" h="24px" />
            </Tooltip>
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
              <Tooltip label="Interpretation (Japanese to English only)">
                <TranslateIcon w="24px" h="24px" />
              </Tooltip>
            </FormLabel>
            <Switch
              aria-label="Japanese to English Interpretation"
              id="TrackStreamOptions__interpret"
              isChecked={options.interpretation}
              onChange={handleOnChange("interpretation")}
            />
          </FormControl>
        ) : null}
      </Stack>
    </Box>
  );
};

export default TrackStreamOptionsSelector;
