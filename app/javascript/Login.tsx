import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Text,
} from "@chakra-ui/react";

import Api from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";
import { StreamingLogo } from "./StreamingLogo";
import { ErrorAlert } from "./ErrorAlert";
import { CACHE_BUSTER } from "./meta";

export const Login: React.FC = () => {
  return (
    <Box w="100%" h="100%" minH="100vh" bgColor={Colors.bg} py={["20px", "20px", "20px", "165px"]}>
      <Container maxW={["auto", "auto", "auto", "795px"]} w="100%">
        <Flex
          direction={["column", "column", "column", "row"]}
          justifyContent="space-between"
          alignItems="top"
          mx="15px"
        >
          <Box
            w="100%"
            mb="15px"
            display="flex"
            flexDirection={["column", "column", "column", "row"]}
            alignItems="center"
            justifyContent="space-around"
          >
            <Image src={`/assets/hero.svg?p=${CACHE_BUSTER}`} w="100%" maxW="317px" minH="383px" />
            {/*<picture>
              <source type="image/webp" srcSet="/assets/hero_hamburger.webp" />
              <Image src="/assets/hero_hamburger.svg" w="100%" />
              </picture>*/}
          </Box>
          <Box w={["100%", "100%", "100%", "360px"]}>
            <VStack w="100%">
              <Box w="100%" maxW="360px">
                <Heading
                  as="h1"
                  w={["100%", "100%", "360px", "360px"]}
                  h="auto"
                  color={Colors.main}
                  css={{ "& svg": { maxWidth: "100%", height: "auto" } }}
                >
                  <Logo />
                  <VisuallyHidden>RubyKaigi 2023 Streaming Login</VisuallyHidden>
                </Heading>
                <Flex direction="row-reverse">
                  <Box mr="-2px">
                    <StreamingLogo />
                  </Box>
                </Flex>
              </Box>
              <Box textAlign="center" pt="30px">
                <Text>
                  Don't have a ticket?{" "}
                  <Link isExternal href="https://ti.to/rubykaigi/2023" textDecoration="underline">
                    Register now.
                  </Link>
                </Text>
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

      const backTo = searchParams.get("back_to") || "/";
      if (backTo.match(/^\/control/)) {
        location.href = backTo;
      } else {
        if (resp.attendee.is_ready) {
          if (conferenceData) {
            navigate(`/tracks/${encodeURIComponent(conferenceData.conference.default_track)}`);
          } else {
            location.href = "/";
          }
        } else {
          navigate("/attendee");
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

  // TODO: link to registration page and support email
  return (
    <Box maxW="360px" w="100%">
      <form onSubmit={onSubmit}>
        <FormControl mt={4} id="login_email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <FormHelperText color={Colors.textMuted} my={1}>
            Must be identital to the one registered to your ticket
          </FormHelperText>
          <Input {...register("email")} type="email" autoFocus backgroundColor="white" />
        </FormControl>
        <FormControl mt={4} id="login_reference" isRequired>
          <FormLabel>Ticket ID (Reference Code)</FormLabel>
          <FormHelperText color={Colors.textMuted} my={1}>
            Code should be shown at{" "}
            <Link href="/assets/ticket-email.png" isExternal target="_blank" textDecoration="underline">
              the upper right of the confirmation email
            </Link>{" "}
            you received.
          </FormHelperText>
          <Input
            {...register("reference")}
            type="password"
            placeholder="e.g. ABCD-1, XY1N-10, ..."
            backgroundColor="white"
          />
        </FormControl>
        <Flex direction="row" justifyContent="space-around" w="100%" mt="30px">
          <Button type="submit" w="160px" h="46px" colorScheme="rk" isLoading={isRequesting}>
            Log in
          </Button>
        </Flex>
      </form>
      {errorAlert}
    </Box>
  );
};
export default Login;
