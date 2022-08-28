import React from "react";

import { Box, Stack, Switch, FormLabel, FormControl, Tooltip } from "@chakra-ui/react";

import { ClosedCaptionIcon } from "./ClosedCaptionIcon";
import { TranslateIcon } from "./TranslateIcon";

import { Track, TrackStreamOptionsState } from "./Api";

export type Props = {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
  instance: string;
}

export const TrackStreamOptionsSelector: React.FC<Props> = ({
  track,
  streamOptionsState: [options, setOptions],
  instance,
}) => {
  const handleOnChange = (key: "caption" | "interpretation") => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newOptions = { ...options, [`${key}`]: e.target.checked };
      setOptions(newOptions);
    };
  };
  const enAndJa = (track.card?.topic?.labels?.indexOf("EN & JA") ?? -1) !== -1;
  const interpretationLabel = enAndJa ? "English track" : "Japanese to English interpretation";
  return (
    <Box>
      <Stack direction={["row", "row", "row", "column"]} spacing={0}>
        <Tooltip label="Caption (English only)" aria-label="">
          <FormControl display="flex" alignItems="center" h="30px">
            <FormLabel htmlFor={`TrackStreamOptions_${instance}__CC`} aria-hidden="true" m={0} mr={1}>
              <ClosedCaptionIcon w="24px" h="24px" />
            </FormLabel>
            <Switch
              aria-label="Closed Caption"
              id={`TrackStreamOptions_${instance}__CC`}
              isChecked={options.caption}
              onChange={handleOnChange("caption")}
            />
          </FormControl>
        </Tooltip>

        {track.interpretation && track.card?.interpretation ? (
          <Tooltip label={interpretationLabel} aria-label="">
            <FormControl display="flex" alignItems="center" h="30px">
              <FormLabel htmlFor={`TrackStreamOptions_${instance}__interpret`} aria-hidden="true" m={0} mr={1}>
                <TranslateIcon w="24px" h="24px" />
              </FormLabel>
              <Switch
                aria-label={interpretationLabel}
                id={`TrackStreamOptions_${instance}__interpret`}
                isChecked={options.interpretation}
                onChange={handleOnChange("interpretation")}
              />
            </FormControl>
          </Tooltip>
        ) : null}
      </Stack>
    </Box>
  );
};

export default TrackStreamOptionsSelector;
