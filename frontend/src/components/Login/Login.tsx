import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";
import { loginSchema } from "../../validation/schemas";
import { IconButton, Stack } from "@mui/material";
import z from "zod";
import {
  SharedFormPaper,
  sharedFormErrorSx,
  sharedFormFieldSx,
  sharedSubmitButtonSx,
} from "../SharedFormPaper/SharedFormPaper";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined,
  );
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [shouldShowPassword, setShouldShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const parsedInput = loginSchema.safeParse({ username, password });
  // const isSubmitButtonEnabled = parsedInput.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!parsedInput.success) {
      const flattenedError = z.flattenError(parsedInput.error);
      setUsernameError(flattenedError.fieldErrors.username?.[0]);
      setPasswordError(flattenedError.fieldErrors.password?.[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password.trim());
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SharedFormPaper>
      <Stack spacing={1} sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "success.dark", fontWeight: 700, letterSpacing: 1.1 }}
        >
          Welcome back
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Log in
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            mx: "auto",
          }}
        >
          work in progress
        </Typography>
      </Stack>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.25,
          width: "100%",
        }}
      >
        {formError && (
          <Box sx={sharedFormErrorSx}>
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          </Box>
        )}
        <TextField
          label="Username"
          type="text"
          required
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          error={!!usernameError}
          helperText={usernameError}
          sx={sharedFormFieldSx}
        />
        <TextField
          label="Password"
          type={shouldShowPassword ? "text" : "password"}
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError}
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
                    {shouldShowPassword ? (
                      <Typography variant="caption">hide</Typography>
                    ) : (
                      <Typography variant="caption">show</Typography>
                    )}
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
          // disabled={!isSubmitButtonEnabled || isSubmitting}
          disabled
          sx={sharedSubmitButtonSx}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </SharedFormPaper>
  );
};
