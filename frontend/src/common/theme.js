import { createMuiTheme } from "@material-ui/core/styles";

export const DARK_BLUE = "#173e6c";
export const LIGHT_BLUE = "#97c7ef";

export const NAV_BAR_HEIGHT = 64;

export const CustomTheme = createMuiTheme({
  palette: {
    primary: {
      main: DARK_BLUE,
    },
    secondary: {
      main: LIGHT_BLUE,
      contrastText: DARK_BLUE,
    },
  },
  typography: {
    fontFamily: ["Montserrat", "Sans-serif"].join(","),
    useNextVariants: true,
  },
  overrides: {
    MuiButton: {
      root: {
        // margin: 8,
        // borderRadius: 25,
        fontWeight: 550,
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: "10",
      },
    },
  },
  // props: {
  //   MuiGrid: {
  //     spacing: 24,
  //   }
  // }
});
