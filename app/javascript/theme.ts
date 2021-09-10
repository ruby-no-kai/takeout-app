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

  bg: "#EBE0CE",

  secondary: "#7C757D",
  secondaryText: "#767077",

  dark: "#343A40",

  textDefault: "#212529",
  textAccent: accent,
  textMuted: "#727272",

  backgroundColor: "#F9F9F9",

  border: "#DFDFDF",
  chatBorder: "#CED4DA", // TODO:
  chatBorder2: "#E0E0E0", // TODO:

  nameHighlightOrgz: { bg: "#BD4848", fg: "#FFFFFF" },
  nameHighlightCore: { bg: "#74439B", fg: "#FFFFFF" },
  nameHighlightSpeaker: { bg: "#D7D165", fg: main },

  nameSpeaker: main, // TODO:
  nameCore: "#74439B",

  defaultAvatarBg: "#868E96", // TODO:
};

export const theme = extendTheme({
  useSystemColorMode: false,

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
      "::placeholder": {
        color: Colors.textMuted,
      },
    },
  },
  colors: {
    rk: {
      50: "#ebf8ff",
      100: "#bee3f8",
      200: "#90cdf4",
      300: "#63b3ed",
      400: "#4299e1",
      500: Colors.main, // 500: "#3182ce",
      600: Colors.mainLight, // 600: "#2b6cb0",
      700: Colors.mainLight, // 700: "#2c5282",
      800: "#2a4365",
      900: "#1A365D",
    },
  },
  components: {
    Tabs: {
      variants: {
        "rk-tracks": (_props) => {
          return {
            tablist: {
              borderBottom: "1px solid",
              borderColor: Colors.border,
              backgroundColor: "#FFFFFF",
            },
            tab: {
              backgroundColor: "#FFFFFF",
              color: Colors.textMuted,
              fontWeight: 400,
              "& .rk-tracks-tabs-name": {
                borderBottom: "1px solid",
                borderColor: "transparent",
              },
              _selected: {
                color: main,
                "& .rk-tracks-tabs-name": {
                  borderColor: main,
                  fontWeight: 700,
                },
              },
              "& .rk-tracks-tabs-topic-divider": {
                marginLeft: "0.2rem",
                marginRight: "0.2rem",
              },
              "& .rk-tracks-tabs-topic-author": {
                marginLeft: "0.3rem",
                fontSize: "12px",
              },

              //_active: {
              //  bg: main,
              //},
              //_disabled: {
              //  opacity: 0.4,
              //  cursor: "not-allowed",
              //},
            },
          };
        },
      },
    },
  },
});
