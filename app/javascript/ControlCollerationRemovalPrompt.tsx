import React, { useState, useCallback } from "react";
import loadable from "@loadable/component";

import { Flex, Box, Tag, HStack, UseDisclosureReturn, IconButton, Tooltip, useToast, Skeleton } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { errorToToast } from "./ErrorAlert";
import { ControlApi } from "./ControlApi";

const ControlTrackCardView = loadable(() => import("./ControlTrackCardView"));
const ControlChatSpotlightView = loadable(() => import("./ControlChatSpotlightView"));
//
type Item = { id: number; control_colleration?: { id?: number } | null }; // XXX: id!

export const ControlCollerationRemovalPrompt: React.FC<{
  children: React.ReactNode;
  itemType: "trackCard" | "chatSpotlight";
  item: Item;
  disclosure: UseDisclosureReturn;
  onRemoveSingle: () => Promise<void>;
}> = ({ children, itemType, item, disclosure, onRemoveSingle: onRemoveSingleCallback }) => {
  const toast = useToast();
  const [isRequesting, setIsRequesting] = React.useState(false);
  const { isOpen, onClose } = disclosure;
  const onRemoveSingle = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    onRemoveSingleCallback()
      .then(() => {
        setIsRequesting(false);
        onClose();
      })
      .catch((e) => {
        setIsRequesting(false);
        toast(errorToToast(e));
      });
  };
  const onRemoveAll = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    ControlApi.deleteControlColleration(item.control_colleration?.id!) // XXX: id!
      .then(() => {
        setIsRequesting(false);
        onClose();
      })
      .catch((e) => {
        setIsRequesting(false);
        toast(errorToToast(e));
      });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Remove all related items?</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text>This item is a part of colleration. You can choose to remove only this item or all related items.</Text>

          <Detail children={children} item={item} itemType={itemType} />
        </ModalBody>

        <ModalFooter>
          <Button mr={3} colorScheme="gray" isLoading={isRequesting} onClick={onRemoveSingle}>
            Remove
          </Button>
          <Button colorScheme="red" isLoading={isRequesting} onClick={onRemoveAll}>
            Remove all
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Detail: React.FC<{
  itemType: "trackCard" | "chatSpotlight";
  item: Item;
  children: React.ReactNode;
}> = ({ itemType, item, children }) => {
  const { data: colleration } = ControlApi.useControlColleration(item.control_colleration?.id);
  if (!colleration) return <Skeleton />;

  return (
    <>
      <Box>
        <Heading as="h4" fontSize="1.2rem">
          Item you selected to remove
        </Heading>
        {children}
      </Box>
      <Box>
        <Heading as="h4" fontSize="1.2rem">
          Related items
        </Heading>
        {colleration.track_cards.map((v) => {
          if (itemType === "trackCard" && v.id === item.id) {
            return <React.Fragment key={v.id}></React.Fragment>;
          } else {
            return <ControlTrackCardView key={v.id} isActionable={false} card={v} />;
          }
        })}
        {colleration.chat_spotlights.map((v) => {
          if (itemType === "chatSpotlight" && v.id === item.id) {
            return <React.Fragment key={v.id}></React.Fragment>;
          } else {
            return <ControlChatSpotlightView key={v.id} isActionable={false} chatSpotlight={v} />;
          }
        })}
      </Box>
    </>
  );
};

export default ControlCollerationRemovalPrompt;
