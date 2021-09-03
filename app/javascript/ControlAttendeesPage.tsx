import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";

import { Container, Box, Flex } from "@chakra-ui/react";
import { Link, Input, Button } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

import { ControlApi } from "./ControlApi";
import { ErrorAlert } from "./ErrorAlert";

export const ControlTrackCardsPage: React.FC = () => {
  const [query, setQuery] = React.useState<string | null>(null);
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const { register, handleSubmit } = useForm<{
    query: string;
  }>({ defaultValues: { query: "" } });
  const { data: list, isValidating } = ControlApi.useAttendeeList(query);

  const onSubmit = handleSubmit(async (data) => {
    setQuery(data.query);
  });

  // TODO: link to registration page and support email
  return (
    <>
      {errorAlert}
      <Container mt="20px" maxW={["auto", "auto", "auto", "1400px"]}>
        <Box>
          <form onSubmit={onSubmit}>
            <Input {...register("query")} placeholder="Name, reference code (or submit empty to list all attendees)" />
            <Button mt={4} size="lg" type="submit" isLoading={isValidating}>
              Search
            </Button>
          </form>
        </Box>

        {list ? (
          <Box>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Reference</Th>
                  <Th>Flag</Th>
                </Tr>
              </Thead>
              <Tbody>
                {list.items.map((item) => (
                  <Tr key={item.ticket.id}>
                    <Td>
                      <Link as={RouterLink} to={`/control/attendees/${item.ticket.id}`}>
                        {item.attendee.is_ready ? (
                          <span>{item.attendee.name}</span>
                        ) : (
                          <i>
                            {item.ticket.first_name} {item.ticket.last_name}
                          </i>
                        )}
                      </Link>
                    </Td>
                    <Td>{item.ticket.reference}</Td>
                    <Td>
                      {[
                        item.attendee.is_speaker ? "Speaker" : null,
                        item.attendee.is_committer ? "Committer" : null,
                        item.attendee.is_staff ? "Staff" : null,
                      ]
                        .filter((v): v is string => !!v)
                        .join(", ")}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : null}
      </Container>
    </>
  );
};
export default ControlTrackCardsPage;
