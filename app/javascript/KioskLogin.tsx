import React, { useEffect, useState, useRef, useId } from "react";
import { useForm } from "react-hook-form";

import { Api } from "./Api";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { errorToToast } from "./ErrorAlert";

export const KioskLogin: React.FC = () => {
  const { data } = Api.useSession();
  const [shouldVisible, setShouldVisible] = useState(false);

  useEffect(() => {
    if (data && !data.kiosk && !data.attendee) setShouldVisible(true);
  }, [data]);

  if (!data) return <></>;
  if (!shouldVisible) return <></>;

  return <KioskLoginInner />;
};

const KioskLoginInner: React.FC = () => {
  const toast = useToast();
  const formID = useId();
  const initialRef = useRef(null);
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [isRequesting, setIsRequesting] = useState(false);
  const { register, handleSubmit } = useForm<{
    password: string;
    name: string;
  }>({ defaultValues: { password: "", name: "" } });

  const onSubmit = handleSubmit(async (data) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      await Api.createKioskSession(data.password, data.name);
      onClose();
    } catch (e) {
      toast(errorToToast(e));
    }
    setIsRequesting(false);
  });

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Kiosk Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <p>Beep beep, beep boop?</p>
          <form onSubmit={onSubmit} id={formID}>
            <FormControl mt={4} id="login_password" isRequired>
              <FormLabel>Kiosk Password</FormLabel>
              <Input {...register("password")} required={true} type="password" />
            </FormControl>
            <FormControl mt={4} id="login_password" isRequired>
              <FormLabel>Name this device</FormLabel>
              <Input
                {...register("name")}
                required={true}
                type="input"
                placeholder="e.g. Hall A Subscreen, Signage 101, ..."
              />
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" form={formID} isLoading={isRequesting} type="submit">
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KioskLogin;
