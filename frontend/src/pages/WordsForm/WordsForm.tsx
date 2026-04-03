import { useState, type FormEvent } from "react";
import { z } from "zod";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { getWords } from "../../api/getWords";
import { Chip, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import styles from "./WordsForm.module.css";

export const WordsForm = () => {
  const [numOfWords, setNumOfWords] = useState<string>("10");
  const [language, setLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [words, setWords] = useState<any[]>([]);
  const [numOfWordsError, setNumOfWordsError] = useState("");

  const schema = z.object({
    numOfWords: z.string().max(2, { error: "Must be at most 99 characters" }),
  });

  const parsed = schema.safeParse({ numOfWords, language });
  const isSubmitButtonEnabled = parsed.success && !isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setNumOfWordsError("");
    setWords([]);
    const result = schema.safeParse({ numOfWords, language });
    if (!result.success) {
      const flat = result.error.flatten();
      setNumOfWordsError(flat.fieldErrors.numOfWords?.[0] ?? "");
      setFormError(flat.formErrors[0] ?? "");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiResult = await getWords(Number(numOfWords), language);
      setWords(apiResult);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to fetch words",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 4400, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Typography variant="h6" align="center" mb={2}>
          Fetch Words in order of frequency usage in the language
        </Typography>
        <Typography variant="body2" align="left" mb={3}>
          <p>
            German words are the top n words in the language, by frequency usage
            based off of written usage.
          </p>
          <p>
            English words are the direct translations (or multiple translations)
            of these top German words. Source:
            <a href="https://ankiweb.net/shared/info/1431033948">
              Anki Flashcards Deck
            </a>
          </p>

          <p>
            Verbs are either (in English) the infinitive form or (in German)
            various verb tenses for the given verb.
          </p>
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          )}
          <TextField
            type="number"
            label="NumberofWords"
            value={numOfWords}
            onChange={(e) => setNumOfWords(e.target.value)}
            disabled={isSubmitting}
            required
            error={!!numOfWordsError}
            helperText={numOfWordsError || "1-99 words"}
            slotProps={{ htmlInput: { min: 1, max: 99 } }}
          />
          <FormControl fullWidth required>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isSubmitting}
              className={styles.countrySelect}
            >
              <MenuItem value="en">English (en)</MenuItem>
              <MenuItem value="de">German (de)</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={!isSubmitButtonEnabled}
          >
            {isSubmitting ? "Fetching words..." : "Fetch Words"}
          </Button>
        </Box>
        {words.length > 0 && (
          <Box mt={1} className={styles.resultsBox}>
            {words.map((word) => (
              <Chip key={word.id} label={word.value} sx={{ mx: 0.5 }} />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
