import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import {
  HStack,
  VStack,
  Heading,
  Flex,
  Box,
  Container,
  Button,
  Link,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Image,
  VisuallyHidden,
} from "@chakra-ui/react";

import Api from "./Api";
import { Colors } from "./theme";
import { StreamingLogo } from "./StreamingLogo";
import { ErrorAlert } from "./ErrorAlert";

export const Login: React.FC = () => {
  return (
    <Box w="100%" h="100%" minH="100vh" bgColor={Colors.bg} pt={["20px", "20px", "20px", "165px"]}>
      <Container maxW={["auto", "auto", "auto", "760px"]}>
        <Flex direction={["column", "column", "column", "row"]} justifyContent="space-between" alignItems="top">
          <Box maxW="331px" w="100%">
            <picture>
              <source type="image/webp" srcSet="/assets/hero_hamburger.webp" />
              <Image src="/assets/hero_hamburger.svg" />
            </picture>
          </Box>
          <Box>
            <VStack>
              <Box>
                <Heading as="h1" size="lg" fontSize="33px" color={Colors.main}>
                  RubyKaigi Takeout 2021
                  <VisuallyHidden> Streaming Login</VisuallyHidden>
                </Heading>
                <Flex direction="row-reverse">
                  <StreamingLogo />
                </Flex>
              </Box>
              <LoginForm />
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export const LoginForm: React.FC = () => {
  const history = useHistory();
  const { data: conferenceData } = Api.useConference();
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
        if (conferenceData) {
          history.push(`/tracks/${encodeURIComponent(conferenceData.conference.default_track)}`);
        } else {
          location.href = "/";
        }
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
      <Container maxW="360px" w="100%">
        <form onSubmit={onSubmit}>
          <FormControl mt={4} id="login_email" isRequired>
            <FormLabel>Email Address</FormLabel>
            <FormHelperText color={Colors.textMuted} my={1}>
              Must be identital to the one registered to your ticket
            </FormHelperText>
            <Input {...register("email")} type="email" autoFocus />
          </FormControl>
          <FormControl mt={4} id="login_reference" isRequired>
            <FormLabel>Ticket ID (Reference Code)</FormLabel>
            <FormHelperText color={Colors.textMuted} my={1}>
              Code should be shown at{" "}
              <Link
                href="https://img.sorah.jp/x/20210827_112054_xnimUYcsKE.png"
                isExternal
                target="_blank"
                textDecoration="underline"
              >
                the upper right of a confirmation email
              </Link>{" "}
              you received.
            </FormHelperText>
            <Input {...register("reference")} type="password" placeholder="e.g. ABCD-1, XY1N-10, ..." />
          </FormControl>
          <Flex direction="row" justifyContent="space-around" w="100%" mt="30px">
            <Button type="submit" w="160px" h="46px" colorScheme="rk" isLoading={isRequesting}>
              Log in
            </Button>
          </Flex>
        </form>
      </Container>
    </>
  );
};
export default Login;
