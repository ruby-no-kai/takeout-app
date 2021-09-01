import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";

import Api from "./Api";
import { ErrorAlert } from "./ErrorAlert";

export interface Props {}

export const Login: React.FC<Props> = () => {
  const history = useHistory();
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const { register, handleSubmit } = useForm<{
    email: string;
    reference: string;
  }>({ defaultValues: { email: "", reference: "" } });

  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const resp = await Api.createSession(data.email, data.reference);
      setErrorAlert(null);

      if (resp.attendee.is_ready) {
        history.push("/tracks/a");
        // TODO: redirect to /tracks/:default
      } else {
        history.push("/attendee");
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

  // TODO: link to registration page and support email
  return (
    <>
      {errorAlert}
      <Container mt="20px">
        <p>Enter your ticket details to access.</p>
        <form onSubmit={onSubmit}>
          <FormControl mt={4} id="login_email" isRequired>
            <FormLabel>Email Address</FormLabel>
            <FormHelperText>Enter an email address registered to your ticket</FormHelperText>
            <Input {...register("email")} type="email" autoFocus />
          </FormControl>
          <FormControl mt={4} id="login_reference" isRequired>
            <FormLabel>Ticket ID (Reference Code)</FormLabel>
            <FormHelperText>
              Code should be shown at{" "}
              <Link href="https://img.sorah.jp/x/20210827_112054_xnimUYcsKE.png" isExternal target="_blank">
                the upper right of a confirmation email
              </Link>{" "}
              you received.
            </FormHelperText>
            <Input {...register("reference")} type="password" placeholder="ABCD-1..." />
          </FormControl>
          <Button mt={4} size="lg" type="submit" isLoading={isRequesting}>
            Log in
          </Button>
        </form>
      </Container>
    </>
  );
};
export default Login;
