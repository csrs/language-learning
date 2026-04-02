import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "white",
        textAlign: "center",
        p: 2,
        mt: "auto",
      }}
    >
      <Typography variant="body2">Work-in-progress</Typography>
    </Box>
  );
};
