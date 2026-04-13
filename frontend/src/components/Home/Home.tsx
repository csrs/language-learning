import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const Home = () => {
  return (
    <Box
      sx={{
        mt: { xs: 2, md: 4 },
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 5, sm: 6, md: 8 },
        borderRadius: { xs: 4, sm: 6 },
        background:
          "radial-gradient(circle at top left, rgba(46, 125, 50, 0.18), transparent 35%), linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(232, 245, 233, 0.9) 45%, rgba(227, 242, 253, 0.95) 100%)",
        border: "1px solid",
        borderColor: "rgba(15, 23, 42, 0.08)",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        textAlign="center"
        sx={{ maxWidth: 760, mx: "auto" }}
      >
        <Chip
          label="Context-first German learning"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.3,
            color: "success.dark",
            backgroundColor: "rgba(46, 125, 50, 0.12)",
            border: "1px solid rgba(46, 125, 50, 0.18)",
          }}
        />

        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "2.3rem", sm: "3rem", md: "3.5rem" },
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "text.primary",
            maxWidth: 680,
          }}
        >
          Learn German through real context
        </Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: 620,
            color: "text.secondary",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Practice with natural paragraphs, discover word meanings as you go,
          and track the vocabulary you truly understand.
        </Typography>

        <Box
          sx={{
            maxWidth: 560,
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Work in progress: account registration and authentication are not
            yet connected to the language-learning experience.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
