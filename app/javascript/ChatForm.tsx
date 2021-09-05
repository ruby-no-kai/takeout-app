import React from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Link, FormControl, FormLabel, Switch, Input } from "@chakra-ui/react";
import { VStack, Flex } from "@chakra-ui/react";

import { CampaignIcon } from "./CampaignIcon";

import { Api, Track, ChannelArn } from "./Api";
import { useChat } from "./ChatProvider";

import { ErrorAlert } from "./ErrorAlert";

export interface Props {
  track: Track;
  channel: ChannelArn;
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
    if (!chat.session) return;
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

  if (!session?.attendee || !chat.session) {
    return <></>;
  }

  return (
    <Box>
      {errorAlert}
      <form onSubmit={onSubmit}>
        <VStack w="100%">
          <Box w="100%">
            <Input {...register("message")} autoFocus isRequired autoComplete="off" />
          </Box>
          <Flex w="100%">
            {isStaff ? (
              <FormControl display="flex" alignSelf="center" h="30px">
                <FormLabel htmlFor="ChatForm__asAdmin" aria-hidden="true" m={0} mr={1}>
                  <CampaignIcon w="24px" h="24px" />
                </FormLabel>
                <Switch
                  aria-label="Send as admin announcement"
                  id="ChatForm__asAdmin"
                  size="sm"
                  isChecked={asAdmin}
                  {...register("asAdmin")}
                />
              </FormControl>
            ) : null}
            <Button size="sm" type="submit" isLoading={isRequesting}>
              Send
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
};
