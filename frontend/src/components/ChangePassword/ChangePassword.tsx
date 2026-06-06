import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { changePasswordSchema } from "../../validation/schemas";
import z from "zod";
import {
  SharedFormPaper,
  sharedFormErrorSx,
  sharedFormFieldSx,
  sharedSubmitButtonSx,
} from "../SharedFormPaper/SharedFormPaper";
import { updateCurrentUserPassword } from "../../api/generated/endpoints/me/me";

interface ChangePasswordProps {
  sx?: SxProps<Theme>;
}

export const ChangePassword = ({ sx }: ChangePasswordProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [shouldShowPassword, setShouldShowPassword] = useState(false);
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
      await updateCurrentUserPassword({ password });
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
    <SharedFormPaper maxWidth={520} sx={sx}>
      <Stack spacing={1} sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "success.dark", fontWeight: 700, letterSpacing: 1.1 }}
        >
          Security
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Change password
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            maxWidth: 340,
            mx: "auto",
          }}
        >
          Choose a new password with at least 8 characters to keep your account
          secure.
        </Typography>
      </Stack>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
      >
        {formError && (
          <Box sx={sharedFormErrorSx}>
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          </Box>
        )}
        <TextField
          label="Password"
          type={shouldShowPassword ? "text" : "password"}
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError || "Password must be at least 8 characters"}
          sx={sharedFormFieldSx}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      shouldShowPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={() => setShouldShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseUp={(e) => e.preventDefault()}
                    edge="end"
                    sx={{ color: "text.secondary" }}
                  >
                    {shouldShowPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!isSubmitButtonEnabled || isSubmitting}
          sx={sharedSubmitButtonSx}
        >
          {isSubmitting ? "Updating..." : "Change password"}
        </Button>
      </Box>
    </SharedFormPaper>
  );
};
