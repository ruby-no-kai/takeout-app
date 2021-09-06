import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import {
  VStack,
  HStack,
  Box,
  Container,
  Button,
  Link,
  Text,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Avatar,
  Spinner,
} from "@chakra-ui/react";

import Api from "./Api";
import { Colors } from "./theme";
import { ErrorAlert } from "./ErrorAlert";

export const AttendeeEdit: React.FC = () => {
  const { data: conferenceData } = Api.useConference();
  const { data: session, error: sessionError } = Api.useSession();
  const history = useHistory();
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    gravatar_email: string;
  }>({
    defaultValues: {
      name: React.useMemo(() => session?.attendee?.name, [session]),
      gravatar_email: "",
    },
  });

  React.useEffect(() => {
    if (session?.attendee) reset({ name: session.attendee.name, gravatar_email: "" });
  }, [session?.attendee]);

  const onSubmit = handleSubmit(async (data) => {
    const wasReady = session!.attendee?.is_ready;

    if (isRequesting) return;
    setIsRequesting(true);
    try {
      await Api.updateAttendee(data.name, data.gravatar_email);
      setErrorAlert(null);

      if (wasReady) {
        // TODO: notice saved message
      } else {
        if (conferenceData) {
          history.push(`/tracks/${encodeURIComponent(conferenceData.conference.default_track)}`);
        } else {
          location.href = "/";
        }
      }
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>,
      );
    }
    setIsRequesting(false);
  });

  if (!session?.attendee) {
    return (
      <Container maxW={["auto", "auto", "auto", "1000px"]} px="15px" py="22px">
        <VStack>
          {sessionError ? (
            <Box my={2}>
              <ErrorAlert error={sessionError} />
            </Box>
          ) : null}
          <Spinner size="xl" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW={["auto", "auto", "auto", "1000px"]} px="15px" py="22px">
      <VStack justify="start" alignItems="start" spacing="30px">
        <Heading as="h2" color={Colors.main}>
          Settings
        </Heading>
        <HStack spacing="30px">
          <Avatar size="xl" bg={Colors.defaultAvatarBg} src={session.attendee.avatar_url} loading="lazy" />
          <Box maxW="750px">
            <Text mb={2}>
              Confirm your name and avatar used at live chat. These informations may be shared with other attendees once
              submitted.
            </Text>
            <Text>
              Be remember to abide by{" "}
              <Link href="https://rubykaigi.org/2021-takeout/policies" isExternal textDecoration="underline">
                our policies
              </Link>
              .
            </Text>
          </Box>
        </HStack>
        <form onSubmit={onSubmit}>
          <VStack justify="start" alignItems="start" spacing="30px">
            <FormControl id="login_reference" isRequired>
              <FormLabel>Name</FormLabel>
              <FormHelperText>Feel free to use nicknames, usernames, or handles :)</FormHelperText>
              <Input {...register("name")} maxW="460px" autoFocus />
            </FormControl>

            <FormControl id="login_email">
              <FormLabel>Gravatar Email Address</FormLabel>
              <FormHelperText>
                We use avatar images registered on{" "}
                <Link href="https://www.gravatar.com" isExternal textDecoration="underline">
                  Gravatar
                </Link>
                . Fill the following field if you desire to choose different email address for your Gravatar image.
              </FormHelperText>
              <Input
                {...register("gravatar_email")}
                type="email"
                maxW="460px"
                placeholder="(leave empty to remain unchanged)"
              />
            </FormControl>

            <Button type="submit" w="160px" h="46px" colorScheme="rk" isLoading={isRequesting}>
              {session.attendee.is_ready ? "Save" : "Continue"}
            </Button>
          </VStack>
        </form>

        {errorAlert}
      </VStack>
    </Container>
  );
};
export default AttendeeEdit;
