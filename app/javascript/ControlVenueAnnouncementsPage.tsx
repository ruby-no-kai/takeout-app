import React, { useState, useId } from "react";
import loadable from "@loadable/component";

import { Box, Flex, Tag, Text, useToast, Button, UseDisclosureReturn, useDisclosure } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Input,
  Textarea,
  FormLabel,
  FormControl,
  Checkbox,
  Link,
} from "@chakra-ui/react";

import { errorToToast } from "./ErrorAlert";

import { Api, VenueAnnouncement, VenueAnnouncementContent } from "./Api";
import { ControlApi } from "./ControlApi";
import { Colors } from "./theme";
import { DeleteIcon } from "./DeleteIcon";
import { EditIcon } from "@chakra-ui/icons";

export const ControlVenueAnnouncementsPage: React.FC = () => {
  const { data } = ControlApi.useVenueAnnouncements();
  if (!data) return <p>Loading..</p>;
  return (
    <Box mx="50px">
      <Box>
        <ControlVenueAnnouncementForm />
      </Box>
      <Box>
        {data.venue_announcements.map((ann) => (
          <ControlVenueAnnouncementView key={ann.id} venueAnnouncement={ann} />
        ))}
      </Box>
    </Box>
  );
};

export const ControlVenueAnnouncementView: React.FC<{ venueAnnouncement: VenueAnnouncement }> = ({
  venueAnnouncement: ann,
}) => {
  const editDisclosureProps = useDisclosure();
  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      <Flex justifyContent="space-between" direction="row">
        <Box>
          <IconButton
            background="transparent"
            icon={<EditIcon boxSize="14px" />}
            minW="30px"
            w="30px"
            h="30px"
            aria-label="Edit"
            onClick={editDisclosureProps.onOpen}
          />
          <ControlVenueAnnouncementForm target={ann} disclosureProps={editDisclosureProps} />
        </Box>
        <Box>
          <VenueAnnouncementRemoval venueAnnouncement={ann} />
        </Box>
      </Flex>
      <Text>{returnToBr(ann.content)}</Text>
      {ann.url ? (
        <Text>
          <b>Link: </b>
          <Link isExternal href={ann.url}>
            {ann.url}
          </Link>
        </Text>
      ) : null}
      <Text>
        {ann.enabled ? (
          <Tag size="md" variant="solid" colorScheme="teal">
            Enabled
          </Tag>
        ) : (
          <Tag size="md" variant="solid" colorScheme="gray">
            Disabled
          </Tag>
        )}
        {ann.only_intermission ? (
          <Tag size="md" variant="solid" colorScheme="teal">
            Intermission Only
          </Tag>
        ) : null}
        {ann.only_subscreen ? (
          <Tag size="md" variant="solid" colorScheme="teal">
            Subscreen Only
          </Tag>
        ) : null}
        {ann.only_signage ? (
          <Tag size="md" variant="solid" colorScheme="teal">
            Signage Only
          </Tag>
        ) : null}
      </Text>
    </Box>
  );
};

const VenueAnnouncementRemoval: React.FC<{ venueAnnouncement: VenueAnnouncement }> = ({ venueAnnouncement: ann }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const toast = useToast();
  const perform = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    ControlApi.deleteVenueAnnouncement(ann)
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

const ControlVenueAnnouncementForm: React.FC<{ target?: VenueAnnouncement; disclosureProps?: UseDisclosureReturn }> = ({
  target,
  disclosureProps,
}) => {
  const formID = useId();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = disclosureProps ?? useDisclosure();
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<VenueAnnouncementContent>({
    defaultValues: target ?? {
      content: "",
      url: "",
      enabled: true,
      only_intermission: false,
      only_signage: false,
      only_subscreen: false,
      order_index: -1,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const resp = await (target
        ? ControlApi.updateVenueAnnouncement({ id: target.id, ...data })
        : ControlApi.createVenueAnnouncement(data));
      console.log("resp", resp);
      setIsRequesting(false);
      onClose();
    } catch (e) {
      toast(errorToToast(e));
    }
  });

  return (
    <>
      {disclosureProps ? null : (
        <>
          <Button onClick={onOpen}>Compose</Button>
        </>
      )}

      <Modal size="3xl" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compose Announcement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack as="form" w="100%" onSubmit={onSubmit} id={formID}>
              <FormControl>
                <FormLabel>Order </FormLabel>
                <Input type="number" {...register("order_index")} />
              </FormControl>
              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea w="100%" minH="200px" fontSize="14px" {...register("content")} />
              </FormControl>
              <FormControl>
                <FormLabel>URL to link</FormLabel>
                <Input type="text" {...register("url")} />
              </FormControl>
              <FormControl>
                <Checkbox {...register("enabled")}>Enable</Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox {...register("only_intermission")}>Intermission Only</Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox {...register("only_subscreen")}>Subscreen Only</Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox {...register("only_signage")}>Signage Only</Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} form={formID} type="submit" isLoading={isRequesting}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
// XXX: returnToBr dupe
function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}
export default ControlVenueAnnouncementsPage;
