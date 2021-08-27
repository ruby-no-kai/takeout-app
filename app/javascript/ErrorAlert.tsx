import React from "react";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";

import Api from "./Api";

export interface Props {
  error: Error,
};

export const ErrorAlert: React.FC<Props> = ({error}) => {
  return <>
    <Alert status="error">
      <AlertIcon />
      <AlertTitle mr={2}>{error.name}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  </>;
};
