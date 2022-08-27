import React from "react";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";

export interface Props {
  error: Error | unknown;
}

export const ErrorAlert: React.FC<Props> = ({ error }) => {
  let e =
    error instanceof Error
      ? error
      : (() => {
          console.error("ErrorAlert: got !(instanceof Error)", error);
          return new Error(`Unknown Error: ${error}`);
        })();
  return (
    <>
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>{e.name}</AlertTitle>
        <AlertDescription>{e.message}</AlertDescription>
      </Alert>
    </>
  );
};
