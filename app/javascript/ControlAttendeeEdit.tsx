import React from "react";
import { useForm } from "react-hook-form";
import { useMatch } from "react-router-dom";
import { Box, Container, Button, FormControl, FormLabel, Input, Checkbox } from "@chakra-ui/react";
import { Link, Text } from "@chakra-ui/react";

import { ControlApi, ControlUpdateAttendeeRequestAttendee } from "./ControlApi";
import { ErrorAlert } from "./ErrorAlert";

export interface Props {}

export const ControlAttendeeEdit: React.FC<Props> = () => {
  const match = useMatch("/control/attendees/:id");
  if (!match) throw new Error("?"); // XXX:
  const id = parseInt(match.params.id || "", 10);
  const { data } = ControlApi.useAttendee(id);
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<ControlUpdateAttendeeRequestAttendee>({
    defaultValues: {
      name: React.useMemo(() => data?.attendee?.name, [data]),
      is_staff: React.useMemo(() => data?.attendee?.is_staff, [data]),
      is_speaker: React.useMemo(() => data?.attendee?.is_speaker, [data]),
      is_committer: React.useMemo(() => data?.attendee?.is_committer, [data]),
      presentation_slugs: React.useMemo(() => data?.attendee?.presentation_slugs || [], [data]),
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      await ControlApi.updateAttendee(id, data);
      setErrorAlert(null);
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>,
      );
    }
    setIsRequesting(false);
  });

  React.useEffect(() => {
    if (data) reset(data.attendee);
  }, [data]);

  if (!data) return <p>Loading</p>;

  // TODO: link to registration page and support email
  return (
    <>
      {errorAlert}
      <Container mt="20px">
        <form onSubmit={onSubmit}>
          <Text>
            <Link href={data.ticket.admin_url} isExternal textDecoration="underline">
              {data.ticket.reference}
            </Link>
          </Text>
          <FormControl mt={4} id="attendee__name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input {...register("name")} />
          </FormControl>
          <FormControl mt={4} id="attendee__staff" isRequired>
            <FormLabel>Staff</FormLabel>
            <Checkbox {...register("is_staff")} />
          </FormControl>
          <FormControl mt={4} id="attendee__speaker" isRequired>
            <FormLabel>Speaker</FormLabel>
            <Checkbox {...register("is_speaker")} />
          </FormControl>
          <FormControl mt={4} id="attendee__committer" isRequired>
            <FormLabel>Committer</FormLabel>
            <Checkbox {...register("is_committer")} />
          </FormControl>
          <FormControl mt={4} id="attendee__presentation_slugs">
            <FormLabel>Presentation Slugs</FormLabel>
            <Input {...register("presentation_slugs.0")} />
          </FormControl>

          <Button mt={4} size="lg" type="submit" isLoading={isRequesting}>
            Save
          </Button>
        </form>
      </Container>
    </>
  );
};
export default ControlAttendeeEdit;
