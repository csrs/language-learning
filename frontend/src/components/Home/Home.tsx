import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { WordsForm } from "../../pages/WordsForm/WordsForm";

export const Home = () => {
  return (
    <Box sx={{ textAlign: "center", py: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h3" gutterBottom>
        Language Learning
        <WordsForm />
      </Typography>
    </Box>
  );
};
