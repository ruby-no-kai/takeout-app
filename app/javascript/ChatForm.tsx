import React from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { Box, IconButton, Text, Link, FormControl, FormLabel, Switch, Input, Textarea } from "@chakra-ui/react";
import { Alert, AlertIcon, Tooltip, VStack, Flex } from "@chakra-ui/react";

import TextareaAutoSize from "react-textarea-autosize";

import { CampaignIcon } from "./CampaignIcon";
import { SendIcon } from "./SendIcon";

import { Api, Track, ChannelArn } from "./Api";
import { Colors } from "./theme";
import { useChat } from "./ChatProvider";

import { ErrorAlert } from "./ErrorAlert";

export interface Props {
  track: Track;
  channel: ChannelArn | null;
}

export const ChatForm: React.FC<Props> = ({ track, channel }) => {
  const chat = useChat();

  const { data: session } = Api.useSession();
  const isStaff = session?.attendee?.is_staff;

  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);

  const { register, handleSubmit, reset, setFocus, watch } = useForm<{
    message: string;
    asAdmin: boolean;
  }>({
    defaultValues: {
      message: "",
      asAdmin: false,
    },
  });

  const asAdmin = watch("asAdmin");

  const onSubmit = handleSubmit(async (data) => {
    if (!chat.session || !channel) return;
    if (isRequesting) return;
    setIsRequesting(true);
    setErrorAlert(null);

    try {
      if (data.asAdmin && isStaff) {
        await Api.sendChatMessage(track.slug, data.message, true);
      } else {
        // Workaround: aws-sdk-v3 sigv4 fails to generate correct signature for payload containing emoji...
        if (/\p{Extended_Pictographic}/u.test(data.message)) {
          await Api.sendChatMessage(track.slug, data.message, false);
        } else {
          await chat.session.postMessage(channel, data.message);
        }
      }
      reset({ message: "", asAdmin: false });
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>,
      );
    }
    setFocus("message");
    setIsRequesting(false);
  });

  const shouldDisable = !session?.attendee || !chat.session || !channel;

  // TODO: errorAlert to toast

  return (
    <Box p="16px" bgColor="#ffffff" borderTop="1px solid" borderColor={Colors.chatBorder}>
      {errorAlert}
      <form onSubmit={onSubmit}>
        <VStack w="100%">
          {session && !session.attendee?.is_ready ? (
            <Box w="100%">
              <Alert status="warning">
                <AlertIcon />
                <Text as="span">
                  Set your name at{" "}
                  <Link as={RouterLink} to="/attendee" textDecoration="underline">
                    Settings
                  </Link>{" "}
                  page
                </Text>
              </Alert>
            </Box>
          ) : null}
          <Box w="100%">
            <Textarea
              as={TextareaAutoSize}
              {...register("message")}
              size="sm"
              placeholder={asAdmin ? "SAY SOMETHING AS ADMIN..." : "Send a message"}
              isRequired
              isDisabled={shouldDisable}
              autoComplete="off"
              rows={1}
              minRows={1}
              maxRows={4}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              css={{ resize: "none" }}
            />
          </Box>
          <Flex w="100%" alignItems="flex-end" direction="row-reverse" justifyContent="space-between">
            <IconButton
              icon={<SendIcon boxSize="14px" />}
              minW="30px"
              w="30px"
              h="30px"
              aria-label="Send"
              type="submit"
              isLoading={isRequesting}
              isDisabled={shouldDisable}
            />
            {isStaff ? (
              <FormControl display="flex" alignSelf="center" h="30px">
                <FormLabel htmlFor="ChatForm__asAdmin" aria-hidden="true" m={0} mr={1}>
                  <Tooltip label="Send as an official announcement">
                    <CampaignIcon w="24px" h="24px" />
                  </Tooltip>
                </FormLabel>
                <Switch
                  aria-label="Send as an official announcement"
                  id="ChatForm__asAdmin"
                  size="sm"
                  isChecked={asAdmin}
                  isDisabled={shouldDisable}
                  {...register("asAdmin")}
                />
              </FormControl>
            ) : null}
          </Flex>
        </VStack>
      </form>
    </Box>
  );
};
