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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
} from "@chakra-ui/react";

import { Api, TrackCard, TrackCardContent, TrackSlug } from "./Api";
import { ControlApi, ControlTrackCard, ConferencePresentationSlug, ControlGetConferenceResponse } from "./ControlApi";
import { ErrorAlert, errorToToast } from "./ErrorAlert";

type FormData = {
  mode: "announcement" | "filler";

  basic: {
    heading: string;
    footer: string;
  };

  nextSchedule: {
    enable: boolean;
    title: string;
    time: string;
    absoluteOnly: boolean;
  };

  timeMode: "absolute" | "relative";
  absoluteTime: string;
  relativeTimeInSeconds: number;
};

function formDataToTrackCard(data: FormData): TrackCard {
  const activationAt =
    data.timeMode === "absolute"
      ? data.absoluteTime === ""
        ? dayjs().unix()
        : dayjs(data.absoluteTime).unix()
      : dayjs()
          .add(data.relativeTimeInSeconds * 1000)
          .unix();
  const header = {
    track: "_screen",
    ut: 0,
    at: activationAt,
  };

  if (data.mode === "filler") {
    return {
      ...header,
      screen: {
        filler: true,
      },
    };
  } else if (data.mode === "announcement") {
    const nextSchedule = data.nextSchedule.enable
      ? {
          next_schedule: {
            at: dayjs(data.nextSchedule.time).unix(),
            title: data.nextSchedule.title,
            absolute_only: data.nextSchedule.absoluteOnly,
          },
        }
      : {};
    return {
      ...header,
      screen: {
        heading: data.basic.heading,
        footer: data.basic.footer,
        ...nextSchedule,
      },
    };
  }
  throw new Error("[BUG] Unreachable");
}

export const ControlScreenForm: React.FC<{}> = ({}) => {
  const toast = useToast();
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  //const { data: conferenceData } = Api.useConference();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      mode: "announcement",
      basic: { heading: "", footer: "" },
      nextSchedule: {
        enable: false,
        title: "",
        time: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        absoluteOnly: false,
      },
      timeMode: "absolute",
      absoluteTime: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      relativeTimeInSeconds: 0,
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const card = formDataToTrackCard(data);
      console.log("draft to submit", card);
      await ControlApi.createTrackCard(card);
      reset();
    } catch (e) {
      toast(errorToToast(e));
    }
    setIsRequesting(false);
  });
  const screenMode = watch("mode");
  const tabIndex = { announcement: 0, filler: 1 }[screenMode];
  const onTabChange = (i: number) => {
    if (i == 0) {
      setValue("mode", "announcement");
    } else {
      setValue("mode", "filler");
    }
  };
  const timeMode = watch("timeMode");

  const nextScheduleEnabled = watch("nextSchedule.enable");

  return (
    <Box as="form" onSubmit={onSubmit} p={1} backgroundColor="white">
      <Tabs variant="soft-rounded" index={tabIndex} onChange={onTabChange}>
        <TabList>
          <Tab>Announcement mode</Tab>
          <Tab>Filler mode</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormControl>
              <FormLabel>Heading</FormLabel>
              <Textarea {...register("basic.heading")} />
            </FormControl>

            <FormControl>
              <FormLabel>Footer</FormLabel>
              <Textarea {...register("basic.footer")} />
            </FormControl>

            <FormControl>
              <FormLabel>Show next schedule/event</FormLabel>
              <Checkbox {...register("nextSchedule.enable")}>Enable</Checkbox>
            </FormControl>

            {nextScheduleEnabled ? (
              <>
                <FormControl>
                  <Input type="text" placeholder="Event/Schedule title" {...register("nextSchedule.title")} />
                </FormControl>
                <FormControl>
                  <Input type="datetime-local" step={1} {...register("nextSchedule.time")} />
                </FormControl>
                <FormControl>
                  <Checkbox {...register("nextSchedule.absoluteOnly")}>Hide relative time</Checkbox>
                </FormControl>
              </>
            ) : null}
          </TabPanel>
          <TabPanel>
            <Text>There's no option for filler mode :)</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>

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
        <Button type="submit" colorScheme="teal" isLoading={isRequesting}>
          Send
        </Button>
      </FormControl>
    </Box>
  );
};

export default ControlScreenForm;
