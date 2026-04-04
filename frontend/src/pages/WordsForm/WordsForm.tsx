import { useState, type FormEvent } from "react";
import { z } from "zod";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { getWords } from "../../api/getWords";
import { Chip } from "@mui/material";
import styles from "./WordsForm.module.css";

export const WordsForm = () => {
  const [numOfWords, setNumOfWords] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [words, setWords] = useState<any[]>([]);
  const [numOfWordsError, setNumOfWordsError] = useState("");

  const schema = z.object({
    numOfWords: z.string().max(2, { error: "Must be at most 99 characters" }),
  });

  const parsed = schema.safeParse({ numOfWords });
  const isSubmitButtonEnabled = parsed.success && !isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setNumOfWordsError("");
    setWords([]);
    const result = schema.safeParse({ numOfWords });
    if (!result.success) {
      const flat = result.error.flatten();
      setNumOfWordsError(flat.fieldErrors.numOfWords?.[0] ?? "");
      setFormError(flat.formErrors[0] ?? "");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiResult = await getWords(numOfWords);
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
          Fetch Words in order of frequency usage in German
        </Typography>
        <Typography variant="body2" align="left" mb={3}>
          <p>
            German words are the top n words in the language, by frequency usage
            based off of written usage.
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
            label="Number of Words"
            value={numOfWords}
            onChange={(e) => setNumOfWords(e.target.value)}
            disabled={isSubmitting}
            required
            error={!!numOfWordsError}
            helperText={numOfWordsError || "Between 1 and 99"}
            slotProps={{ htmlInput: { min: 1, max: 99 } }}
          />

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
