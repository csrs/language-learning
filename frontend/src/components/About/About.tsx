import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export const About = () => {
  return (
    <Box>
      <Typography variant="h6" align="left" mb={2}>
        German words in order of frequency usage
      </Typography>
      <Typography variant="body2" align="left" mb={3}>
        German words are the top n words in the language, by frequency usage
        based off of written usage. [
        <Link
          href="https://www.amazon.com/Frequency-Dictionary-German-Vocabulary-Dictionaries/dp/1138659789"
          target="_blank"
          rel="noreferrer"
        >
          Source
        </Link>
      </Typography>
    </Box>
  );
};
