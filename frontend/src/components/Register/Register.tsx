import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";
import { registerSchema } from "../../validation/schemas";
import { IconButton, Stack } from "@mui/material";
import z from "zod";
import {
  SharedFormPaper,
  sharedFormErrorSx,
  sharedFormFieldSx,
  sharedSubmitButtonSx,
} from "../SharedFormPaper/SharedFormPaper";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined,
  );
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [shouldShowPassword, setShouldShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const parsedInput = registerSchema.safeParse({ username, email, password });
  const isSubmitButtonEnabled = parsedInput.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!parsedInput.success) {
      const flattenedError = z.flattenError(parsedInput.error);
      setUsernameError(flattenedError.fieldErrors.username?.[0]);
      setEmailError(flattenedError.fieldErrors.email?.[0]);
      setPasswordError(flattenedError.fieldErrors.password?.[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/login");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
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
          Account
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Create your account
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
          helperText={
            usernameError || "Username must be between 2 and 20 characters"
          }
          sx={sharedFormFieldSx}
        />
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          error={!!emailError}
          helperText={emailError || "Email must be a valid email address"}
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
          disabled={!isSubmitButtonEnabled || isSubmitting}
          sx={sharedSubmitButtonSx}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </Box>
    </SharedFormPaper>
  );
};
