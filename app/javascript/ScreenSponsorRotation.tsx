import React from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";

import { Api, ConferenceSponsorship } from "./Api";
import { Colors, Fonts } from "./theme";
import { Logo } from "./Logo";

export const ScreenSponsorRotation: React.FC = () => {
  const { data } = Api.useConferenceSponsorships();

  const [page, setPage] = React.useState<ConferenceSponsorship[]>([]);

  React.useEffect(() => {
    if (!data) return;
    const sponsors = data.conference_sponsorships;

    const pages: ConferenceSponsorship[][] = [];
    const sharedDisplaySponsors: ConferenceSponsorship[] = [];

    sponsors.forEach((s) => {
      if (s.large_display) {
        pages.push([s]);
      } else {
        sharedDisplaySponsors.push(s);
      }
    });

    const PAGE_SIZE = 4;
    for (let i = 0; i < sharedDisplaySponsors.length; i += PAGE_SIZE) {
      pages.push(sharedDisplaySponsors.slice(i, i + PAGE_SIZE));
    }

    setPage(pages[0]);

    let pageNum = 0;
    const interval = setInterval(() => {
      pageNum = (pageNum + 1) % pages.length;
      setPage(pages[pageNum]);
    }, 10 * 1000);

    sponsors.forEach((s) => {
      let img = new window.Image();
      img.src = s.avatar_url;
    });

    return () => clearInterval(interval);
  }, [data]);

  if (page.length == 0) return <></>;

  return (
    <Box w="45vw" h="100%" px="6vw" pt="4vw" bgColor="#ffffff">
      <Center>
        <VStack spacing="2.8vw">
          <Text fontWeight="500" fontSize="2vw" lineHeight="4.6vw" fontFamily={Fonts.heading}>
            Sponsored by
          </Text>

          <ScreenSponsorLogoSet sponsors={page} />
        </VStack>
      </Center>
    </Box>
  );
};

const ScreenSponsorLogoSet: React.FC<{ sponsors: ConferenceSponsorship[] }> = ({ sponsors }) => {
  if (sponsors.length == 1) {
    const sponsor = sponsors[0];
    return <Image w="100%" h="100%" src={sponsor.avatar_url} />;
  } else {
    return (
      <Flex w="100%" h="100%" flexDirection="row" flexWrap="wrap">
        {sponsors.map((s) => {
          return (
            <Box key={`${s.id}`} w="50%" p="0.6vw">
              <Image w="100%" h="auto" src={s.avatar_url} />
            </Box>
          );
        })}
      </Flex>
    );
  }
};
