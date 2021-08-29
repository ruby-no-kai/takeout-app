import React from "react";
import { Colors } from "./theme";
import { Flex, Heading, Text, Link } from "@chakra-ui/react";

import Api from "./Api";

export const Navbar: React.FC = () => {
  const { data: session } = Api.useSession();
  console.log(session);

  // TODO: session みてなんかアイコンとかだす

  return (
    <>
      <Flex
        as="nav"
        justify="space-between"
        align="center"
        w="100%"
        h="56px"
        px="18px"
        py="15px"
        bgColor={Colors.base}
      >
        <Heading as="h1" size="lg">
          <Link isExternal href="https://rubykaigi.org/2021-takeout/">
            RubyKaigi Takeout 2021
          </Link>
        </Heading>
        <p>{session?.attendee?.name ?? ""}</p>
      </Flex>
    </>
  );
};
