import React from "react";
import dayjs from "dayjs";

import { Text, Box } from "@chakra-ui/react";

import { ViewerCount } from "./Api";
import { PersonIcon } from "./PersonIcon";

export const TrackViewerCount: React.FC<{ count: ViewerCount }> = ({ count }) => {
  const [expired, setExpired] = React.useState(false);
  React.useEffect(() => {
    setExpired(dayjs().isAfter(dayjs.unix(count.expiry)));
    const ms = dayjs.unix(count.expiry).diff(dayjs(), "ms");
    console.log("TrackViewerCount: timer", ms);
    const timer = setTimeout(() => {
      console.log("TrackViewerCount: expired");
      setExpired(true);
    }, ms);
    return () => clearTimeout(timer);
  }, [count.expiry]);

  if (expired) return <></>;

  return (
    <Box>
      <PersonIcon mr={1} />
      <Text as="span" size="sm" fontWeight="bold">
        {count.count.toLocaleString()}
      </Text>
    </Box>
  );
};

export default TrackViewerCount;
