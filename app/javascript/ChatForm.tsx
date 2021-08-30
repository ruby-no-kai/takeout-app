import React from "react";
import { useForm } from "react-hook-form";
import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";

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
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);

  const { register, handleSubmit, reset } = useForm<{
    message: string;
    asAdmin: boolean;
  }>({
    defaultValues: {
      message: "",
      asAdmin: false,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!chat.session) return;
    if (isRequesting) return;
    setIsRequesting(true);
    setErrorAlert(null);

    try {
      if (data.asAdmin) {
        throw "unimplemented"; //TODO: asAdmin
      } else {
        await chat.session.postMessage(channel, data.message);
      }
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>,
      );
    }
    reset({ message: "" });
    setIsRequesting(false);
  });

  if (!session?.attendee || !chat.session) {
    return <></>;
  }

  return (
    <Box>
      {errorAlert}
      <form onSubmit={onSubmit}>
        <Input {...register("message")} autoFocus isRequired />
        <Button size="sm" type="submit" isLoading={isRequesting}>
          Send
        </Button>
      </form>
    </Box>
  );
};
