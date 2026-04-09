import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export const About = () => {
  return (
    <Box>
      <Typography variant="h6" align="left" mb={2}>
        German-English Learning Tool
      </Typography>
      <Typography variant="body2" align="left" mb={3}>
        <Link
          href="https://www.amazon.com/Frequency-Dictionary-German-Vocabulary-Dictionaries/dp/1138659789"
          target="_blank"
          rel="noreferrer"
        >
          Source for the word data
        </Link>
      </Typography>
    </Box>
  );
};
