import React from "react";

import { Link, Alert, AlertIcon } from "@chakra-ui/react";

import { Api } from "./Api";
import { COMMIT } from "./meta";

export const AppVersionAlert: React.FC = () => {
  const { data: appVersion } = Api.useAppVersion();
  return appVersion && appVersion.commit !== COMMIT ? (
    <Alert status="info" mt={1}>
      <AlertIcon />
      New app version available;
      <Link textDecoration="underline" onClick={() => window.location.reload()} ml={1}>
        Reload?
      </Link>
    </Alert>
  ) : null;
};

export default AppVersionAlert;
