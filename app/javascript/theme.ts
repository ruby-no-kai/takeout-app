import { extendTheme } from "@chakra-ui/react";

const main = "#0B374D";
const accent = "#E14033";
export const Colors = {
  base: "#EBE0CE",
  baseLight: "#F3EDE2",
  baseAccent: "#D7D165",
  main: main,
  mainLight: "#545F64",
  accent: accent,
  link: "#127CAE",
  linkHover: "#0092D8",
  lightGray: "#BFC6C9",

  textDefault: main,
  textAccent: accent,

  backgroundColor: "#F9F9F9",
};

export const theme = extendTheme({
  fonts: {
    heading: "Titillium Web",
    body: "Roboto",
  },
  styles: {
    global: {
      body: {
        color: Colors.textDefault,
        backgroundColor: Colors.backgroundColor,
      },
    },
  },
});
