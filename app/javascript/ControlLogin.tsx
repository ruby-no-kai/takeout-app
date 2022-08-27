import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Box, Container, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";

import ControlApi from "./ControlApi";
import { ErrorAlert } from "./ErrorAlert";

export interface Props {}

export const ControlLogin: React.FC<Props> = () => {
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const { register, handleSubmit } = useForm<{
    password: string;
  }>({ defaultValues: { password: "" } });

  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      await ControlApi.createControlSession(data.password);
      setErrorAlert(null);

      navigate("/control");
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
        <p>Beep beep, beep boop?</p>
        <form onSubmit={onSubmit}>
          <FormControl mt={4} id="login_password" isRequired>
            <FormLabel>Control Password</FormLabel>
            <Input {...register("password")} type="password" />
          </FormControl>
          <Button mt={4} size="lg" type="submit" isLoading={isRequesting}>
            Take control
          </Button>
        </form>
      </Container>
    </>
  );
};
export default ControlLogin;
