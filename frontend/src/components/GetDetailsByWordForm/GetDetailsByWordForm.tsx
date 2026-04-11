import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getWordByValueRequestSchema } from "../../validation/schemas";
import z from "zod";
import { SharedFormPaper } from "../../components/SharedFormPaper/SharedFormPaper";
import { getWordByValue, type WordDetailsResponse } from "../../api/getWords";
import {
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

export const GetDetailsByWordForm = () => {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState<"de" | "en">("de");
  const [results, setResults] = useState<WordDetailsResponse[] | null>(null);
  const [valueError, setValueError] = useState<string | undefined>(undefined);

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedInput = getWordByValueRequestSchema.safeParse({
    value,
    language,
  });
  const isSubmitButtonEnabled = parsedInput.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValueError(undefined);
    setFormError(undefined);

    if (!parsedInput.success) {
      const flattenedError = z.flattenError(parsedInput.error);
      setValueError(flattenedError.fieldErrors.value?.[0]);
      return;
    }

    if (!value) {
      setValueError("Input is required");
      return;
    }

    setIsSubmitting(true);
    setResults(null);
    try {
      const res = await getWordByValue(value.trim(), language);
      setResults(res);
    } catch (err) {
      setResults(null);
      setFormError(
        err instanceof Error ? err.message : "Getting details of word failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SharedFormPaper>
        <Typography variant="h5" align="center" gutterBottom>
          Get Details By Word
        </Typography>
        <Typography variant="body2" align="left" mb={2}>
          Note: Searching for 'die' or 'das' in German will return all of the
          available feminine or neutral nouns. This is because Anki doesn't have
          a stand-alone card for 'die' nor 'das', only 'der'.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          )}
          <TextField
            label="German or English word"
            type="text"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSubmitting}
            error={!!valueError}
            helperText={valueError}
          />
          <FormControl fullWidth>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value as "de" | "en")}
            >
              <MenuItem value="de">German</MenuItem>{" "}
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={!isSubmitButtonEnabled || isSubmitting}
          >
            {isSubmitting ? "Fetching details in..." : "Get Details"}
          </Button>
        </Box>
      </SharedFormPaper>
      {results && (
        <Box
          sx={{
            mt: 4,
            maxWidth: 960,
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6">
              {results.length === 1
                ? "1 matched word"
                : `${results.length} matched words`}
            </Typography>
            {results.length === 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary">
                    No meanings or example sentences available.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              results.map((word) => (
                <Card key={word.id} elevation={3}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          Matched word
                        </Typography>
                        <Typography variant="h5">{word.value}</Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          sx={{ mt: 1.5 }}
                        >
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Language: ${word.language.value.toUpperCase()}`}
                          />
                          <Chip
                            size="small"
                            color="primary"
                            variant={
                              word.frequencyRank == null ? "outlined" : "filled"
                            }
                            label={
                              word.frequencyRank == null
                                ? "No frequency rank"
                                : `Frequency rank: ${word.frequencyRank}`
                            }
                          />
                        </Stack>
                      </Box>

                      {word.meanings.length === 0 ? (
                        <Typography color="text.secondary">
                          No meanings or example sentences available.
                        </Typography>
                      ) : (
                        <Stack spacing={2}>
                          {word.meanings.map((meaning) => (
                            <Box
                              key={meaning.id}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                px: { xs: 2, sm: 2.5 },
                                py: 2,
                                backgroundColor: "background.default",
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Part of speech
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {meaning.partOfSpeech.value}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Target sentence
                                  </Typography>
                                  <Typography>
                                    {meaning.exampleTarget}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Base sentence
                                  </Typography>
                                  <Typography>{meaning.exampleBase}</Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Translations
                                  </Typography>
                                  {meaning.translations.length === 0 ? (
                                    <Typography color="text.secondary">
                                      No translations available.
                                    </Typography>
                                  ) : (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      useFlexGap
                                      flexWrap="wrap"
                                      sx={{ mt: 1 }}
                                    >
                                      {meaning.translations.map(
                                        (translation) => (
                                          <Chip
                                            key={translation.id}
                                            label={translation.toWord.value}
                                            variant="outlined"
                                          />
                                        ),
                                      )}
                                    </Stack>
                                  )}
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      )}
    </>
  );
};
