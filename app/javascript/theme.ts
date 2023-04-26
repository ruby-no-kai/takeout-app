import { extendTheme } from "@chakra-ui/react";

const main = "#333333"; // 2023 main,primary,default-text
const accent = "#ba083d"; // 2023 accent red
//
export const Colors = {
  // for chat pinned bg
  baseLight: "#ffffff", // 2023 main

  main: main,
  mainLight: accent, // nazo

  accent: accent,
  link: "#3e6199",
  linkHover: "#2364c9",
  lightGray: "#BFC6C9",

  bg: "#f8f8f8", // 2023

  secondary: "#7C757D",
  secondaryText: "#767077",

  dark: "#41414F", // 2022

  textDefault: "#333333", // 2023
  textAccent: accent,
  textMuted: "#7d7167", // 2023

  backgroundColor: "#f8f8f8", // 2023 bg

  border: "#DFDFDF",
  chatBorder: "#CED4DA", // TODO:
  chatBorder2: "#E0E0E0", // TODO:
  chatBg: "#F9F9F9",

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
    heading: "Poppins",
    body: "Roboto",
  },
  styles: {
    global: {
      body: {
        color: Colors.textDefault,
        backgroundColor: Colors.backgroundColor,
      },
      "::placeholder": {
        color: Colors.textDefault,
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
        "rk-tracks": (_props: unknown) => {
          return {
            tablist: {
              borderBottom: "1px solid",
              borderColor: Colors.border,
              backgroundColor: "#FFFFFF",
            },
            tab: {
              backgroundColor: "#FFFFFF",
              color: Colors.textDefault,
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
