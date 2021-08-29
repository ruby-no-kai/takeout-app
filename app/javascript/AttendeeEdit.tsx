import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
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

import Api from "./Api";
import { ErrorAlert } from "./ErrorAlert";

export interface Props {}

export const AttendeeEdit: React.FC<Props> = () => {
  const {
    data: session,
    error: sessionError,
    isValidating: sessionValidating,
  } = Api.useSession();
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
    if (session?.attendee)
      reset({ name: session.attendee.name, gravatar_email: "" });
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
        history.push("/tracks/a"); // TODO: default track
      }
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>
      );
    }
    setIsRequesting(false);
  });

  if (!session?.attendee) {
    return (
      <>
        {sessionError ? (
          <Box my={2}>
            <ErrorAlert error={sessionError} />
          </Box>
        ) : null}
        <p>Loading</p>
      </>
    );
  }

  // TODO: ポリシーページへのリンク
  // TODO: !ready のときは Save and continue ボタンにしたい

  return (
    <>
      {errorAlert}
      <Container mt="20px">
        <p>Confirm your name and avatar used at live chat:</p>
        <Center my={4}>
          <Circle w="200px" h="200px">
            <Image src={session.attendee.avatar_url} alt="" />
          </Circle>
        </Center>
        <form onSubmit={onSubmit}>
          <FormControl mt={4} id="login_reference" isRequired>
            <FormLabel>Name</FormLabel>
            <Input {...register("name")} autoFocus />
          </FormControl>

          <FormControl mt={4} id="login_email">
            <FormLabel>Gravatar Email</FormLabel>
            <FormHelperText>
              We use avatar images registered on{" "}
              <Link href="https://www.gravatar.com" isExternal>
                Gravatar
              </Link>
              . If you desire to choose alternate email address for your
              Gravatar image, then fill the following field.
            </FormHelperText>
            <Input
              {...register("gravatar_email")}
              type="email"
              placeholder="(leave empty to remain unchanged)"
            />
          </FormControl>
          <Button mt={4} size="lg" type="submit" isLoading={isRequesting}>
            Save
          </Button>
        </form>
      </Container>
    </>
  );
};
