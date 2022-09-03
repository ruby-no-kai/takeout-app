import React, { useState } from "react";
import dayjs from "dayjs";
import loadable from "@loadable/component";

import { Flex, Box, Tag, HStack, useDisclosure, IconButton, Tooltip, useToast, Skeleton } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";

import { ControlApi, ControlChatSpotlight } from "./ControlApi";

import { Colors } from "./theme";
import { DeleteIcon } from "@chakra-ui/icons";
import { errorToToast } from "./ErrorAlert";

//const ControlChatSpotlightForm = loadable(() => import("./ControlChatSpotlightForm")); // XXX: cyclic?
//const ChatSpotlightView = loadable(() => import("./ChatSpotlightView"));
const ControlCollerationRemovalPrompt = loadable(() => import("./ControlCollerationRemovalPrompt")); // XXX: cyclic?

export const ControlChatSpotlightView: React.FC<{ chatSpotlight: ControlChatSpotlight; isActionable?: boolean }> = ({
  chatSpotlight: spotlight,
  isActionable,
}) => {
  console.log(spotlight);
  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      <Flex justifyContent="space-between" direction="row">
        <Heading as="h6" size="xs">
          {dayjs.unix(spotlight.starts_at).format()}
          {" - "}
          {dayjs.unix(spotlight.ends_at).format()}
        </Heading>

        <Box>
          {isActionable !== false && spotlight.id >= 0 ? (
            <>{spotlight.id >= 0 ? <ChatSpotlightRemoveAction spotlight={spotlight} /> : null}</>
          ) : null}
        </Box>
      </Flex>

      {spotlight.handles.join(", ")}

      <Box>
        {spotlight.control_colleration ? (
          <Tag colorScheme="blue" size="sm">
            {spotlight.control_colleration.description}
          </Tag>
        ) : null}
      </Box>
    </Box>
  );
};

const ChatSpotlightRemoveAction: React.FC<{ spotlight: ControlChatSpotlight }> = ({ spotlight }) => {
  if (spotlight.control_colleration) {
    return <ChatSpotlightRemoveActionColleration spotlight={spotlight} />;
  } else {
    return <ChatSpotlightRemoveActionSingle spotlight={spotlight} />;
  }
};
const ChatSpotlightRemoveActionColleration: React.FC<{ spotlight: ControlChatSpotlight }> = ({ spotlight }) => {
  const disclosure = useDisclosure();
  const { onOpen } = disclosure;
  const onRemoveSingle = () => {
    return ControlApi.deleteChatSpotlight(spotlight);
  };
  return (
    <>
      <IconButton
        background="transparent"
        icon={<DeleteIcon boxSize="14px" />}
        minW="30px"
        w="30px"
        h="30px"
        aria-label="Delete"
        type="submit"
        onClick={onOpen}
      />

      <ControlCollerationRemovalPrompt
        itemType="chatSpotlight"
        item={spotlight}
        disclosure={disclosure}
        onRemoveSingle={onRemoveSingle}
      >
        <ControlChatSpotlightView isActionable={false} spotlight={spotlight} />
      </ControlCollerationRemovalPrompt>
    </>
  );
};
const ChatSpotlightRemoveActionSingle: React.FC<{ spotlight: ControlChatSpotlight }> = ({ spotlight }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const toast = useToast();
  const perform = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    ControlApi.deleteChatSpotlight(spotlight)
      .then(() => {
        setIsRequesting(false);
      })
      .catch((e) => {
        setIsRequesting(false);
        toast(errorToToast(e));
      });
  };
  return (
    <Popover closeOnBlur matchWidth>
      <PopoverTrigger>
        <IconButton
          background="transparent"
          icon={<DeleteIcon boxSize="14px" />}
          minW="30px"
          w="30px"
          h="30px"
          aria-label="Delete"
          type="submit"
        />
      </PopoverTrigger>
      <PopoverContent w="100px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Sure?</PopoverHeader>
        <PopoverBody>
          <Button colorScheme="red" size="sm" onClick={perform} isLoading={isRequesting}>
            Remove
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ControlChatSpotlightView;
