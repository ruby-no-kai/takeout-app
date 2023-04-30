import React from "react";
import { Colors } from "./theme";
import { Box, HStack, Flex, Heading, Text, Link } from "@chakra-ui/react";
import { VisuallyHidden } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { EventNoteIcon } from "./EventNoteIcon";
import { AccountCircleIcon } from "./AccountCircleIcon";
import { VideoCameraFrontIcon } from "./VideoCameraFrontIcon";
import { Logo } from "./Logo";

import Api from "./Api";

export const Navbar: React.FC = () => {
  const { data: conferenceData } = Api.useConference();
  const { data: sessionData } = Api.useSession();

  return (
    <Flex as="nav" justify="space-between" alignItems="center" w="100%" h="56px" px="15px" bgColor={Colors.bg}>
      <Heading as="h1" size="lg" fontSize="22px" css={{ "& svg": { height: "22px", width: "auto" } }}>
        {conferenceData?.conference ? (
          <Link as={RouterLink} to={`/tracks/${conferenceData.conference.default_track}`} color={Colors.main}>
            <VisuallyHidden>RubyKaigi 2023</VisuallyHidden>
            <Logo />
          </Link>
        ) : (
          <Text as="span" color={Colors.main}>
            <VisuallyHidden>RubyKaigi 2023</VisuallyHidden>
            <Logo />
          </Text>
        )}
      </Heading>
      <HStack spacing="14px">
        {sessionData?.attendee?.is_staff || sessionData?.control ? (
          <Link as={RouterLink} to="/control">
            <VisuallyHidden>Live Control Room</VisuallyHidden>
            <VideoCameraFrontIcon boxSize="20px" color={Colors.defaultAvatarBg} />
          </Link>
        ) : null}
        <Link href="https://rubykaigi.org/2023/schedule" isExternal>
          <VisuallyHidden>Schedule</VisuallyHidden>
          <EventNoteIcon boxSize="20px" color={Colors.defaultAvatarBg} />
        </Link>
        <Link as={RouterLink} to="/attendee">
          <VisuallyHidden>Edit your chat profile</VisuallyHidden>
          <AccountCircleIcon boxSize="20px" color={Colors.defaultAvatarBg} />
        </Link>
      </HStack>
    </Flex>
  );
};
export default Navbar;
