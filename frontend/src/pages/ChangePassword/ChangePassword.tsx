import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { changePassword } from "../../api/changePassword";
import { changePasswordSchema } from "../../validation/schemas";
import z from "zod";

export const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const parsedInput = changePasswordSchema.safeParse({ password });
  const isSubmitButtonEnabled = parsedInput.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(undefined);
    setFormError(undefined);

    if (!parsedInput.success) {
      const flattenedError = z.flattenError(parsedInput.error);
      setPasswordError(flattenedError.fieldErrors.password?.[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(password);
      navigate("/");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Password change failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Paper sx={{ p: 3 }} elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Change password
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
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError || "Password must be at least 8 characters"}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!isSubmitButtonEnabled || isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Change password"}
        </Button>
      </Box>
    </Paper>
  );
};
