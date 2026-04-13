import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";

interface SharedFormPaperProps {
  children: ReactNode;
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}

export const sharedFormFieldSx: SxProps<Theme> = {
  textAlign: "left",
  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    transition:
      "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.92)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      boxShadow: "0 0 0 4px rgba(46, 125, 50, 0.08)",
    },
  },
  "& .MuiFormHelperText-root": {
    ml: 0.5,
    mt: 0.75,
    lineHeight: 1.5,
    color: "text.secondary",
  },
};

export const sharedFormErrorSx: SxProps<Theme> = {
  px: 1.5,
  py: 1.25,
  borderRadius: 2.5,
  textAlign: "left",
  border: "1px solid rgba(211, 47, 47, 0.18)",
  backgroundColor: "rgba(211, 47, 47, 0.08)",
};

export const sharedSubmitButtonSx: SxProps<Theme> = {
  mt: 0.5,
  minHeight: 52,
  borderRadius: 999,
  fontWeight: 700,
  textTransform: "none",
  background: "linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)",
  boxShadow: "0 16px 32px rgba(46, 125, 50, 0.24)",
  "&:hover": {
    background: "linear-gradient(135deg, #276a2b 0%, #317936 100%)",
    boxShadow: "0 18px 36px rgba(46, 125, 50, 0.28)",
  },
  "&.Mui-disabled": {
    pointerEvents: "auto",
    cursor: "not-allowed",
    background: "white",
    color: "black",
  },
};

export const SharedFormPaper = ({
  children,
  maxWidth = 460,
  sx,
}: SharedFormPaperProps) => {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          maxWidth,
          mx: "auto",
          mt: { xs: 0, sm: 4 },
          px: { xs: 2.25, sm: 3.5 },
          py: { xs: 2.5, sm: 3.75 },
          borderRadius: { xs: 0, sm: 5 },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.78) 100%), radial-gradient(circle at top right, rgba(46, 125, 50, 0.14), transparent 36%), radial-gradient(circle at bottom left, rgba(33, 150, 243, 0.08), transparent 30%)",
          boxShadow: {
            xs: "none",
            sm: "0 24px 60px rgba(15, 23, 42, 0.08)",
          },
          backdropFilter: "blur(10px)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 auto auto 0",
            width: "100%",
            height: 3,
            background:
              "linear-gradient(90deg, rgba(46, 125, 50, 0.9) 0%, rgba(46, 125, 50, 0.08) 70%, rgba(46, 125, 50, 0) 100%)",
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ position: "relative", zIndex: 1, width: "100%" }}>
        {children}
      </Box>
    </Paper>
  );
};
