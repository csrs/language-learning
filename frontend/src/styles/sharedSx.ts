import type { SxProps, Theme } from "@mui/material/styles";

export const sharedAccentLinkSx: SxProps<Theme> = {
  display: "inline-block",
  mt: 1.5,
  px: 1.75,
  py: 1,
  borderRadius: 999,
  fontFamily: "default",
  fontWeight: 600,
  color: "success.dark",
  backgroundColor: "rgba(46, 125, 50, 0.1)",
  border: "1px solid rgba(46, 125, 50, 0.18)",
  "&:hover": {
    backgroundColor: "rgba(46, 125, 50, 0.16)",
  },
};
