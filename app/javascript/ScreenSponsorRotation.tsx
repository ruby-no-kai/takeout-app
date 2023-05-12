import React from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";

import { Api, ConferenceSponsorship, ConferenceSponsorshipPlan } from "./Api";
import { Colors, Fonts } from "./theme";
import { Logo } from "./Logo";

type RotationPage = {
  plan: "ruby" | "platinum" | "gold" | "silver";
  items: ConferenceSponsorship[];
};

export const ScreenSponsorRotation: React.FC = () => {
  const { data } = Api.useConferenceSponsorships();

  const [page, setPage] = React.useState<RotationPage | null>(null);

  const pages = React.useMemo(() => {
    if (!data) return null;

    const sponsors = data.conference_sponsorships;
    const sponsorsByPlan: Map<ConferenceSponsorshipPlan, ConferenceSponsorship[]> = new Map();
    const getSponsorsByPlan = (plan: ConferenceSponsorshipPlan) => {
      const cand = sponsorsByPlan.get(plan);
      if (cand) return cand;
      const l: ConferenceSponsorship[] = [];
      sponsorsByPlan.set(plan, l);
      return l;
    };

    sponsors.forEach((s) => {
      getSponsorsByPlan(s.plan).push(s);
      let img = new window.Image();
      img.src = s.avatar_url;
    });

    const newPages: RotationPage[] = [];

    const plans: ConferenceSponsorshipPlan[] = ["gold"];
    plans.forEach((plan) => {
      const ss = getSponsorsByPlan(plan);
      const size = {
        ruby: 1,
        platinum: 4,
        gold: 9,
        silver: null,
      }[plan];
      if (!size) return;
      for (let i = 0; i < ss.length; i += size) {
        newPages.push({
          plan: plan,
          items: ss.slice(i, i + size),
        });
      }
    });

    return newPages;
  }, [data]);

  React.useEffect(() => {
    if (!pages) return;
    if (!pages[0]) return;
    setPage(pages[0]);

    let pageNum = 0;
    const interval = setInterval(() => {
      pageNum = (pageNum + 1) % pages.length;
      setPage(pages[pageNum]);
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [pages]);

  if (!page) return <></>;
  if (!page.items[0]) return <></>;

  return (
    <Box w="45vw" h="100%" px="6vw" pt="4vw" bgColor="#ffffff">
      <Center>
        <VStack spacing="2.8vw">
          <Text fontWeight="500" fontSize="2vw" lineHeight="4.6vw" fontFamily={Fonts.heading}>
            Sponsored by
          </Text>

          <ScreenSponsorLogoSet page={page} />
        </VStack>
      </Center>
    </Box>
  );
};

const ScreenSponsorLogoSet: React.FC<{ page: RotationPage }> = ({ page }) => {
  if (page.plan === "ruby" && page.items[0]) {
    const sponsor = page.items[0];
    return <Image w="100%" h="100%" src={sponsor.avatar_url} />;
  } else if (page.plan === "platinum") {
    return (
      <Flex w="100%" h="100%" flexDirection="row" flexWrap="wrap">
        {page.items.map((s) => {
          return (
            <Box key={`${s.id}`} w="50%" p="0.6vw">
              <Image w="100%" h="auto" src={s.avatar_url} />
            </Box>
          );
        })}
      </Flex>
    );
  } else if (page.plan === "gold") {
    return (
      <Flex w="100%" h="100%" flexDirection="row" flexWrap="wrap">
        {page.items.map((s) => {
          return (
            <Box key={`${s.id}`} w="33%" p="0.6vw">
              <Image w="100%" h="auto" src={s.avatar_url} />
            </Box>
          );
        })}
      </Flex>
    );
  } else {
    return <></>;
  }
};
