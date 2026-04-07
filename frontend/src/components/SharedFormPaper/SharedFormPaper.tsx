import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";

interface SharedFormPaperProps {
  children: ReactNode;
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}

export const SharedFormPaper = ({ children, sx }: SharedFormPaperProps) => {
  return (
    <Paper
      elevation={3}
      sx={[
        {
          width: { sm: "400px" },
          textAlign: "center",
          m: "24px auto 0 auto",
          p: 3,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Paper>
  );
};
