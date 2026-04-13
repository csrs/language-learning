import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SharedFormPaper } from "../SharedFormPaper/SharedFormPaper";
import { sharedAccentLinkSx } from "../../styles/sharedSx";

export const About = () => {
  return (
    <SharedFormPaper maxWidth={760}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
          <Typography
            variant="overline"
            sx={{ color: "success.dark", fontWeight: 700, letterSpacing: 1.1 }}
          >
            About
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mt: 0.5,
              fontWeight: 700,
              letterSpacing: -0.8,
              fontSize: { xs: "2rem", sm: "2.5rem" },
            }}
          >
            German-English learning, built around context
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 1.5,
              mx: "auto",
              maxWidth: 620,
              color: "text.secondary",
              lineHeight: 1.7,
            }}
          >
            This project is designed to help learners build German vocabulary
            through natural language, not isolated memorization.
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 2.25, sm: 3 },
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(248, 250, 252, 0.92) 100%)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Word data
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            The vocabulary in this project is based on a frequency dictionary
            from Anki.
          </Typography>
          <Box
            sx={{
              display: { xs: "block", sm: "flex" },
              gap: 1,
            }}
          >
            <Link
              href="https://ankiweb.net/shared/info/1431033948"
              target="_blank"
              underline="none"
              sx={sharedAccentLinkSx}
            >
              View the Anki deck
            </Link>
            <Link
              href="https://www.amazon.com/Frequency-Dictionary-German-Vocabulary-Dictionaries/dp/1138659789"
              target="_blank"
              underline="none"
              sx={sharedAccentLinkSx}
            >
              View the source reference
            </Link>
          </Box>
        </Box>
      </Stack>
    </SharedFormPaper>
  );
};
