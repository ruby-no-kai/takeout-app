import React from "react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
// import { useHistory } from "react-router-dom";
import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";

import { Api, Track, TrackCard, TrackCardContent } from "./Api";
import { ControlApi, ConferencePresentationSlug, ControlGetConferenceResponse } from "./ControlApi";
import { ErrorAlert } from "./ErrorAlert";

export type Props = {
  track: Track;
}

export const ControlTrackCardForm: React.FC<Props> = ({ track }) => {
  const { data: controlConferenceData } = ControlApi.useConference();
  // const history = useHistory();
  const [errorAlert, setErrorAlert] = React.useState<JSX.Element | null>(null);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);

  const { register, handleSubmit, reset } = useForm<{
    slug: ConferencePresentationSlug;
    inSeconds: number;
  }>({
    defaultValues: {
      slug: "",
      inSeconds: 0,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!controlConferenceData) return;
    if (isRequesting) return;
    setIsRequesting(true);

    try {
      const card: TrackCard = {
        track: track.slug,
        at: dayjs().add(data.inSeconds, "seconds").unix(),
        ut: 0,
        ...generateTrackCardFromPresentation(controlConferenceData, data.slug),
      };
      console.log(card);
      await ControlApi.createTrackCard(card);
      setErrorAlert(null);
    } catch (e) {
      setErrorAlert(
        <Box my={2}>
          <ErrorAlert error={e} />
        </Box>,
      );
    }
    setIsRequesting(false);
    reset();
  });

  if (!controlConferenceData) {
    return <p>Loading</p>;
  }

  //<Input {...register("at", { valueAsDate: true })} type="datetime-local" />

  return (
    <Box>
      {errorAlert}
      <form onSubmit={onSubmit}>
        <FormControl mt={4} id="cardform_slug" isRequired>
          <FormLabel>Name</FormLabel>
          <Input {...register("slug")} />
        </FormControl>

        <FormControl mt={4} id="cardform_at">
          <FormLabel>Activation In</FormLabel>
          <Input {...register("inSeconds", { valueAsNumber: true })} type="number" />
        </FormControl>
        <Button mt={4} size="lg" type="submit" isLoading={isRequesting}>
          Save
        </Button>
      </form>
    </Box>
  );
};

function generateTrackCardFromPresentation(
  controlConferenceData: ControlGetConferenceResponse,
  slug: ConferencePresentationSlug,
): TrackCardContent {
  console.log(controlConferenceData);
  const presentation = controlConferenceData.presentations[slug]!;

  return {
    interpretation: presentation.language !== "EN", // TODO:
    topic: {
      title: presentation.title,
      author: presentation.speaker_slugs.join(", "),
      description: presentation.description,
      labels: [presentation.kind, presentation.language], // TODO:
    },
    speakers: presentation.speaker_slugs.map((ss) => {
      const speaker = controlConferenceData.speakers[ss]!;
      return {
        name: speaker.name,
        github_id: speaker.github_id,
        twitter_id: speaker.twitter_id,
        avatar_url: speaker.avatar_url,
      };
    }),
  };
}

export default ControlTrackCardForm;
