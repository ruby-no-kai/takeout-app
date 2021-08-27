import React from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Box,
  Container,
  Button,
  Link,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Track, Api } from "./Api";
import { ErrorAlert } from "./ErrorAlert";

export interface Props {
  track: Track;
}

export const TrackView: React.FC<Props> = ({ track }) => {
  return (
    <>
      <Container maxW={["auto", "auto", "auto", "1400px"]}>
        <p>{JSON.stringify(track)}</p>
      </Container>
    </>
  );
};
